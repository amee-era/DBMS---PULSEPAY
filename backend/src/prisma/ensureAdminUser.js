const bcrypt = require('bcryptjs');
const prisma = require('./client');

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pulsepay.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'admin' },
      });
    }

    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    },
  });
}

module.exports = ensureAdminUser;
