const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

function handleAuthError(error, res, fallbackMessage) {
  const message = error?.message || '';

  if (message.includes('Authentication failed against database server')) {
    return res.status(503).json({
      message: 'Database connection failed. Check DATABASE_URL credentials in backend .env',
    });
  }

  if (message.includes('does not exist in the current database')) {
    return res.status(503).json({
      message: 'Database is not migrated. Run: npm run prisma:migrate',
    });
  }

  return res.status(500).json({ message: fallbackMessage });
}

async function register(req, res) {
  try {
    console.log('Register request body:', req.body);
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pulsepay.com';
    const requestedRole = role === 'admin' ? 'admin' : 'user';

    if (requestedRole === 'admin' && email !== adminEmail) {
      return res.status(403).json({ message: 'Admin role is restricted' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: requestedRole,
      },
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    return handleAuthError(error, res, 'Registration failed');
  }
}

async function login(req, res) {
  try {
    console.log('Login request body:', req.body);
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (loginType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Use User login for this account' });
    }

    if (loginType === 'user' && user.role !== 'user') {
      return res.status(403).json({ message: 'Use Admin login for admin account' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      role: user.role,
    });
  } catch (error) {
    return handleAuthError(error, res, 'Login failed');
  }
}

async function resetPassword(req, res) {
  try {
    console.log('Reset password request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin password cannot be changed here' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return handleAuthError(error, res, 'Password reset failed');
  }
}

module.exports = {
  register,
  login,
  resetPassword,
};
