const Web3 = require('web3');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.initialize();
  }

  initialize() {
    try {
      const rpcUrl = process.env.ETHEREUM_RPC_URL;
      const privateKey = process.env.PRIVATE_KEY;
      const contractAddress = process.env.CARBON_TOKEN_CONTRACT;

      if (!rpcUrl || !privateKey || !contractAddress) {
        logger.warn('Blockchain not fully configured, running in simulation mode');
        this.simulationMode = true;
        return;
      }

      this.web3 = new Web3(rpcUrl);
      this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(this.account);

      // Carbon Credit Token Contract ABI
      const contractABI = [
        {
          inputs: [{ name: 'amount', type: 'uint256' }, { name: 'metadata', type: 'string' }],
          name: 'mintCarbonCredit',
          outputs: [{ name: 'tokenId', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
          name: 'transferCarbonCredit',
          outputs: [{ name: 'success', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          name: 'getCreditDetails',
          outputs: [
            { name: 'amount', type: 'uint256' },
            { name: 'metadata', type: 'string' },
            { name: 'owner', type: 'address' },
            { name: 'createdAt', type: 'uint256' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          name: 'retireCarbonCredit',
          outputs: [{ name: 'success', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: false, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'metadata', type: 'string' },
          ],
          name: 'CreditMinted',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
          ],
          name: 'CreditTransferred',
          type: 'event',
        },
      ];

      this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
      this.simulationMode = false;
      logger.info('Blockchain service initialized');
    } catch (error) {
      logger.error('Blockchain initialization error:', error);
      this.simulationMode = true;
    }
  }

  async mintCarbonCredit(amountInTons, metadata) {
    if (this.simulationMode) {
      return this.simulateTransaction('mint', { amountInTons, metadata });
    }

    try {
      const amountInWei = this.web3.utils.toWei(amountInTons.toString(), 'ether');
      
      const tx = await this.contract.methods
        .mintCarbonCredit(amountInWei, JSON.stringify(metadata))
        .send({
          from: this.account.address,
          gas: parseInt(process.env.BLOCKCHAIN_GAS_LIMIT) || 2000000,
          gasPrice: await this.getGasPrice(),
        });

      const tokenId = tx.events.CreditMinted.returnValues.tokenId;
      
      logger.info(`Carbon credit minted: Token ID ${tokenId}`);
      
      return {
        tokenId,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        amount: amountInTons,
        metadata,
      };
    } catch (error) {
      logger.error('Mint carbon credit error:', error);
      throw new Error(`Mint failed: ${error.message}`);
    }
  }

  async transferCarbonCredit(tokenId, toAddress, amount) {
    if (this.simulationMode) {
      return this.simulateTransaction('transfer', { tokenId, toAddress, amount });
    }

    try {
      const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
      
      const tx = await this.contract.methods
        .transferCarbonCredit(tokenId, toAddress, amountInWei)
        .send({
          from: this.account.address,
          gas: parseInt(process.env.BLOCKCHAIN_GAS_LIMIT) || 2000000,
          gasPrice: await this.getGasPrice(),
        });

      logger.info(`Carbon credit transferred: Token ${tokenId} to ${toAddress}`);
      
      return {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        tokenId,
        toAddress,
        amount,
      };
    } catch (error) {
      logger.error('Transfer carbon credit error:', error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  async retireCarbonCredit(tokenId) {
    if (this.simulationMode) {
      return this.simulateTransaction('retire', { tokenId });
    }

    try {
      const tx = await this.contract.methods
        .retireCarbonCredit(tokenId)
        .send({
          from: this.account.address,
          gas: parseInt(process.env.BLOCKCHAIN_GAS_LIMIT) || 2000000,
          gasPrice: await this.getGasPrice(),
        });

      logger.info(`Carbon credit retired: Token ${tokenId}`);
      
      return {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        tokenId,
      };
    } catch (error) {
      logger.error('Retire carbon credit error:', error);
      throw new Error(`Retire failed: ${error.message}`);
    }
  }

  async getCreditDetails(tokenId) {
    if (this.simulationMode) {
      return {
        amount: '100',
        metadata: '{"cropType":"maize","soilHealth":"good"}',
        owner: '0x123...',
        createdAt: Date.now(),
      };
    }

    try {
      const details = await this.contract.methods
        .getCreditDetails(tokenId)
        .call();

      return {
        amount: this.web3.utils.fromWei(details.amount, 'ether'),
        metadata: JSON.parse(details.metadata),
        owner: details.owner,
        createdAt: new Date(parseInt(details.createdAt) * 1000),
      };
    } catch (error) {
      logger.error('Get credit details error:', error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const gasPriceGwei = this.web3.utils.fromWei(gasPrice, 'gwei');
      
      // Use configured gas price if higher than current
      const configuredGasPrice = parseFloat(process.env.BLOCKCHAIN_GAS_PRICE) || 20;
      const finalGasPrice = Math.max(parseFloat(gasPriceGwei), configuredGasPrice);
      
      return this.web3.utils.toWei(finalGasPrice.toString(), 'gwei');
    } catch (error) {
      logger.error('Get gas price error:', error);
      return this.web3.utils.toWei('20', 'gwei');
    }
  }

  async getBalance(address) {
    if (this.simulationMode) {
      return '100.0';
    }

    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      logger.error('Get balance error:', error);
      throw error;
    }
  }

  simulateTransaction(type, data) {
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    logger.info(`Simulated ${type} transaction: ${txHash}`);
    
    return {
      transactionHash: txHash,
      blockNumber: Math.floor(Math.random() * 10000000),
      simulated: true,
      ...data,
    };
  }

  // Generate a new wallet
  createWallet() {
    if (!this.web3) {
      this.web3 = new Web3();
    }
    const account = this.web3.eth.accounts.create();
    return {
      address: account.address,
      privateKey: account.privateKey,
    };
  }

  // Sign a message
  signMessage(message, privateKey) {
    if (!this.web3) {
      this.web3 = new Web3();
    }
    return this.web3.eth.accounts.sign(message, privateKey);
  }
}

const blockchainService = new BlockchainService();
module.exports = { blockchainService };