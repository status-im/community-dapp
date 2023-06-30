// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './Directory.sol';

// Uncomment this line to use console.log
// import 'hardhat/console.sol';

contract FeaturedVotingContract {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    struct Voting {
        uint256 id;
        uint256 startBlock;
        uint256 startAt;
        uint256 verificationStartAt;
        uint256 endAt;
        bool finalized;
    }

    struct Vote {
        address voter;
        bytes community;
        uint256 sntAmount;
    }

    struct SignedVote {
        address voter;
        bytes community;
        uint256 sntAmount;
        uint256 timestamp;
        bytes32 r;
        bytes32 vs;
    }

    struct CommunityVotes {
        bytes community;
        uint256 totalSntAmount; // make it snt agnostic
    }

    event VotingStarted();
    event VotingFinalized();

    event VoteCast(bytes community, address voter);
    event NotEnoughToken(bytes community, address voter);
    event AlreadyVoted(bytes community, address voter);
    event InvalidSignature(bytes community, address voter);
    event CommunityFeaturedRecently(bytes community, address voter);
    event CommunityNotInDirectory(bytes community, address voter); // TODO: use me

    address public owner;
    Directory public directory;
    IERC20 public token;

    uint256 public votingLength;
    uint256 public votingVerificationLength;
    uint256 public featuredPerVotingCount;
    uint256 public cooldownPeriod;

    Voting[] public votings;
    mapping(uint256 => Vote[]) private votesByVotingID;
    mapping(uint256 => bytes[]) private featuredByVotingID;
    mapping(uint256 => mapping(bytes => mapping(address => bool))) private votersByCommunityByVotingID;

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

    bytes32 public constant VOTE_TYPEHASH =
        keccak256('Vote(address voter,bytes community,uint256 sntAmount,uint256 timestamp)');

    function hash(SignedVote calldata vote) internal pure returns (bytes32) {
        return
            keccak256(abi.encode(VOTE_TYPEHASH, vote.voter, keccak256(vote.community), vote.sntAmount, vote.timestamp));
    }

    function verifySignature(SignedVote calldata vote) internal view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked('\x19\x01', DOMAIN_SEPARATOR, hash(vote)));
        return digest.recover(vote.r, vote.vs) == vote.voter;
    }

    constructor(
        IERC20 _address,
        uint256 _votingLength,
        uint256 _votingVerificationLength,
        uint256 _cooldownPeriod,
        uint256 _featuredPerVotingCount
    ) {
        owner = msg.sender;
        token = _address;
        votingLength = _votingLength;
        votingVerificationLength = _votingVerificationLength;
        cooldownPeriod = _cooldownPeriod;
        featuredPerVotingCount = _featuredPerVotingCount;
        DOMAIN_SEPARATOR = hash(
            EIP712Domain({
                name: 'Featured Voting Contract',
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

    function initializeVoting(bytes calldata publicKey, uint256 voteAmount) public {
        require(votings.length == 0 || votings[votings.length - 1].finalized, 'vote already ongoing');
        require(directory.isCommunityInDirectory(publicKey), 'community not in directory');
        require(!isInCooldownPeriod(publicKey), 'community has been featured recently');
        require(token.balanceOf(msg.sender) >= voteAmount, 'not enough token');

        uint votingID = votings.length + 1;

        votersByCommunityByVotingID[votingID][publicKey][msg.sender] = true;
        votesByVotingID[votingID].push(Vote({ voter: msg.sender, community: publicKey, sntAmount: voteAmount }));
        votings.push(
            Voting({
                id: votingID,
                startBlock: block.number,
                startAt: block.timestamp,
                verificationStartAt: block.timestamp.add(votingLength),
                endAt: block.timestamp.add(votingLength + votingVerificationLength),
                finalized: false
            })
        );

        emit VotingStarted();
    }

    function finalizeVoting() public {
        require(votings.length > 0 && !votings[votings.length - 1].finalized, 'no ongoing vote');

        Voting storage voting = votings[votings.length - 1];
        require(voting.endAt < block.timestamp, 'vote still ongoing');

        voting.finalized = true;
        voting.endAt = block.timestamp;

        _evaluateVotes();

        emit VotingFinalized();
    }

    function castVotes(SignedVote[] calldata votes) public {
        require(votings.length > 0 && !votings[votings.length - 1].finalized, 'no ongoing vote');

        for (uint256 i = 0; i < votes.length; i++) {
            _castVote(votes[i]);
        }
    }

    function getVotings() public view returns (Voting[] memory) {
        return votings;
    }

    function getVotesByVotingId(uint256 votingID) public view returns (Vote[] memory) {
        return votesByVotingID[votingID];
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    function isInCooldownPeriod(bytes calldata publicKey) public view returns (bool) {
        if (votings.length == 0) {
            return false;
        }
        // don't count the active voting
        uint256 votingsCount = votings[votings.length - 1].finalized ? cooldownPeriod : cooldownPeriod + 1;
        votingsCount = _min(votings.length, votingsCount);
        for (uint256 i = 0; i < votingsCount; i++) {
            bytes[] storage featured = featuredByVotingID[votings[votings.length - i - 1].id];
            for (uint256 j = 0; j < featured.length; j++) {
                if (_compareBytes(featured[j], publicKey)) {
                    return true;
                }
            }
        }
        return false;
    }

    function _compareBytes(bytes memory a, bytes memory b) private pure returns (bool) {
        if (a.length != b.length) {
            return false;
        }
        for (uint256 i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    function _evaluateVotes() private {
        Voting storage voting = votings[votings.length - 1];
        Vote[] storage votes = votesByVotingID[voting.id];

        CommunityVotes[] memory communitiesVotes = new CommunityVotes[](votes.length);
        uint256 communitiesVotesCount = 0;

        for (uint256 i = 0; i < votes.length; i++) {
            if (token.balanceOf(votes[i].voter) < votes[i].sntAmount) {
                emit NotEnoughToken(votes[i].community, votes[i].voter);
                continue;
            }

            bool found = false;
            for (uint256 j = 0; j < communitiesVotesCount; j++) {
                if (_compareBytes(votes[i].community, communitiesVotes[j].community)) {
                    communitiesVotes[j].totalSntAmount += votes[i].sntAmount;
                    found = true;
                    break;
                }
            }
            if (!found) {
                communitiesVotes[communitiesVotesCount] = CommunityVotes({
                    community: votes[i].community,
                    totalSntAmount: votes[i].sntAmount
                });
                communitiesVotesCount++;
            }
        }

        bytes[] storage featured = featuredByVotingID[voting.id];

        for (uint256 i = 0; i < featuredPerVotingCount; i++) {
            uint256 highestIndex = 0;

            for (uint256 j = 1; j < communitiesVotesCount; j++) {
                if (communitiesVotes[j].totalSntAmount > communitiesVotes[highestIndex].totalSntAmount) {
                    highestIndex = j;
                }
            }

            if (communitiesVotes[highestIndex].totalSntAmount == 0) {
                break;
            }

            featured.push(communitiesVotes[highestIndex].community);
            communitiesVotes[highestIndex].totalSntAmount = 0;
        }

        directory.setFeaturedCommunities(featured);
    }

    function _castVote(SignedVote calldata vote) private {
        if (!verifySignature(vote)) {
            emit InvalidSignature(vote.community, vote.voter);
            return;
        }

        if (!directory.isCommunityInDirectory(vote.community)) {
            emit CommunityNotInDirectory(vote.community, vote.voter);
            return;
        }

        if (isInCooldownPeriod(vote.community)) {
            emit CommunityFeaturedRecently(vote.community, vote.voter);
            return;
        }

        Voting storage voting = votings[votings.length - 1];

        require(block.timestamp < voting.endAt, 'vote closed');
        require(!voting.finalized, 'room finalized');
        require(vote.timestamp < voting.verificationStartAt, 'invalid vote timestamp');
        require(vote.timestamp >= voting.startAt, 'invalid vote timestamp');

        if (votersByCommunityByVotingID[voting.id][vote.community][vote.voter]) {
            emit AlreadyVoted(vote.community, vote.voter);
            return;
        }

        if (token.balanceOf(vote.voter) < vote.sntAmount) {
            emit NotEnoughToken(vote.community, vote.voter);
            return;
        }

        votersByCommunityByVotingID[voting.id][vote.community][vote.voter] = true;
        votesByVotingID[voting.id].push(
            Vote({ voter: vote.voter, community: vote.community, sntAmount: vote.sntAmount })
        );

        emit VoteCast(vote.community, vote.voter);
    }
}
