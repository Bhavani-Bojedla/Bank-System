const mongoose = require('mongoose');
const Account = require('../models/Account');


const createAccount = async (req, res) => {
    const { name, email } = req.body;
  
    // Check if email already exists
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: 'Email already associated with another account' });
    }
  
    // Create new account
    const newAccount = new Account({
      name,
      email,
      balance: 0,  // Initial balance is 0
      transactionHistory: []  // Empty transaction history initially
    });
  
    try {
      const savedAccount = await newAccount.save();
      res.status(201).json(savedAccount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  };  


const deposit = async (req, res) => {
  const { accountId, amount } = req.body;

  // Check if accountId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ message: 'Invalid account ID format' });
  }

  const objectId = new mongoose.Types.ObjectId(accountId);
  
  const account = await Account.findById(objectId);
  if (!account) return res.status(404).json({ message: 'Account not found' });

  account.balance += amount;
  account.transactionHistory.push(`Deposited ${amount}`);
  await account.save();
  res.json(account);
};

const withdraw = async (req, res) => {
  const { accountId, amount } = req.body;

  // Check if accountId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ message: 'Invalid account ID format' });
  }

  const objectId = new mongoose.Types.ObjectId(accountId);
  
  const account = await Account.findById(objectId);
  if (!account) return res.status(404).json({ message: 'Account not found' });

  if (account.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });

  account.balance -= amount;
  account.transactionHistory.push(`Withdrew ${amount}`);
  await account.save();
  res.json(account);
};

const sendMoney = async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;

  // Check if both accountIds are valid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(fromAccountId) || !mongoose.Types.ObjectId.isValid(toAccountId)) {
    return res.status(400).json({ message: 'Invalid account ID format' });
  }

  const fromObjectId = new mongoose.Types.ObjectId(fromAccountId);
  const toObjectId = new mongoose.Types.ObjectId(toAccountId);

  const fromAccount = await Account.findById(fromObjectId);
  const toAccount = await Account.findById(toObjectId);

  if (!fromAccount || !toAccount) return res.status(404).json({ message: 'Account(s) not found' });

  if (fromAccount.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });

  fromAccount.balance -= amount;
  toAccount.balance += amount;

  fromAccount.transactionHistory.push(`Sent ${amount} to account ${toAccountId}`);
  toAccount.transactionHistory.push(`Received ${amount} from account ${fromAccountId}`);

  await fromAccount.save();
  await toAccount.save();
  res.json({ fromAccount, toAccount });
};


const getHistory = async (req, res) => {
  const { accountId } = req.query;

  // Validate the accountId
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ message: 'Invalid account ID format' });
  }

  try {
    // Find the account by ID
    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Return the transaction history
    res.json(account.transactionHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching account history' });
  }
}; 

 
module.exports = {createAccount, deposit, withdraw, sendMoney, getHistory };
