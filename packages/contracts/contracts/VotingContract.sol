// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './Directory.sol';

// Uncomment this line to use console.log
// import 'hardhat/console.sol';

contract VotingContract {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    uint256 private constant VOTING_LENGTH = 1000;
    uint256 private constant TIME_BETWEEN_VOTING = 3600;
    enum VoteType {
        REMOVE,
        ADD
    }

    struct VotingRoom {
        uint256 startBlock;
        uint256 endAt;
        VoteType voteType;
        bool finalized;
        bytes community;
        uint256 totalVotesFor;
        uint256 totalVotesAgainst;
        uint256 roomNumber;
        address[] voters;
    }

    event VotingRoomStarted(uint256 roomId, bytes publicKey);
    event VotingRoomFinalized(uint256 roomId, bytes publicKey, bool passed, VoteType voteType);

    address public owner;
    Directory public directory;
    IERC20 public token;

    VotingRoom[] public votingRooms;
    mapping(bytes => uint256) public activeRoomIDByCommunityID;
    mapping(bytes => uint256[]) private roomIDsByCommunityID;
    mapping(uint256 => mapping(address => bool)) private voted;

    bytes32 private constant EIP712DOMAIN_TYPEHASH =
        keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)');

    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    bytes32 private DOMAIN_SEPARATOR;

    function hash(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712DOMAIN_TYPEHASH,
                    keccak256(bytes(eip712Domain.name)),
                    keccak256(bytes(eip712Domain.version)),
                    eip712Domain.chainId,
                    eip712Domain.verifyingContract
                )
            );
    }

    bytes32 public constant VOTE_TYPEHASH = keccak256('Vote(uint256 roomIdAndType,uint256 sntAmount,address voter)');

    function hash(Vote calldata vote) internal pure returns (bytes32) {
        return keccak256(abi.encode(VOTE_TYPEHASH, vote.roomIdAndType, vote.sntAmount, vote.voter));
    }

    function verify(Vote calldata vote, bytes32 r, bytes32 vs) internal view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked('\x19\x01', DOMAIN_SEPARATOR, hash(vote)));
        return digest.recover(r, vs) == vote.voter;
    }

    constructor(IERC20 _address) {
        owner = msg.sender;
        token = _address;
        DOMAIN_SEPARATOR = hash(
            EIP712Domain({
                name: 'Voting Contract',
                version: '1',
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );
    }

    function setDirectory(Directory _address) public {
        require(msg.sender == owner, 'Not owner');
        directory = _address;
    }

    /// Voting room with `ID` doesn't exist.
    error VotingRoomDoesntExist(uint256 ID);

    /// Room `ID` must be greater than 0.
    error InvalidRoomID(uint256 ID);

    modifier onlyIfVotingRoomExists(uint256 ID) {
        if (ID < 1) revert InvalidRoomID(ID);
        if (ID > votingRooms.length) revert VotingRoomDoesntExist(ID);
        _;
    }

    function _getVotingRoom(uint256 roomID) private view onlyIfVotingRoomExists(roomID) returns (VotingRoom storage) {
        return votingRooms[roomID - 1];
    }

    function getCommunityVoting(bytes calldata publicKey) public view returns (VotingRoom memory) {
        return _getVotingRoom(activeRoomIDByCommunityID[publicKey]);
    }

    function getActiveVotingRooms() public view returns (uint256[] memory) {
        uint256[] memory returnVotingRooms = new uint256[](votingRooms.length);
        uint256 count = 0;
        for (uint256 i = 0; i < votingRooms.length; i++) {
            if (!votingRooms[i].finalized) {
                returnVotingRooms[count] = votingRooms[i].roomNumber;
                count++;
            }
        }
        // Resize the array to remove any unused elements
        assembly {
            mstore(returnVotingRooms, count)
        }
        return returnVotingRooms;
    }

    function listRoomVoters(uint256 roomId) public view returns (address[] memory) {
        return _getVotingRoom(roomId).voters;
    }

    function getCommunityHistory(bytes calldata publicKey) public view returns (VotingRoom[] memory returnVotingRooms) {
        returnVotingRooms = new VotingRoom[](roomIDsByCommunityID[publicKey].length);
        for (uint256 i = 0; i < roomIDsByCommunityID[publicKey].length; i++) {
            returnVotingRooms[i] = _getVotingRoom(roomIDsByCommunityID[publicKey][i]);
        }
    }

    function initializeVotingRoom(VoteType voteType, bytes calldata publicKey, uint256 voteAmount) public {
        require(activeRoomIDByCommunityID[publicKey] == 0, 'vote already ongoing');
        if (voteType == VoteType.REMOVE) {
            require(directory.isCommunityInDirectory(publicKey), 'Community not in directory');
        }
        if (voteType == VoteType.ADD) {
            require(!directory.isCommunityInDirectory(publicKey), 'Community already in directory');
        }
        uint256 historyLength = roomIDsByCommunityID[publicKey].length;
        if (historyLength > 0) {
            uint256 roomId = roomIDsByCommunityID[publicKey][historyLength - 1];
            require(
                block.timestamp.sub(_getVotingRoom(roomId).endAt) > TIME_BETWEEN_VOTING,
                'Community was in a vote recently'
            );
        }
        require(token.balanceOf(msg.sender) >= voteAmount, 'not enough token');

        uint votingRoomID = votingRooms.length + 1;

        activeRoomIDByCommunityID[publicKey] = votingRoomID;
        roomIDsByCommunityID[publicKey].push(votingRoomID);

        VotingRoom memory newVotingRoom;
        newVotingRoom.startBlock = block.number;
        newVotingRoom.endAt = block.timestamp.add(VOTING_LENGTH);
        newVotingRoom.voteType = voteType;
        newVotingRoom.community = publicKey;
        newVotingRoom.roomNumber = votingRoomID;
        newVotingRoom.totalVotesFor = voteAmount;
        voted[votingRoomID][msg.sender] = true;

        votingRooms.push(newVotingRoom);
        _getVotingRoom(votingRoomID).voters.push(msg.sender);

        emit VotingRoomStarted(votingRoomID, publicKey);
    }

    function finalizeVotingRoom(uint256 roomId) public {
        VotingRoom storage votingRoom = _getVotingRoom(roomId);

        require(votingRoom.finalized == false, 'vote already finalized');
        require(votingRoom.endAt < block.timestamp, 'vote still ongoing');

        votingRoom.finalized = true;
        votingRoom.endAt = block.timestamp;
        activeRoomIDByCommunityID[votingRoom.community] = 0;

        bool passed = votingRoom.totalVotesFor > votingRoom.totalVotesAgainst;
        if (passed) {
            if (votingRoom.voteType == VoteType.ADD) {
                directory.addCommunity(votingRoom.community);
            }
            if (votingRoom.voteType == VoteType.REMOVE) {
                directory.removeCommunity(votingRoom.community);
            }
        }
        emit VotingRoomFinalized(roomId, votingRoom.community, passed, votingRoom.voteType);
    }

    event VoteCast(uint256 roomId, address voter);
    event NotEnoughToken(uint256 roomId, address voter);

    struct Vote {
        address voter;
        uint256 roomIdAndType;
        uint256 sntAmount;
        bytes32 r;
        bytes32 vs;
    }

    function castVotes(Vote[] calldata votes) public {
        for (uint256 i = 0; i < votes.length; i++) {
            Vote calldata vote = votes[i];

            if (verify(vote, vote.r, vote.vs)) {
                uint256 roomId = vote.roomIdAndType >> 1;
                VotingRoom storage room = _getVotingRoom(roomId);

                require(room.endAt > block.timestamp, 'vote closed');
                require(!room.finalized, 'room finalized');

                if (voted[roomId][vote.voter] == false) {
                    if (token.balanceOf(vote.voter) >= vote.sntAmount) {
                        if (vote.roomIdAndType & 1 == 1) {
                            room.totalVotesFor = room.totalVotesFor.add(vote.sntAmount);
                        } else {
                            room.totalVotesAgainst = room.totalVotesAgainst.add(vote.sntAmount);
                        }
                        room.voters.push(vote.voter);
                        voted[roomId][vote.voter] = true;
                        emit VoteCast(roomId, vote.voter);
                    } else {
                        emit NotEnoughToken(roomId, vote.voter);
                    }
                }
            }
        }
    }
}
