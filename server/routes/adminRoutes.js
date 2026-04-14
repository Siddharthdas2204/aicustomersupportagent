const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to check if user is ADMIN (In a real app, verify Clerk session and check role in DB)
const isAdmin = async (req, res, next) => {
  const clerkId = req.headers['x-clerk-user-id'];
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  const isOwner = user && (
    user.role === 'ADMIN' || 
    user.email === 'siddharthdas2204@gmail.com'
  );

  if (isOwner) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

// Get all users with their stats
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { 
            knowledgeBases: true,
            chats: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all documents/uploads across the platform
router.get('/uploads', isAdmin, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        knowledgeBase: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all chat history
router.get('/chats', isAdmin, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        user: true,
        knowledgeBase: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Platform analytics
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalKBs = await prisma.knowledgeBase.count();
    const totalDocs = await prisma.document.count();
    const totalChats = await prisma.chat.count();
    const totalMessages = await prisma.message.count();

    // Group by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chatsByDay = await prisma.chat.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: true
    });

    res.json({
      totals: {
        users: totalUsers,
        knowledgeBases: totalKBs,
        documents: totalDocs,
        chats: totalChats,
        messages: totalMessages
      },
      activity: chatsByDay
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
