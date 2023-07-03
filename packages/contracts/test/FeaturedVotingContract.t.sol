// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import 'forge-std/console2.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './SigUtils.sol';
import '../contracts/Directory.sol';
import '../contracts/FeaturedVotingContract.sol';

contract MockSNT is ERC20 {
    constructor() ERC20('Mock SNT', 'MSNT') {
        _mint(msg.sender, 1000000000000000000);
    }
}

contract FeaturedVotingContract_Test is Test {
    uint256 votingLength = 1000;
    uint256 votingVerificationLength = 200;
    uint256 featuredPerVotingCount = 3;
    uint256 cooldownPeriod = 1;
    uint256 votingWithVerificationLength = votingLength + votingVerificationLength;

    address votingContract = makeAddr('votingContract');

    address bob;
    uint256 bobsKey;
    address alice;
    uint256 alicesKey;

    bytes communityID1 = bytes('0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5');
    bytes communityID2 = bytes('0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8');
    bytes communityID3 = bytes('0x04bbb77ea11ee6dc4585efa2617ec90b8ee4051ade4fcf7261ae6cd4cdf33e54e3');
    bytes communityID4 = bytes('0xadfcf42e083e71d8c755da07a2b1bad754d7ca97c35fbd407da6bde9844580ad55');
    bytes communityID5 = bytes('0xec62724b6828954a705eb3b531c30a69503d3561d4283fb8b60835ff34205c64d8');
    bytes communityID6 = bytes('0xb8def1f5e7160e5e1a6440912b7e633ad923030352f23abb54226020bff781b7e6');

    event VotingStarted();
    event NotEnoughToken(bytes community, address voter);
    event AlreadyVoted(bytes community, address voter);
    event VoteCast(bytes community, address voter);
    event InvalidSignature(bytes community, address voter);
    event CommunityFeaturedRecently(bytes community, address voter);
    event VotingFinalized();

    SigUtils internal sigUtils;

    MockSNT mockSNT;
    Directory directoryContract;
    FeaturedVotingContract featuredVotingContract;

    bytes32 DOMAIN_SEPARATOR;
    bytes32 constant EIP712DOMAIN_TYPEHASH =
        keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)');

    bytes32 public constant VOTE_TYPEHASH =
        keccak256('Vote(address voter,bytes community,uint256 sntAmount,uint256 timestamp)');

    function _hashDomainData(uint256 chainId, address verifyingContract) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712DOMAIN_TYPEHASH,
                    keccak256(bytes('Featured Voting Contract')),
                    keccak256(bytes('1')),
                    chainId,
                    verifyingContract
                )
            );
    }

    function _createSignedVote(
        uint256 signer,
        address voter,
        bytes memory community,
        uint256 amount,
        uint256 timestamp
    ) internal view returns (FeaturedVotingContract.SignedVote memory) {
        bytes32 voteHash = sigUtils.getTypedDataHash(
            SigUtils.FeaturedVote({ voter: voter, community: community, sntAmount: amount }),
            timestamp
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer, voteHash);

        return
            FeaturedVotingContract.SignedVote({
                voter: voter,
                community: community,
                sntAmount: amount,
                timestamp: timestamp,
                r: r,
                vs: (bytes32(uint256(v > 27 ? 1 : 0)) << 255) | s
            });
    }

    function _hashVoteData(
        address voter,
        bytes memory community,
        uint256 amount,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(VOTE_TYPEHASH, voter, keccak256(community), amount, timestamp));
    }

    function _getVoting(uint256 index) internal view returns (FeaturedVotingContract.Voting memory) {
        (
            uint256 id,
            uint256 startBlock,
            uint256 startAt,
            uint256 verificationStartAt,
            uint256 endAt,
            bool finalized
        ) = featuredVotingContract.votings(index);

        return
            FeaturedVotingContract.Voting({
                id: id,
                startBlock: startBlock,
                startAt: startAt,
                verificationStartAt: verificationStartAt,
                endAt: endAt,
                finalized: finalized
            });
    }

    function setUp() public virtual {
        mockSNT = new MockSNT();

        featuredVotingContract = new FeaturedVotingContract(
            mockSNT,
            votingLength,
            votingVerificationLength,
            cooldownPeriod,
            featuredPerVotingCount
        );
        directoryContract = new Directory(votingContract, address(featuredVotingContract));
        featuredVotingContract.setDirectory(directoryContract);

        DOMAIN_SEPARATOR = _hashDomainData(block.chainid, address(featuredVotingContract));
        sigUtils = new SigUtils(DOMAIN_SEPARATOR);

        (address bob_, uint256 bobsKey_) = makeAddrAndKey('bob');
        (address alice_, uint256 alicesKey_) = makeAddrAndKey('alice');
        bob = bob_;
        bobsKey = bobsKey_;
        alice = alice_;
        alicesKey = alicesKey_;
    }
}

contract SetDirectory_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_RevertWhen_NotOwner() public {
        vm.expectRevert(bytes('Not owner'));
        vm.prank(bob);
        featuredVotingContract.setDirectory(directoryContract);
    }
}

