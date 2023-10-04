// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import { Script } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { DeploymentConfig } from "./DeploymentConfig.s.sol";
import { BaseScript } from "./Base.s.sol";
import { Directory } from "../contracts/Directory.sol";
import { FeaturedVotingContract } from "../contracts/FeaturedVotingContract.sol";
import { VotingContract } from "../contracts/VotingContract.sol";

contract DeployContracts is BaseScript {
    function run() external returns (Directory, VotingContract, FeaturedVotingContract, DeploymentConfig) {
        DeploymentConfig deploymentConfig = new DeploymentConfig(broadcaster);
        (
            uint32 votingLengthInSeconds,
            uint32 votingVerificationLength,
            uint32 timeBetweenVotingInSeconds,
            uint32 featuredVotingLength,
            uint32 featuredVotingVerificationLength,
            uint8 cooldownPeriod,
            uint8 featuredPerVotingCount,
            address tokenAddress
        ) = deploymentConfig.activeNetworkConfig();

        vm.startBroadcast(broadcaster);

        VotingContract votingContract = new VotingContract(
            IERC20(tokenAddress), 
            votingLengthInSeconds, 
            votingVerificationLength, 
            timeBetweenVotingInSeconds
        );
        FeaturedVotingContract featuredVotingContract = new FeaturedVotingContract(
            IERC20(tokenAddress),
            featuredVotingLength,
            featuredVotingVerificationLength,
            cooldownPeriod,
            featuredPerVotingCount
        );
        Directory directoryContract = new Directory(address(votingContract), address(featuredVotingContract));

        vm.stopBroadcast();

        return (directoryContract, votingContract, featuredVotingContract, deploymentConfig);
    }
}
