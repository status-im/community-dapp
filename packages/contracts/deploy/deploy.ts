import { ethers } from 'ethers'
import { deployContract } from 'ethereum-waffle'
import MockContract from '../build/MockContract.json'
import Directory from '../build/Directory.json'
import MultiCall from '../build/MultiCall.json'

const deploy = async () => {
    const providerName = process.env.ETHEREUM_PROVIDER
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY
    console.log(privateKey)
    
    if (privateKey && providerName) {
        console.log(`deploying on ${providerName}`)
        const provider = ethers.getDefaultProvider(process.env.ETHEREUM_PROVIDER)
        const wallet = new ethers.Wallet(privateKey, provider)

        const mockContract = await deployContract(wallet, MockContract)
        console.log(`Voting contract deployed with address: ${mockContract.address}`)

        const directoryContract = await deployContract(wallet,Directory,[mockContract.address])
        await mockContract.setDirectory(directoryContract.address)
        console.log(`Directory contract deployed with address: ${directoryContract.address}`)
        const multiCall = await deployContract(wallet, MultiCall)
        console.log(`MultiCall deployed with address: ${multiCall.address}`)
    }
}

deploy()