contract InitializeVoting_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_RevertWhen_VoteAlreadyOngoing() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        vm.expectRevert(bytes('vote already ongoing'));
        featuredVotingContract.initializeVoting(communityID1, 100);
    }

    function test_RevertWhen_CommunityIsNotInDirectory() public {
        vm.expectRevert(bytes('community not in directory'));
        featuredVotingContract.initializeVoting(communityID1, 100);
    }

    function test_RevertWhen_SenderHasNotEnoughFunds() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);
        // alice doesn't have any MockSNT
        vm.prank(alice);
        vm.expectRevert(bytes('not enough token'));
        featuredVotingContract.initializeVoting(communityID1, 100);
    }

    function test_RevertWhen_CooldownPeriodHasNotPassed() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        vm.expectRevert(bytes('community has been featured recently'));
        featuredVotingContract.initializeVoting(communityID1, 100);
    }

    function test_InitializeVoting() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        vm.expectEmit(false, false, false, false);
        emit VotingStarted();
        featuredVotingContract.initializeVoting(communityID1, 100);

        FeaturedVotingContract.Voting memory voting = _getVoting(0);
        assertEq(voting.id, 1);
        assertEq(voting.startBlock, block.number);
        assertEq(voting.startAt, block.timestamp);
        assertEq(voting.verificationStartAt, block.timestamp + votingLength);
        assertEq(voting.endAt, block.timestamp + votingWithVerificationLength);
        assertFalse(voting.finalized);
    }

    function test_InitializeVoting_CooldownPeriodHasPassed() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        // now initialize and finalize voting for another community
        // so we can initialize another voting using `communityID1` again
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID2);

        featuredVotingContract.initializeVoting(communityID2, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        // try initialize voting that was already featured
        featuredVotingContract.initializeVoting(communityID1, 100);
    }
}

contract FinalizeVoting_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_RevertWhen_NoOngoingVote() public {
        vm.expectRevert(bytes('no ongoing vote'));
        featuredVotingContract.finalizeVoting();
    }

    function test_RevertWhen_VoteStillOngoing() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        vm.expectRevert(bytes('vote still ongoing'));
        featuredVotingContract.finalizeVoting();
    }

    function test_FinalizeVoting() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        vm.expectEmit(false, false, false, false);
        emit VotingFinalized();
        featuredVotingContract.finalizeVoting();

        FeaturedVotingContract.Voting[] memory votings = featuredVotingContract.getVotings();
        assertEq(votings.length, 1);
        assertEq(votings[0].id, 1);
        assert(votings[0].finalized);
    }

    function test_FinalizeVoting_FeatureByFirstCastedWhenVoteIsADraw() public {
        vm.startPrank(votingContract);
        directoryContract.addCommunity(communityID2);
        directoryContract.addCommunity(communityID3);
        directoryContract.addCommunity(communityID4);
        directoryContract.addCommunity(communityID5);
        directoryContract.addCommunity(communityID6);
        vm.stopPrank();

        featuredVotingContract.initializeVoting(communityID3, 100);

        FeaturedVotingContract.SignedVote[] memory votes = new FeaturedVotingContract.SignedVote[](4);
        votes[0] = _createSignedVote(bobsKey, bob, communityID4, 100, block.timestamp);
        votes[1] = _createSignedVote(bobsKey, bob, communityID5, 100, block.timestamp);
        votes[2] = _createSignedVote(bobsKey, bob, communityID2, 100, block.timestamp);
        votes[3] = _createSignedVote(bobsKey, bob, communityID6, 100, block.timestamp);

        // ensure bob has funds
        mockSNT.transfer(bob, 10000);

        featuredVotingContract.castVotes(votes);
        skip(votingWithVerificationLength + 1);

        emit VotingFinalized();
        featuredVotingContract.finalizeVoting();

        FeaturedVotingContract.Voting[] memory votings = featuredVotingContract.getVotings();
        assertEq(votings.length, 1);
        assert(votings[0].finalized);

        bytes[] memory featuredCommunities = directoryContract.getFeaturedCommunities();
        assertEq(featuredCommunities.length, 3);

        // we expect that communities which have been voted for
        // first to make it into the featured list, if the vote is a draw
        assertEq(featuredCommunities[0], communityID3);
        assertEq(featuredCommunities[1], communityID4);
        assertEq(featuredCommunities[2], communityID5);
    }
}

