const express = require('express');
const multer = require('multer');
const { processDocument } = require('../utils/documentProcessor');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/:kbId', upload.array('files'), async (req, res) => {
  try {
    const { kbId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];

    for (const file of files) {
      // 1. Create document record
      const document = await prisma.document.create({
        data: {
          name: file.originalname,
          type: file.mimetype,
          knowledgeBaseId: kbId,
        }
      });

      // 2. Process document (parse -> chunk -> embed)
      const chunksWithEmbeddings = await processDocument(file.buffer, file.mimetype);

      // 3. Store chunks with embeddings
      // We use raw SQL for embedding because Prisma doesn't support vector type natively yet
      for (const chunk of chunksWithEmbeddings) {
        await prisma.$executeRaw`
          INSERT INTO "Chunk" (id, content, "documentId", embedding)
          VALUES (gen_random_uuid(), ${chunk.content}, ${document.id}, ${chunk.embedding}::vector)
        `;
      }

      results.push({ documentId: document.id, chunks: chunksWithEmbeddings.length });
    }

    res.json({ message: 'Files processed successfully', results });
  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a document and its chunks
router.delete('/document/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First delete chunks (foreign key relation)
    await prisma.chunk.deleteMany({
      where: { documentId: id }
    });

    // Then delete document
    await prisma.document.delete({
      where: { id }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[Delete Error]:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
