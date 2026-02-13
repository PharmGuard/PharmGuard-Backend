require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');
require('./models');  // load all models


const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'PharmGuard API is running' }));

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected!');
    return sequelize.sync({ alter: true });
  })
  .then(() => app.listen(PORT, () => console.log(`Server on port ${PORT}`)))
  .catch(err => console.error('DB Error:', err));
