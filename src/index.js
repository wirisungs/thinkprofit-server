const express = require('express');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const { admin, database } = require('./config/Firebase.config.db');
const { NODE_ENV, PORT, isDevelopment } = require('./config/Environment.config');
require('dotenv').config();


// Import routes
const transactionsRouter = require('./routes/Transactions.route');
const savingGoalsRouter = require('./routes/SavingGoals.route');
const categoriesRouter = require('./routes/Categories.route');
const budgetsRouter = require('./routes/Budgets.route');
const authRouter = require('./routes/Auth.route');

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
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/saving-goals', savingGoalsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);

// Firebase Realtime Database test route
app.get('/test-firebase', (req, res) => {
  const ref = database.ref('/');
  ref.set({
    test: 'Hello Firebase!'
  })
  .then(() => {
    res.status(200).json({ message: 'Firebase write successful!' });
  })
  .catch((error) => {
    console.error('Firebase connection error:', error);
    res.status(500).json({ message: 'Error connecting to Firebase', error: error.message });
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Event emitter
myEmitter.defaultMaxListeners = 10;
// Xóa listener cũ trước khi thêm mới
myEmitter.removeAllListeners("exit");
myEmitter.on("exit", () => {
  console.log("Exit event triggered!");
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  if (isDevelopment) {
    console.log('Development features enabled');
  }
});

module.exports = app;
