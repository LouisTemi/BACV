import { ethers } from 'ethers';

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// Connect to MetaMask
export const connectMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    const address = accounts[0];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Get network info
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.utils.formatEther(balance);

    return {
      address,
      provider,
      signer,
      network: network.name,
      chainId: network.chainId,
      balance: balanceInEth
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Get current connected account
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Switch network in MetaMask
export const switchNetwork = async (chainId) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    console.error('Error switching network:', error);
    throw error;
  }
};

// Get network name from chain ID
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'mainnet',
    5: 'goerli',
    11155111: 'sepolia',
    1337: 'localhost',
    5777: 'localhost'
  };
  return networks[chainId] || 'unknown';
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) return;
  
  window.ethereum.on('accountsChanged', (accounts) => {
    callback(accounts.length > 0 ? accounts[0] : null);
  });
};

// Listen for network changes
export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) return;
  
  window.ethereum.on('chainChanged', (chainId) => {
    callback(parseInt(chainId, 16));
  });
};

// Deploy contract using MetaMask
export const deployContractWithMetaMask = async (abi, bytecode) => {
  const { signer } = await connectMetaMask();
  
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.deployed();
  
  return contract.address;
};

// Interact with contract using MetaMask
export const callContractMethod = async (contractAddress, abi, methodName, params = [], value = '0') => {
  const { signer } = await connectMetaMask();
  
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract[methodName](...params, { value: ethers.utils.parseEther(value) });
  const receipt = await tx.wait();
  
  return receipt;
};