// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat')

import { ERC20Mock, MultiCall } from '../abi'
import { BigNumber } from 'ethers'

async function deployVotingContract(
  tokenAddress: string,
  votingLength: number,
  votingVerificationLength: number,
  timeBetweenVoting: number
) {
  const contractFactory = await hre.ethers.getContractFactory('VotingContract')
  const contract = await contractFactory.deploy(tokenAddress, votingLength, votingVerificationLength, timeBetweenVoting)
  await contract.deployed()

  console.log(`Voting contract deployed with address: ${contract.address}`)

  return contract
}

async function deployFeaturedVotingContract(
  tokenAddress: string,
  votingLength: number,
  votingVerificationLength: number,
  cooldownPeriod: number,
  featuredPerVotingCount: number
) {
  const contractFactory = await hre.ethers.getContractFactory('FeaturedVotingContract')
  const contract = await contractFactory.deploy(
    tokenAddress,
    votingLength,
    votingVerificationLength,
    cooldownPeriod,
    featuredPerVotingCount
  )
  await contract.deployed()

  console.log(`Featured Voting contract deployed with address: ${contract.address}`)

  return contract
}

async function deployDirectoryContract(votingContractAddress: string, featuredVotingContractAddress: string) {
  const contractFactory = await hre.ethers.getContractFactory('Directory')
  const contract = await contractFactory.deploy(votingContractAddress, featuredVotingContractAddress)
  await contract.deployed()

  console.log(`Directory contract deployed with address: ${contract.address}`)

  return contract
}

async function deployERC20MockContract(deployerAddress: string) {
  const contractFactory = await hre.ethers.getContractFactory(ERC20Mock.abi, ERC20Mock.bytecode)
  const contract = await contractFactory.deploy(
    'MSNT',
    'Mock SNT',
    deployerAddress,
    BigNumber.from('0x33B2E3C9FD0803CE8000000')
  )
  await contract.deployed()

  console.log(`ERC20Mock contract deployed with address: ${contract.address}`)

  const [_, bob, alice] = await hre.ethers.getSigners()
  await contract.increaseAllowance(deployerAddress, BigNumber.from('0x33B2E3C9FD0803CE8000000'))
  await contract.transferFrom(deployerAddress, bob.address, BigNumber.from('0x52B7D2DCC80CD2E4000000'))
  await contract.transferFrom(deployerAddress, alice.address, BigNumber.from('0x52B7D2DCC80CD2E4000000'))

  return contract
}

async function deployMultiCallContract() {
  const contractFactory = await hre.ethers.getContractFactory(MultiCall.abi, MultiCall.bytecode)
  const contract = await contractFactory.deploy()
  await contract.deployed()

  console.log(`MultiCall contract deployed with address: ${contract.address}`)

  return contract
}

function isTestNetwork(chainId: number) {
  return chainId == 1337 || chainId == 31337
}

async function obtainTokenAddress(deployer: any, chainId: number): Promise<string> {
  let tokenAddress = process.env.TOKEN_CONTRACT
  if (!tokenAddress && isTestNetwork(chainId)) {
    const tokenContract = await deployERC20MockContract(deployer.address)
    tokenAddress = tokenContract.address
  } else {
    throw new Error('TOKEN_ADDRESS should be provided')
  }
  return tokenAddress ? tokenAddress : ''
}

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const network = await hre.ethers.provider.getNetwork()

  const votingLengthInSeconds = isTestNetwork(network.chainId) ? 4 * 60 : 2 * 24 * 3600 // 4 minutes or 2 days
  const votingVerificationLengthInSeconds = isTestNetwork(network.chainId) ? 2 * 60 : 1 * 24 * 3600 // 2 minutes or 1 day
  const timeBetweenVotingInSeconds = isTestNetwork(network.chainId) ? 60 : 2 * 24 * 3600 // 1 minute or 2 days

  const featuredVotingLengthInSeconds = isTestNetwork(network.chainId) ? 4 * 60 : 2 * 24 * 3600 // 4 minutes or 2 days
  const featuredVotingVerificationLengthInSeconds = isTestNetwork(network.chainId) ? 2 * 60 : 1 * 24 * 3600 // 2 minutes or 1 day
  const cooldownPeriod = isTestNetwork(network.chainId) ? 1 : 2
  const featuredPerVotingCount = isTestNetwork(network.chainId) ? 3 : 3

  console.log(
    `Deploying contracts on the network: ${network.name}(${network.chainId}), with the account: ${deployer.address}`
  )

  if (isTestNetwork(network.chainId)) {
    await deployMultiCallContract()
  }

  const tokenAddress = await obtainTokenAddress(deployer, network.chainId)
  const votingContract = await deployVotingContract(
    tokenAddress,
    votingLengthInSeconds,
    votingVerificationLengthInSeconds,
    timeBetweenVotingInSeconds
  )
  const featuredVotingContract = await deployFeaturedVotingContract(
    tokenAddress,
    featuredVotingLengthInSeconds,
    featuredVotingVerificationLengthInSeconds,
    cooldownPeriod,
    featuredPerVotingCount
  )
  const directoryContract = await deployDirectoryContract(votingContract.address, featuredVotingContract.address)
  await votingContract.setDirectory(directoryContract.address)
  await featuredVotingContract.setDirectory(directoryContract.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
