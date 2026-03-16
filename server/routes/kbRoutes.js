const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all knowledge bases for a user
router.get('/', async (req, res) => {
  try {
    const clerkId = req.headers['x-clerk-user-id'];
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        knowledgeBases: {
          include: {
            _count: {
              select: { documents: true }
            }
          }
        }
      }
    });

    if (!user) {
      // Create user if doesn't exist? Or just return empty
      return res.json([]);
    }

    const kbs = user.knowledgeBases.map(kb => ({
      ...kb,
      documentsCount: kb._count.documents
    }));

    res.json(kbs);
  } catch (error) {
    console.error('Error fetching KBs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new knowledge base
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const clerkId = req.headers['x-clerk-user-id'];
    const email = req.headers['x-clerk-email'];

    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    let user = await prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: email || `user_${clerkId}@example.com`,
          name: req.headers['x-clerk-name'] || 'User'
        }
      });
    }

    const kb = await prisma.knowledgeBase.create({
      data: {
        name,
        description,
        userId: user.id
      }
    });

    res.status(201).json(kb);
  } catch (error) {
    console.error('Error creating KB:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single KB with documents
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: {
        documents: true
      }
    });

    if (!kb) return res.status(404).json({ error: 'Knowledge Base not found' });
    res.json(kb);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
