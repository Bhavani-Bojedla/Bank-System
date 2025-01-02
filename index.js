const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bankRoutes = require('./routes/bankRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors(({
    origin:"*"
  })));

app.use('/api/bank', bankRoutes);

const PORT = 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));