require('dotenv').config(); // 1. Load env vars FIRST

const express = require('express');
const cors = require('cors');

const morgan = require('morgan');
const sequelize = require('./config/database');
 // Import Routes
const authRoutes = require('./routes/authRoutes');
const drugRoutes = require('./routes/drugRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

require('./models'); // Load all models

const app = express();

// MIDDLEWARE
app.use(cors());              // Allow cross-origin requests
app.use(morgan('dev'));       // Log requests to console
app.use(express.json());      // Allow app to read JSON body


// ROUTES
app.use('/api/auth', authRoutes);   // Login & Register
app.use('/api/drugs', drugRoutes);  // Inventory Management
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ message: 'PharmGuard API is running' }));


// 4. Start Server
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected!');
    // syncing models (alter: true updates tables if you change models)
    return sequelize.sync({ alter: true }); 
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB Error:', err));