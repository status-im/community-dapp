//// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import { Script } from "forge-std/Script.sol";
import { MockSNT } from "../test/mocks/MockSNT.sol";

contract DeploymentConfig is Script {
    NetworkConfig public activeNetworkConfig;

    struct NetworkConfig {
        uint32 votingLengthInSeconds;
        uint32 votingVerificationLengthInSeconds;
        uint32 timeBetweenVotingInSeconds;
        uint32 featuredVotingLengthInSeconds;
        uint32 featuredVotingVerificationLengthInSeconds;
        uint8 cooldownPeriod;
        uint8 featuredPerVotingCount;
        address voteToken;
    }

    uint32 internal constant ONE_DAY_IN_SECONDS = 24 * 3600;
    uint32 internal constant TWO_DAYS_IN_SECONDS = 2 * 24 * 3600;
    uint32 internal constant FOUR_MINS_IN_SECONDS = 4 * 60;
    uint32 internal constant TWO_MINS_IN_SECONDS = 2 * 60;
    uint32 internal constant ONE_MIN_IN_SECONDS = 60;

    address public deployer;

    // solhint-disable-next-line var-name-mixedcase
    address internal SNT_ADDRESS_GOERLI = 0x3D6AFAA395C31FCd391fE3D562E75fe9E8ec7E6a;
    // solhint-disable-next-line var-name-mixedcase
    address internal SNT_ADDRESS_MAINNET = 0x744d70FDBE2Ba4CF95131626614a1763DF805B9E;

    constructor(address _broadcaster) {
        if (block.chainid == 1) {
            activeNetworkConfig = getMainnetConfig();
        } else if (block.chainid == 5) {
            activeNetworkConfig = getGoerliEthConfig();
        } else if (block.chainid == 31_337) {
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        } else {
            revert("no network config for this chain");
        }
        deployer = _broadcaster;
    }

    function getMainnetConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            votingLengthInSeconds: TWO_DAYS_IN_SECONDS,
            votingVerificationLengthInSeconds: ONE_DAY_IN_SECONDS,
            timeBetweenVotingInSeconds: TWO_DAYS_IN_SECONDS,
            featuredVotingLengthInSeconds: TWO_DAYS_IN_SECONDS,
            featuredVotingVerificationLengthInSeconds: ONE_DAY_IN_SECONDS,
            cooldownPeriod: 2,
            featuredPerVotingCount: 3,
            voteToken: SNT_ADDRESS_MAINNET
        });
    }

    function getGoerliEthConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            votingLengthInSeconds: FOUR_MINS_IN_SECONDS,
            votingVerificationLengthInSeconds: TWO_MINS_IN_SECONDS,
            timeBetweenVotingInSeconds: ONE_MIN_IN_SECONDS,
            featuredVotingLengthInSeconds: FOUR_MINS_IN_SECONDS,
            featuredVotingVerificationLengthInSeconds: TWO_MINS_IN_SECONDS,
            cooldownPeriod: 1,
            featuredPerVotingCount: 3,
            voteToken: SNT_ADDRESS_GOERLI
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
        vm.startBroadcast();
        MockSNT voteToken = new MockSNT();
        vm.stopBroadcast();

        return NetworkConfig({
            votingLengthInSeconds: FOUR_MINS_IN_SECONDS,
            votingVerificationLengthInSeconds: TWO_MINS_IN_SECONDS,
            timeBetweenVotingInSeconds: ONE_MIN_IN_SECONDS,
            featuredVotingLengthInSeconds: FOUR_MINS_IN_SECONDS,
            featuredVotingVerificationLengthInSeconds: TWO_MINS_IN_SECONDS,
            cooldownPeriod: 1,
            featuredPerVotingCount: 3,
            voteToken: address(voteToken)
        });
    }
}
