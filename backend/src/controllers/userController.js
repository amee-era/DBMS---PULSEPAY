const prisma = require('../prisma/client');

async function getDashboard(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: req.user.userId }, { receiverId: req.user.userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { email: true } },
        receiver: { select: { email: true } },
      },
    });

    return res.json({ user, transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
}

async function transferMoney(req, res) {
  try {
    const { receiverEmail, amount, isRetry = false, previousRetryCount = 0 } = req.body;
    const transferAmount = Number(amount);

    if (!receiverEmail || Number.isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ message: 'Valid receiver email and amount are required' });
    }

    const senderId = req.user.userId;

    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (receiver.id === senderId) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    const parsedRetryCount = Number(previousRetryCount);
    const retryCount = isRetry ? (Number.isNaN(parsedRetryCount) ? 1 : parsedRetryCount + 1) : 0;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const sender = await tx.user.findUnique({ where: { id: senderId } });

        if (!sender || sender.balance < transferAmount) {
          throw new Error('Insufficient balance');
        }

        await tx.user.update({
          where: { id: senderId },
          data: { balance: { decrement: transferAmount } },
        });

        await tx.user.update({
          where: { id: receiver.id },
          data: { balance: { increment: transferAmount } },
        });

        const transaction = await tx.transaction.create({
          data: {
            senderId,
            receiverId: receiver.id,
            amount: transferAmount,
            status: 'SUCCESS',
            retry_count: retryCount,
          },
        });

        return transaction;
      });

      return res.json({ message: 'Transfer successful', transaction: result });
    } catch (error) {
      retryCount += 1;

      const failedTx = await prisma.transaction.create({
        data: {
          senderId,
          receiverId: receiver.id,
          amount: transferAmount,
          status: retryCount > 0 ? 'RETRIED' : 'FAILED',
          retry_count: retryCount,
        },
      });

      return res.status(400).json({
        message: error.message || 'Transfer failed',
        transaction: failedTx,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
}

module.exports = {
  getDashboard,
  transferMoney,
};
