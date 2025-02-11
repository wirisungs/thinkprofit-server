const express = require('express');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const { firestore } = require('./config/Firebase.config.db');

// Import routes
const transactionsRouter = require('./routes/Transactions.route');
const savingGoalsRouter = require('./routes/SavingGoals.route');
const categoriesRouter = require('./routes/Categories.route');
const budgetsRouter = require('./routes/Budgets.route');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Configure routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/saving-goals', savingGoalsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);

// Firebase Firestore test route
app.get('/test-firebase', async (req, res) => {
  try {
    const testCollection = await firestore.collection('testCollection').get();
    const docs = testCollection.docs.map((doc) => doc.data());
    res.status(200).json({ message: 'Firebase connected successfully!', docs });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to Firebase', error });
  }
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Event emitter
EventEmitter.defaultMaxListeners = 20;

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`ThinkProfit Server is running on http://localhost:${port}`);
});

module.exports = app;
