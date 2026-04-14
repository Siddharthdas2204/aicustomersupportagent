const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Perform RAG search and generate response using Gemini for both chat and embeddings.
 * @param {string} query - User question
 * @param {string} knowledgeBaseId - KB ID to search in
 * @returns {Promise<{stream: any, sources: any[]}>}
 */
const performRAG = async (query, knowledgeBaseId) => {
  // 1. Generate embedding for the query using Gemini
  const resultEmbed = await embeddingModel.embedContent(query);
  const queryEmbedding = resultEmbed.embedding.values;

  // 2. Search for similar chunks in the specific KB
  const chunks = await prisma.$queryRaw`
    SELECT 
      c.id, 
      c.content, 
      d.name as "documentName",
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM "Chunk" c
    JOIN "Document" d ON c."documentId" = d.id
    WHERE d."knowledgeBaseId" = ${knowledgeBaseId}
    ORDER BY similarity DESC
    LIMIT 5;
  `;

  // 3. Construct context from chunks
  const context = chunks.map(c => `[Source: ${c.documentName}] ${c.content}`).join('\n\n');

  // 4. Create Gemini model and prompt
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const prompt = `You are a helpful AI Customer Support Agent. Use the following context to answer the user's question. 
If the answer isn't in the context, say you don't know based on the provided data, but try to be as helpful as possible.

Context:
${context}

User Question: ${query}

Always cite your sources clearly if you use information from them. Respond in a helpful, professional tone.`;

  // 5. Stream response from Gemini
  const result = await model.generateContentStream(prompt);

  // Gemini stream is an async iterator
  const stream = (async function* () {
    for await (const chunk of result.stream) {
      yield { content: chunk.text() };
    }
  })();

  return {
    stream,
    sources: chunks.map(c => ({ documentName: c.documentName, chunkId: c.id }))
  };
};

module.exports = { performRAG };
