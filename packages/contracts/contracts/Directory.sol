pragma solidity ^0.8.5;

contract Directory {
    address public votingContract;

    bytes[] public communities;
    mapping(bytes => uint256) private communitiesIdx;

    constructor(address _votingContract) {
        votingContract = _votingContract;
    }

    function isCommunityInDirectory(bytes calldata community) public view returns (bool) {
        return communitiesIdx[community] > 0;
    }

    function getCommunities() public view returns (bytes[] memory) {
        return communities;
    }

    modifier onlyVotingContract() {
        require(msg.sender == votingContract, 'Invalid sender');
        _;
    }

    function addCommunity(bytes calldata community) public onlyVotingContract {
        require(communitiesIdx[community] == 0, 'Community already exist');
        communities.push(community);
        communitiesIdx[community] = communities.length;
    }

    function removeCommunity(bytes calldata community) public onlyVotingContract {
        uint256 index = communitiesIdx[community];
        if (index == 0) return;
        index--;
        if (communities.length > 1) {
            communities[index] = communities[communities.length - 1];
            communitiesIdx[communities[index]] = index + 1;
        }
        communities.pop();
        communitiesIdx[community] = 0;
    }
}
