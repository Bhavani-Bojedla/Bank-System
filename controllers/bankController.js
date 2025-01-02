const mongoose = require("mongoose");
const Account = require("../models/Account");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const secretKey = process.env.SECRET_KEY;

const createAccount = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "Email already associated with another account" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = new Account({
      name,
      email,
      password: hashedPassword,
      balance: 0,
      transactionHistory: [],
    });

    const savedAccount = await newAccount.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    console.error("Error creating account:", error.message);
    res.status(500).json({ message: "Failed to create account" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const secretKey = process.env.SECRET_KEY;
  try {
    const user = await Account.findOne({ email });
    const id = user.id;
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, secretKey);

    res.json({ token, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deposit = async (req, res) => {
  const accountId = req.user.id;
  const { amount } = req.body;

  const depositAmount = parseFloat(amount);

  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: "Account not found" });

  account.balance += depositAmount;
  account.transactionHistory.push(`Deposited ${depositAmount}`);
  await account.save();
  res.status(200).json({ account, success: true });
};

const withdraw = async (req, res) => {
  const accountId = req.user.id;
  const { amount } = req.body;
  const withdrawAmount = parseFloat(amount);

  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: "Account not found" });

  if (account.balance < amount)
    return res.status(400).json({ message: "Insufficient funds" });

  account.balance -= withdrawAmount;
  account.transactionHistory.push(`Withdrew ${withdrawAmount}`);
  await account.save();
  res.status(200).json({ account, success: true });
};

const sendMoney = async (req, res) => {
  const fromAccountId = req.user.id;
  const { toAccountId, amount } = req.body;

  const fromAccount = await Account.findById(fromAccountId);
  const toAccount = await Account.findById(toAccountId);

  if (!fromAccount || !toAccount)
    return res.status(404).json({ message: "Account(s) not found" });

  if (fromAccount.balance < amount)
    return res.status(400).json({ message: "Insufficient funds" });

  fromAccount.balance -= amount;
  toAccount.balance += amount;

  fromAccount.transactionHistory.push(
    `Sent ${amount} to account ${toAccountId}`
  );
  toAccount.transactionHistory.push(
    `Received ${amount} from account ${fromAccountId}`
  );

  await fromAccount.save();
  await toAccount.save();
  res.json({ fromAccount, toAccount });
};

const getHistory = async (req, res) => {
  const accountId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ message: "Invalid account ID format" });
  }

  try {
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({
      history: account.transactionHistory,
      balance: account.balance,
      id: accountId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching account history" });
  }
};

module.exports = {
  login,
  createAccount,
  deposit,
  withdraw,
  sendMoney,
  getHistory,
};
