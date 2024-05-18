const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
    let token, dao
    let deployer, funder, investor1, recipient

    beforeEach(async () => {
        let accounts = await ethers.getSigners()
        deployer = accounts[0]
        funder = accounts[1]
        investor1 = accounts[2]
        recipient = accounts[3]

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

    describe('Proposal creation', () => {
        let transaction, result
        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
                result = await transaction.wait()
            })

            it('Updates proposal count', async () => {
                expect(await dao.proposalCount()).to.equal(1)
            })

            it('Updates proposal mapping', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.id).to.equal(1)
                expect(proposal.name).to.equal('Proposal 1')
                expect(proposal.amount).to.equal(ether(100))
            })

            it('Emits Propose event', async () => {
                await expect(transaction).to.emit(dao, 'Propose').withArgs(1, ether(100), recipient.address, investor1.address)
            })
        })

        describe('Failure', () => {
            it('Rejects invalid amount', async () => {
                await expect(dao.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address)).to.be.revertedWith('Not enough tokens')
            })
        })

    })

})
