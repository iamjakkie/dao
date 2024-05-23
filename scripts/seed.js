// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

async function main() {
    console.log(`Fetching accounts & network...\n`)

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const funder = accounts[1]
    const investor1 = accounts[2]
    const investor2 = accounts[3]
    const investor3 = accounts[4]

    console.log(`Fetching token and transferring tokens to investors...\n`)

    const token = await ethers.getContractAt('Token', '0x5FbDB2315678afecb367f032d93F642f64180aa3')
    console.log(`Token fetched: ${token.address}\n`)

    let transaction = await token.connect(deployer).transfer(investor1.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor2.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor3.address, tokens(200000))
    await transaction.wait()

    console.log(`Fetching DAO and funding it...\n`)

    const dao = await ethers.getContractAt('DAO', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
    console.log(`DAO fetched: ${dao.address}\n`)

    transaction = await funder.sendTransaction({ to: dao.address, value: tokens(1000) })
    await transaction.wait()
    console.log(`Funded DAO with 1000 tokens\n`)

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
