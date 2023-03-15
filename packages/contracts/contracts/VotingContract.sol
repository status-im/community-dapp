// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.5;

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
    mapping(bytes => uint256) public communityVotingId;
    mapping(bytes => uint256[]) private communityVotingHistory;
    mapping(uint256 => mapping(address => bool)) private voted;
    uint256[] public activeVotingRooms;
    mapping(uint256 => uint256) private indexOfActiveVotingRooms;

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
        VotingRoom memory newVotingRoom;
        votingRooms.push(newVotingRoom);
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

    function getCommunityVoting(bytes calldata publicKey) public view returns (VotingRoom memory) {
        return votingRooms[communityVotingId[publicKey]];
    }

    function getActiveVotingRooms() public view returns (uint256[] memory) {
        return activeVotingRooms;
    }

    function listRoomVoters(uint256 roomId) public view returns (address[] memory) {
        return votingRooms[roomId].voters;
    }

    function getCommunityHistory(bytes calldata publicKey) public view returns (VotingRoom[] memory returnVotingRooms) {
        returnVotingRooms = new VotingRoom[](communityVotingHistory[publicKey].length);
        for (uint256 i = 0; i < communityVotingHistory[publicKey].length; i++) {
            returnVotingRooms[i] = votingRooms[communityVotingHistory[publicKey][i]];
        }
    }

    function initializeVotingRoom(VoteType voteType, bytes calldata publicKey, uint256 voteAmount) public {
        require(communityVotingId[publicKey] == 0, 'vote already ongoing');
        if (voteType == VoteType.REMOVE) {
            require(directory.isCommunityInDirectory(publicKey), 'Community not in directory');
        }
        if (voteType == VoteType.ADD) {
            require(!directory.isCommunityInDirectory(publicKey), 'Community already in directory');
        }
        uint256 historyLength = communityVotingHistory[publicKey].length;
        if (historyLength > 0) {
            uint256 roomId = communityVotingHistory[publicKey][historyLength - 1];
            require(
                block.timestamp.sub(votingRooms[roomId].endAt) > TIME_BETWEEN_VOTING,
                'Community was in a vote recently'
            );
        }
        require(token.balanceOf(msg.sender) >= voteAmount, 'not enough token');
        communityVotingId[publicKey] = votingRooms.length;
        communityVotingHistory[publicKey].push(votingRooms.length);
        activeVotingRooms.push(votingRooms.length);
        indexOfActiveVotingRooms[votingRooms.length] = activeVotingRooms.length;

        VotingRoom memory newVotingRoom;
        newVotingRoom.startBlock = block.number;
        newVotingRoom.endAt = block.timestamp.add(VOTING_LENGTH);
        newVotingRoom.voteType = voteType;
        newVotingRoom.community = publicKey;
        newVotingRoom.roomNumber = votingRooms.length;
        newVotingRoom.totalVotesFor = voteAmount;
        voted[votingRooms.length][msg.sender] = true;

        votingRooms.push(newVotingRoom);
        votingRooms[votingRooms.length - 1].voters.push(msg.sender);

        emit VotingRoomStarted(votingRooms.length - 1, publicKey);
    }

    function finalizeVotingRoom(uint256 roomId) public {
        require(roomId > 0, 'vote not found');
        require(roomId < votingRooms.length, 'vote not found');
        require(votingRooms[roomId].finalized == false, 'vote already finalized');
        require(votingRooms[roomId].endAt < block.timestamp, 'vote still ongoing');
        votingRooms[roomId].finalized = true;
        votingRooms[roomId].endAt = block.timestamp;
        bytes memory community = votingRooms[roomId].community;
        communityVotingId[community] = 0;

        uint256 index = indexOfActiveVotingRooms[roomId];
        if (index == 0) return;
        index--;
        if (activeVotingRooms.length > 1) {
            activeVotingRooms[index] = activeVotingRooms[activeVotingRooms.length - 1];
            indexOfActiveVotingRooms[activeVotingRooms[index]] = index + 1;
        }
        activeVotingRooms.pop();
        bool passed = votingRooms[roomId].totalVotesFor > votingRooms[roomId].totalVotesAgainst;
        if (passed) {
            if (votingRooms[roomId].voteType == VoteType.ADD) {
                directory.addCommunity(community);
            }
            if (votingRooms[roomId].voteType == VoteType.REMOVE) {
                directory.removeCommunity(community);
            }
        }
        emit VotingRoomFinalized(roomId, community, passed, votingRooms[roomId].voteType);
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
                require(roomId > 0, 'vote not found');
                require(roomId < votingRooms.length, 'vote not found');
                VotingRoom storage room = votingRooms[roomId];
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
