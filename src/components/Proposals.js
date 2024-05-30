import { Table } from "react-bootstrap";
import {Button} from "react-bootstrap";
import { ethers } from "ethers";

// TODO: add progress bar

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
    const voteHandler = async (id) => {
        try {
            const signer = await provider.getSigner()
            const transaction = await dao.connect(signer).vote(id)
            await transaction.wait()
        } catch {
            window.alert('User rejected or transaction reverted')
        }
        setIsLoading(true)
    }

    const downVoteHandler = async (id) => {
        try {
            const signer = await provider.getSigner()
            const transaction = await dao.connect(signer).downVote(id)
            await transaction.wait()
        } catch {
            window.alert('User rejected or transaction reverted')
        }
        setIsLoading(true)
    }

    const finalizeHandler = async (id) => {
        try {
            const signer = await provider.getSigner()
            const transaction = await dao.connect(signer).finalizeProposal(id)
            await transaction.wait()
        } catch {
            window.alert('User rejected or transaction reverted')
        }
        setIsLoading(true)
    }
    return(
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Proposal Name</th>
                    <th>Recipient Address</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Total Votes</th>
                    <th>Cast Vote</th>
                    <th>Down Vote</th>
                    <th>Finalize</th>
                </tr>
            </thead>
            <tbody>
                {proposals.map((proposal, index) => (
                    <tr key={index}>
                        <td>{proposal.id.toString()}</td>
                        <td>{proposal.name}</td>
                        <td>{proposal.recipient}</td>
                        <td>{ethers.utils.formatUnits(proposal.amount, 'ether')} ETH</td>
                        <td>{proposal.description}</td>
                        <td>{proposal.finalized ? "Finalized" : "Open"}</td>
                        <td>{ethers.utils.formatUnits(proposal.votes, 'ether')}</td>
                        <td>
                            {!proposal.finalized && !dao.hasVoted(proposal.id) && (
                                <Button
                                    variant="primary" 
                                    style={{ width: '100%'}}
                                    onClick={() => voteHandler(proposal.id)}>
                                    Vote
                                </Button>
                            )}
                        </td>
                        <td>
                            {!proposal.finalized && !dao.hasVoted(proposal.id) && (
                                <Button
                                    variant="primary" 
                                    style={{ width: '100%'}}
                                    onClick={() => downVoteHandler(proposal.id)}>
                                    Down Vote
                                </Button>
                            )}
                        </td>
                        <td>
                            {!proposal.finalized && proposal.votes > quorum && (
                                <Button 
                                    variant="primary" 
                                    style={{ width: '100%'}}
                                    onClick={() => finalizeHandler(proposal.id)}>
                                    Finalize
                                </Button>
                            )}
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default Proposals;