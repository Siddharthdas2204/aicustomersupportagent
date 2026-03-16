const express = require('express');
const { performRAG } = require('../utils/ragEngine');
const { analyzeSentiment } = require('../utils/sentimentAnalyzer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.post('/:kbId', async (req, res) => {
  try {
    const { kbId } = req.params;
    const { query, userId, chatId } = req.body;

    if (!query || !kbId) {
      return res.status(400).json({ error: 'Query and KnowledgeBaseId are required' });
    }

    // 1. Get or create chat session
    let currentChatId = chatId;
    if (!currentChatId) {
      console.log(`[Chat Creation] Starting new chat for KB: ${kbId}`);
      // Find the KB to get the owner userId if none provided
      let finalUserId = userId;
      if (!finalUserId) {
        const kb = await prisma.knowledgeBase.findUnique({
          where: { id: kbId },
          select: { userId: true }
        });
        console.log(`[Chat Creation] Found KB:`, kb);
        if (!kb) return res.status(404).json({ error: 'KnowledgeBase not found' });
        finalUserId = kb.userId;
      }

      console.log(`[Chat Creation] Creating chat with userId: ${finalUserId}`);
      const chat = await prisma.chat.create({
        data: {
          title: query.slice(0, 50),
          userId: finalUserId,
          knowledgeBaseId: kbId
        }
      });
      currentChatId = chat.id;
      console.log(`[Chat Creation] Chat created: ${currentChatId}`);
    }

    // 2. Save user message with sentiment
    const sentimentResult = analyzeSentiment(query);
    await prisma.message.create({
      data: {
        content: query,
        role: 'user',
        chatId: currentChatId,
        sentiment: sentimentResult.label,
        sentimentScore: sentimentResult.score
      }
    });

    // 3. Set up SSE for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send chatId immediately so UI can use it (e.g. for sharing)
    res.write(`data: ${JSON.stringify({ chatId: currentChatId })}\n\n`);

    const { stream, sources } = await performRAG(query, kbId);

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.content || '';
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content, chatId: currentChatId })}\n\n`);
    }

    // 4. Save assistant message with sources
    await prisma.message.create({
      data: {
        content: fullResponse,
        role: 'assistant',
        chatId: currentChatId,
        sources: sources
      }
    });

    // Send final payload with sources
    res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[Chat Error]:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Get all chats for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await prisma.chat.findMany({
      where: {
        user: {
          clerkId: userId
        }
      },
      include: {
        knowledgeBase: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update chat sharing status
router.patch('/:chatId/share', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isPublic } = req.body;
    
    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { isPublic },
      select: { shareId: true, isPublic: true }
    });
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update share status' });
  }
});

// Get a shared chat (Public)
router.get('/shared/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const chat = await prisma.chat.findUnique({
      where: { shareId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        knowledgeBase: true
      }
    });

    if (!chat || !chat.isPublic) {
      return res.status(404).json({ error: 'Shared chat not found or private' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
