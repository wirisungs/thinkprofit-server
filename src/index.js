const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const EventEmitter = require('events');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

//parse application/x-www-form-urlencoded
app.use(bodyParser.json());

//logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


//error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

//event emitter
EventEmitter.defaultMaxListeners = 20;

app.listen(port, () => {
  console.log(`ThinkProfit server is running on port http://localhost:${port}`);
})
