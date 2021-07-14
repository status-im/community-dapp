pragma solidity ^0.8.5;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './Directory.sol';

contract MockContract {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    uint256 private constant VOTING_LENGTH = 1000;

    enum VoteType {
        REMOVE,
        ADD
    }

    struct VotingRoom {
        uint256 startBlock;
        uint256 endAt;
        VoteType voteType;
        bool finalized;
        address community;
        uint256 totalVotesFor;
        uint256 totalVotesAgainst;
        uint256 roomNumber;
        mapping(address => bool) voted;
        address[] voters;
    }

    event VotingRoomStarted(uint256 roomId, address publicKey);
    event VotingRoomFinalized(uint256 roomId, address publicKey, bool passed, VoteType voteType);

    address public owner;
    Directory public directory;

    uint256 private latestVoting = 1;
    mapping(uint256 => VotingRoom) public votingRoomMap;
    mapping(address => uint256) public communityVotingId;

    uint256[] public activeVotingRooms;
    mapping(uint256 => uint256) private indexOfActiveVotingRooms;

    constructor() {
        owner = msg.sender;
    }

    function setDirectory(Directory _address) public {
        require(msg.sender == owner, 'Not owner');
        directory = _address;
    }

    function getCommunityVoting(address publicKey)
        public
        view
        returns (
            uint256 startBlock,
            uint256 endAt,
            VoteType voteType,
            bool finalized,
            address community,
            uint256 totalVotesFor,
            uint256 totalVotesAgainst,
            uint256 roomNumber
        )
    {
        startBlock = votingRoomMap[communityVotingId[publicKey]].startBlock;
        endAt = votingRoomMap[communityVotingId[publicKey]].endAt;
        voteType = votingRoomMap[communityVotingId[publicKey]].voteType;
        finalized = votingRoomMap[communityVotingId[publicKey]].finalized;
        community = votingRoomMap[communityVotingId[publicKey]].community;
        totalVotesFor = votingRoomMap[communityVotingId[publicKey]].totalVotesFor;
        totalVotesAgainst = votingRoomMap[communityVotingId[publicKey]].totalVotesAgainst;
        roomNumber = votingRoomMap[communityVotingId[publicKey]].roomNumber;
    }

    function getActiveVotingRooms() public view returns (uint256[] memory) {
        return activeVotingRooms;
    }

    function listRoomVoters(uint256 roomId) public view returns (address[] memory) {
        return votingRoomMap[roomId].voters;
    }

    function initializeVotingRoom(
        VoteType voteType,
        address publicKey,
        uint256 voteAmount
    ) public {
        require(communityVotingId[publicKey] == 0, 'vote already ongoing');
        if (voteType == VoteType.REMOVE) {
            require(directory.isCommunityInDirectory(publicKey), 'Community not in directory');
        }
        if (voteType == VoteType.ADD) {
            require(!directory.isCommunityInDirectory(publicKey), 'Community already in directory');
        }
        VotingRoom storage newVotingRoom = votingRoomMap[latestVoting];
        newVotingRoom.startBlock = block.number;
        newVotingRoom.endAt = block.timestamp.add(VOTING_LENGTH);
        newVotingRoom.voteType = voteType;
        newVotingRoom.community = publicKey;
        newVotingRoom.roomNumber = latestVoting;
        newVotingRoom.totalVotesFor = voteAmount;
        newVotingRoom.voted[msg.sender] = true;
        newVotingRoom.voters.push(msg.sender);
        communityVotingId[publicKey] = latestVoting;

        activeVotingRooms.push(latestVoting);
        indexOfActiveVotingRooms[latestVoting] = activeVotingRooms.length;

        emit VotingRoomStarted(latestVoting++, publicKey);
    }

    function finalizeVotingRoom(uint256 roomId) public {
        require(roomId > 0, 'vote not found');
        require(roomId < latestVoting, 'vote not found');
        require(votingRoomMap[roomId].finalized == false, 'vote already finalized');
        require(votingRoomMap[roomId].endAt < block.timestamp, 'vote still ongoing');
        votingRoomMap[roomId].finalized = true;
        address community = votingRoomMap[roomId].community;
        communityVotingId[community] = 0;

        uint256 index = indexOfActiveVotingRooms[roomId];
        if (index == 0) return;
        index--;
        if (activeVotingRooms.length > 1) {
            activeVotingRooms[index] = activeVotingRooms[activeVotingRooms.length - 1];
            indexOfActiveVotingRooms[activeVotingRooms[index]] = index + 1;
        }
        activeVotingRooms.pop();
        bool passed = votingRoomMap[roomId].totalVotesFor > votingRoomMap[roomId].totalVotesAgainst;
        if (passed) {
            if (votingRoomMap[roomId].voteType == VoteType.ADD) {
                directory.addCommunity(community);
            }
            if (votingRoomMap[roomId].voteType == VoteType.REMOVE) {
                directory.removeCommunity(community);
            }
        }
        emit VotingRoomFinalized(roomId, community, passed, votingRoomMap[roomId].voteType);
    }

    struct SignedVote {
        address voter;
        uint256 roomIdAndType;
        uint256 sntAmount;
        bytes32 r;
        bytes32 vs;
    }
    event VoteCast(uint256 roomId, address voter);

    function castVotes(SignedVote[] calldata votes) public {
        for (uint256 i = 0; i < votes.length; i++) {
            SignedVote calldata vote = votes[i];
            bytes32 hashed = keccak256(
                abi.encodePacked('\x19Ethereum Signed Message:\n84', vote.voter, vote.roomIdAndType, vote.sntAmount)
            );
            if (hashed.recover(abi.encode(vote.r, vote.vs)) == vote.voter) {
                uint256 roomId = vote.roomIdAndType >> 1;
                require(roomId > 0, 'vote not found');
                require(roomId < latestVoting, 'vote not found');
                VotingRoom storage room = votingRoomMap[roomId];
                require(room.endAt > block.timestamp, 'vote closed');
                if (room.voted[vote.voter] == false) {
                    if (vote.roomIdAndType & 1 == 1) {
                        room.totalVotesFor = room.totalVotesFor.add(vote.sntAmount);
                    } else {
                        room.totalVotesAgainst = room.totalVotesAgainst.add(vote.sntAmount);
                    }
                    room.voters.push(vote.voter);
                    room.voted[vote.voter] = true;
                    emit VoteCast(roomId, vote.voter);
                }
            }
        }
    }
}
