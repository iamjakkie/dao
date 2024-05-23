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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
