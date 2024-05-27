import { Table } from "react-bootstrap";
import {Button} from "react-bootstrap";
import { ethers } from "ethers";

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
                        <td>{proposal.amount.toString()}</td>
                        <td>{proposal.finalized ? "Finalized" : "Open"}</td>
                        <td>{proposal.votes.toString()}</td>
                        <td>
                            <Button>Vote</Button>
                        </td>
                        <td>
                            <Button>Finalize</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default Proposals;