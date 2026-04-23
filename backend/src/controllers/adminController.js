const prisma = require('../prisma/client');

async function getAdminDashboard(req, res) {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { email: true } },
        receiver: { select: { email: true } },
      },
    });

    const totalTransactions = transactions.length;
    const failedTransactions = transactions.filter((tx) => tx.status === 'FAILED').length;
    const retriedTransactions = transactions.filter((tx) => tx.retry_count > 0 || tx.status === 'RETRIED').length;

    return res.json({
      totalTransactions,
      failedTransactions,
      retriedTransactions,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin dashboard', error: error.message });
  }
}

module.exports = {
  getAdminDashboard,
};
