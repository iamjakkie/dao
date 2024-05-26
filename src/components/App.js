import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [account, setAccount] = useState(null)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const dao = new ethers.Contract(
      config.DAO_ADDRESS,
      DAO_ABI,
      provider
    )
    setDao(dao)

    let treasuryBalance = await provider.getBalance(dao.address);
    treasuryBalance = ethers.utils.formatEther(treasuryBalance);
    setTreasuryBalance(treasuryBalance)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)


    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>JUST DAO</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <hr>
            <p className='text-center'><strong>Treasury Balance:</strong> {treasuryBalance}</p>
          </hr>
        </>
      )}
    </Container>
  )
}

export default App;
