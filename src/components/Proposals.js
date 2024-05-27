import { Table } from "react-bootstrap";
import {Button} from "react-bootstrap";
import { ethers } from "ethers";

// TODO: add progress bar

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
    console.log(proposals);
    return(
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Proposal Name</th>
                    <th>Recipient Address</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Total Votes</th>
                    <th>Cast Vote</th>
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
                        <td>{proposal.finalized ? "Finalized" : "Open"}</td>
                        <td>{ethers.utils.formatUnits(proposal.votes, 'ether')}</td>
                        <td>
                            {!proposal.finalized && (
                                <Button 
                                variant="primary" style={{ width: '100%'}}>
                                    Vote
                                </Button>
                            )}
                        </td>
                        <td>
                            {!proposal.finalized && proposal.votes > quorum (
                                <Button variant="primary" style={{ width: '100%'}}>Finalize</Button>
                            )}
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default Proposals;