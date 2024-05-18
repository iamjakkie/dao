const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
  let token, dao
  let deployer, funder

  beforeEach(async () => {
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    funder = accounts[1]

    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('JUST Token', 'JUST', '1000000')

    const DAO = await ethers.getContractFactory('DAO')
    dao = await DAO.deploy(token.address, '500000000000000000000001')

    await funder.sendTransaction({ to: dao.address, value: ether(100) })
  })

  describe('Deployment', () => {
    it('Sends ether to DAO', async () => {
        expect(await ethers.provider.getBalance(dao.address)).to.equal(ether(100))
    })

    it('Returns token address', async () => {
      expect(await dao.token()).to.equal(token.address)
    })

    it('Returns quorum', async () => {
      expect(await dao.quorum()).to.equal('500000000000000000000001')
    })

  })

})