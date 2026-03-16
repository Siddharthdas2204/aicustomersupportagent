const express = require('express');
const { performRAG } = require('../utils/ragEngine');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Get widget configuration
router.get('/:kbId/config', async (req, res) => {
  try {
    const { kbId } = req.params;
    const kb = await prisma.knowledgeBase.findUnique({
      where: { id: kbId },
      select: { name: true, description: true, widgetConfig: true }
    });
    
    // Default context for Pinky's Kitchen if config is empty
    const defaultConfig = {
      primaryColor: '#db2777', // Pink 600
      welcomeMessage: "Hi! I'm Pinky's Assistant. Ask me about our catering menu or today's specials!",
      botName: "Pinky's Bot",
      context: "Pinky's Kitchen is a gourmet food venture specializing in home-style catering and healthy meal boxes."
    };

    res.json({
      name: kb?.name || "Pinky's Kitchen",
      config: kb?.widgetConfig || defaultConfig
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Post widget message (No Auth required for widgets usually, or use a restricted token)
router.post('/:kbId/message', async (req, res) => {
  try {
    const { kbId } = req.params;
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: 'Query required' });

    // For public widgets, we don't save per-user chats in the same table 
    // or we use a guest userId. Let's use 'guest' for now.
    
    const { stream, sources } = await performRAG(query, kbId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const content = chunk.content || '';
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[Widget Chat Error]:', error);
    res.status(500).end();
  }
});

module.exports = router;