contract CastVotes_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_RevertWhen_NoOngoingVote() public {
        FeaturedVotingContract.SignedVote[] memory votes = new FeaturedVotingContract.SignedVote[](0);
        vm.expectRevert(bytes('no ongoing vote'));
        featuredVotingContract.castVotes(votes);
    }

    function test_RevertWhen_VotingHasBeenClosedAlready() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);

        FeaturedVotingContract.SignedVote[] memory votes = new FeaturedVotingContract.SignedVote[](1);
        votes[0] = _createSignedVote(bobsKey, bob, communityID1, 200, block.timestamp);
        vm.expectRevert(bytes('vote closed'));
        featuredVotingContract.castVotes(votes);
    }

    function test_CastVotes_EmitInvalidSignature() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);
        featuredVotingContract.initializeVoting(communityID1, 100);

        FeaturedVotingContract.SignedVote[] memory votes = new FeaturedVotingContract.SignedVote[](1);
        // create broken signature with bob's key but alice's address
        votes[0] = _createSignedVote(bobsKey, alice, communityID1, 200, block.timestamp);

        vm.expectEmit(false, false, false, true);
        emit InvalidSignature(communityID1, alice);
        featuredVotingContract.castVotes(votes);
    }

    function test_CastVotes_CooldownPeriodHasNotPassed() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        // initialize and finalize first voting for communityID1
        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        // the idea is that, if `cooldownPeriod` == 1, then there had
        // to be at least 1 finished voting that didn't include `communityID1`
        // since we want a test that verifies `castVotes()` indeed emits
        // `CommunityFeaturedRecently` we need to first try to build a scenario
        // in which `initializeVoting()` isn't already emitting that same error,
        // yet a vote for `communityID1` should trigger the expected event.
        //
        // We try this by initializing a second voting that is not `communityID1`
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID2);

        // initialize second voting not containing communityID1
        featuredVotingContract.initializeVoting(communityID2, 100);

        // cast a vote for `communityID1` to have `castVotes()` emit the expected
        // event
        FeaturedVotingContract.SignedVote[] memory votes = new FeaturedVotingContract.SignedVote[](1);
        votes[0] = _createSignedVote(bobsKey, bob, communityID1, 200, block.timestamp);

        // ensure bob has funds
        mockSNT.transfer(bob, 10000);

        vm.expectEmit(false, false, false, true);
        emit CommunityFeaturedRecently(communityID1, bob);
        featuredVotingContract.castVotes(votes);
    }

    function test_CastVotes_EmitInvalidVoteTimestamp() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        uint256 voteTimestamp = block.timestamp;
        FeaturedVotingContract.SignedVote[] memory votes = new FeaturedVotingContract.SignedVote[](1);
        votes[0] = _createSignedVote(bobsKey, bob, communityID1, 200, voteTimestamp);

        // fast forward, such that vote timestamp will be earlier than the
        // voting room's startAt
        skip(1000);
        featuredVotingContract.initializeVoting(communityID1, 100);

        vm.expectRevert(bytes('invalid vote timestamp'));
        featuredVotingContract.castVotes(votes);

        // now create another failing vote that has a newer timestamp than the
        // voting room's verificationStartAt
        skip(votingLength + 1);
        votes[0] = _createSignedVote(bobsKey, bob, communityID1, 200, block.timestamp);
        vm.expectRevert(bytes('invalid vote timestamp'));
        featuredVotingContract.castVotes(votes);
    }
}

contract GetVotings_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_GetVotings() public {
        vm.startPrank(votingContract);
        directoryContract.addCommunity(communityID1);
        directoryContract.addCommunity(communityID2);
        vm.stopPrank();

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        featuredVotingContract.initializeVoting(communityID2, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        FeaturedVotingContract.Voting[] memory votings = featuredVotingContract.getVotings();
        assertEq(votings.length, 2);
        assertEq(votings[0].id, 1);
        assertEq(votings[0].startBlock, block.number);
        assert(votings[0].finalized);
        assertEq(votings[1].id, 2);
        assertEq(votings[1].startBlock, block.number);
        assert(votings[1].finalized);
    }
}

contract GetVotesByVotingId_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_GetVotesByVotingId() public {
        vm.startPrank(votingContract);
        directoryContract.addCommunity(communityID1);
        directoryContract.addCommunity(communityID2);
        vm.stopPrank();

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        featuredVotingContract.initializeVoting(communityID2, 300);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        FeaturedVotingContract.Vote[] memory votes = featuredVotingContract.getVotesByVotingId(1);
        assertEq(votes.length, 1);
        assertEq(votes[0].community, communityID1);
        assertEq(votes[0].sntAmount, 100);

        votes = featuredVotingContract.getVotesByVotingId(2);
        assertEq(votes.length, 1);
        assertEq(votes[0].community, communityID2);
        assertEq(votes[0].sntAmount, 300);
    }
}

contract IsInCooldownPeriod_Test is FeaturedVotingContract_Test {
    function setUp() public virtual override {
        FeaturedVotingContract_Test.setUp();
    }

    function test_IsInCooldownPeriod() public {
        vm.prank(votingContract);
        directoryContract.addCommunity(communityID1);

        featuredVotingContract.initializeVoting(communityID1, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        vm.prank(votingContract);
        directoryContract.addCommunity(communityID2);

        featuredVotingContract.initializeVoting(communityID2, 100);
        skip(votingWithVerificationLength + 1);
        featuredVotingContract.finalizeVoting();

        assert(featuredVotingContract.isInCooldownPeriod(communityID2));
        assertFalse(featuredVotingContract.isInCooldownPeriod(communityID1));
    }
}
