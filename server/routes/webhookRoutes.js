const express = require('express');
const { performRAG } = require('../utils/ragEngine');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Twilio Webhook for WhatsApp
router.post('/whatsapp/:kbId', async (req, res) => {
  const { Body, From } = req.body;
  const { kbId } = req.params;

  console.log(`[WhatsApp Webhook] Message from ${From}: ${Body}`);

  try {
    // 1. Get response from RAG
    const { stream } = await performRAG(Body, kbId);
    
    // Twilio needs a full response (non-streaming) or we can use their API to send messages back
    // For simplicity, we collect the stream and send it back as TwiML
    let fullResponse = '';
    for await (const chunk of stream) {
      fullResponse += (chunk.content || '');
    }

    // 2. Return TwiML response
    res.type('text/xml');
    res.send(`
      <Response>
        <Message>${fullResponse}</Message>
      </Response>
    `);

  } catch (error) {
    console.error('[WhatsApp Error]:', error);
    res.type('text/xml');
    res.send(`<Response><Message>Sorry, I encountered an error processing your request.</Message></Response>`);
  }
});

// Telegram Webhook (Skeleton)
router.post('/telegram/:kbId', async (req, res) => {
  const { message } = req.body;
  const { kbId } = req.params;

  if (!message || !message.text) return res.sendStatus(200);

  try {
    const { stream } = await performRAG(message.text, kbId);
    let fullResponse = '';
    for await (const chunk of stream) {
      fullResponse += (chunk.content || '');
    }

    // Use Telegram Bot API to send message back
    // axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: message.chat.id, text: fullResponse });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
