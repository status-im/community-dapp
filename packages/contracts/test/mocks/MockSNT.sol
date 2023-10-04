// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockSNT is ERC20 {
    constructor() ERC20("Mock SNT", "SNT") {
        _mint(msg.sender, 1_000_000_000_000_000_000);
    }
}
