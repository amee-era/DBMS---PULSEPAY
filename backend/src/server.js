const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ensureAdminUser = require('./prisma/ensureAdminUser');

dotenv.config();

const app = express();
const PORT = 5000;
const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

ensureAdminUser()
  .then(() => {
    console.log('Admin account is ready');
  })
  .catch((error) => {
    console.log(`Admin setup skipped: ${error.message}`);
  });

app.listen(PORT, () => {
  console.log('Server running on port 5000');
});
