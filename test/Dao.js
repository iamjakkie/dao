const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
    let token, dao
    let deployer, 
        funder, 
        investor1, 
        investor2, 
        investor3,
        investor4,
        investor5,
        recipient,
        user,
        transaction

    beforeEach(async () => {
        let accounts = await ethers.getSigners()
        deployer = accounts[0]
        funder = accounts[1]
        investor1 = accounts[2]
        investor2 = accounts[3]
        investor3 = accounts[4]
        investor4 = accounts[5]
        investor5 = accounts[6]
        recipient = accounts[7]
        user = accounts[8]


        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('JUST Token', 'JUST', '1000000')

        // send 20% tokens to each investor
        transaction = await token.connect(deployer).transfer(investor1.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor2.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor3.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor4.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor5.address, tokens(200000))
        await transaction.wait()

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
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address, 'some random description')
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

            it('Assigns name', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.name).to.equal('Proposal 1')
            })

            it('Assigns amount', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.amount).to.equal(ether(100))
            })

            it('Assigns recipient', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.recipient).to.equal(recipient.address)
            })

            it('Assigns description', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.description).to.equal('some random description')
            })
        })

        describe('Failure', () => {
            it('Rejects invalid amount', async () => {
                await expect(dao.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address, 'random description')).to.be.reverted
            })

            it('Rejects non-investor', async () => {
                await expect(dao.connect(user).createProposal('Proposal 1', ether(100), recipient.address, 'random description')).to.be.revertedWith('Not enough tokens')
            })
        })

    })

    describe('Voting', () => {
        let transaction, result

        beforeEach(async () => {
            transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address, 'random description')
            await transaction.wait()
        })

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait()
            })

            it('Updates vote count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votes).to.equal(tokens(200000))
            })

            // it('Updates investor vote', async () => {
            //     const vote = await dao.votes(1, investor1.address)
            //     expect(vote).to.equal(true)
            // })

            it('Emits Vote event', async () => {
                await expect(transaction).to.emit(dao, 'Vote').withArgs(1, investor1.address);
            })

            it('Has voted returns true', async () => {
                const voted = await dao.connect(investor1).hasVoted(1);
                expect(voted).to.equal(true);
            })
        })

        describe('Failure', () => {
            it('Rejects non-investor', async () => {
                await expect(dao.connect(user).createProposal('Proposal 1', ether(100), recipient.address, 'random description')).to.be.reverted
            })

            it('Rejects duplicate vote', async () => {
                transaction = await dao.connect(investor1).vote(1)
                await transaction.wait()

                await expect(dao.connect(investor1).vote(1)).to.be.reverted
            })
        })
    })

    describe('DownVoting', () => {
        let transaction, result

        beforeEach(async () => {
            transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address, 'random description')
            await transaction.wait()

            transaction = await dao.connect(investor1).vote(1)
            await transaction.wait()

            transaction = await dao.connect(investor2).vote(1)
            await transaction.wait()
        })

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor3).downVote(1)
                result = await transaction.wait()
            })

            it('Updates vote count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votes).to.equal(tokens(200000))
            })

            it('Has voted returns true', async () => {
                const voted = await dao.connect(investor3).hasVoted(1);
                expect(voted).to.equal(true);
            })

        })

        describe('Failure', () => {
            it('Rejects non-investor', async () => {
                await expect(dao.connect(user).downVote(1)).to.be.reverted
            })

            it('Rejects duplicate vote', async () => {
                transaction = await dao.connect(investor3).downVote(1)
                await transaction.wait()

                await expect(dao.connect(investor3).downVote(1)).to.be.reverted
            })

            it('Rejects duplicate vote - upvote', async () => {
                transaction = await dao.connect(investor3).vote(1)
                await transaction.wait()

                await expect(dao.connect(investor3).downVote(1)).to.be.reverted
            })
        })

    })

    describe('Governance', () => {
        let transaction, result;

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address, 'random description')
                result = await transaction.wait()
    
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait()

                transaction = await dao.connect(investor2).vote(1)
                result = await transaction.wait()

                transaction = await dao.connect(investor3).vote(1)
                result = await transaction.wait()

                transaction = await dao.connect(investor1).finalizeProposal(1)
                result = await transaction.wait()
            })

            it('Updates proposal to finalized', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.finalized).to.equal(true)
            })

            it('Transfers ether to recipient', async () => {
                expect(await ethers.provider.getBalance(recipient.address)).to.equal(tokens(10200))
            })

            it('Emits Finalize event', async () => {
                await expect(transaction).to.emit(dao, 'Finalize').withArgs(1)
            })
        })

        describe('Failure', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address, 'random description')
                result = await transaction.wait()
    
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait()

                transaction = await dao.connect(investor2).vote(1)
                result = await transaction.wait()

            })

            it('Rejects non-quorum', async () => {
                await expect(dao.connect(investor1).finalizeProposal(1)).to.be.reverted
            })

            it('Rejects already finalized', async () => {
                transaction = await dao.connect(investor3).vote(1)
                await transaction.wait()

                transaction = await dao.connect(investor1).finalizeProposal(1)
                await transaction.wait()

                await expect(dao.connect(investor1).finalizeProposal(1)).to.be.reverted
            })
        })
        
    })

})
