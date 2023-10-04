# status-community-dapp/contracts

Community directory curator contracts

# Deployments

| **Contract**           | **Address**                                                                                                                    | **Snapshot**                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Goerli**             |                                                                                                                                |                                                                                |
| Directory              | [`0x2fC419c6Ec940A3689922A845F5067577b2d9846`](https://goerli.etherscan.io/address/0x2fC419c6Ec940A3689922A845F5067577b2d9846) | [`5f0dd58`](https://github.com/status-im/communities-contracts/commit/5f0dd58) |
| VotingContract         | [`0xCDE984e57cdb88c70b53437cc694345B646371f9`](https://goerli.etherscan.io/address/0xCDE984e57cdb88c70b53437cc694345B646371f9) | [`5f0dd58`](https://github.com/status-im/communities-contracts/commit/5f0dd58) |
| FeaturedVotingContract | [`0xCe4839946e3e51dd467A75b93FF9d33B408E90d7`](https://goerli.etherscan.io/address/0xCDE984e57cdb88c70b53437cc694345B646371f9) | [`5f0dd58`](https://github.com/status-im/communities-contracts/commit/5f0dd58) |

## Mock Contract

Mock Contract is a mock of voting smart contract for community curation.

This Contract is responsible for creating voting rooms in which you can vote for addition or deletion of community into directory.
Directory of communities will be held on another smart contract at finalization this contract will call smart contract with directory, to make necessary changes.
When voting room is initialized for given community another can't be started for the same community until previous one was finalized.

Lifecycle of voting room: 1. initialize voting room. 2. period of time when votes are accepted. 3. voting time is finished votes are no longer accepted and voting room can be finalized. 4. finalization

### Voting room initialization

```solidity
function initializeVotingRoom(uint8 voteType, address publicKey) public
```

When initializing a voting user needs to supply a type of vote (0: removal, 1: addition) and publicKey of community.
Voting room can't be created if given community is undergoing vote.
If voting room has been created message is emitted.

after voting room creation event is emitted

```solidity
event VotingRoomStarted(uint256 roomId)
```

TODO:
-vote type chosen automatically based if community is in directory

### Voting room structure

```solidity
    enum VoteType { REMOVE, ADD }

    struct VotingRoom {
        uint256 startBlock; // block at which vote was initialized
        uint256 endAt; // timestamp of when the voting room will close
        VoteType voteType; // type of voting room (1: removal, 2: addition)
        bool finalized; // was voting room finalized ( community added/delted from directory )
        address community; // publicKey of community
        uint256 totalVotesFor; // sum of snt votes for vote
        uint256 totalVotesAgainst; // sum of snt votes against
        mapping(address => bool) voted; // list of voters that voted
    }
```

### Finalizing voting room

Once time of voting has passed community needs to be added or removed from directory according to vote result.
For that smart contract has vote finalization function.

```solidity
function finalizeVotingRoom(uint128 voteID) public
```

after finalization event is emitted

```solidity
event VotingRoomFinalized(uint256 roomId);
```

### Voting

Everyone can send a list of aggregated and signed votes

```solidity
    struct SignedVote {
        address voter; // address of voter
        uint256 roomIdAndType; // first bit is type of vote (0: against, 1: for) rest of bits are room Id.
        uint256 sntAmount; // amount of snt to vote
        bytes32 r; // r parameter of signature
        bytes32 vs; // vs parameter of signature [see](https://eips.ethereum.org/EIPS/eip-2098)
    }

    function castVotes(SignedVote[] calldata votes) public
```
