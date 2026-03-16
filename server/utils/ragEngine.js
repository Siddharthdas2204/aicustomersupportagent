const { PrismaClient } = require('@prisma/client');
const { ChatOpenAI } = require('@langchain/openai');
const { OpenAIEmbeddings } = require('@langchain/openai');
const prisma = new PrismaClient();

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o',
  streaming: true,
});

/**
 * Perform RAG search and generate response.
 * @param {string} query - User question
 * @param {string} knowledgeBaseId - KB ID to search in
 * @returns {Promise<{stream: any, sources: any[]}>}
 */
const performRAG = async (query, knowledgeBaseId) => {
  // 1. Generate embedding for the query
  const queryEmbedding = await embeddings.embedQuery(query);
  
  // 2. Search for similar chunks in the specific KB
  // Using cosine similarity (vector <=> vector is cosine distance, 1 - distance is similarity)
  // [Prisma Raw Query for pgvector]
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

  // 4. Create prompt
  const systemPrompt = `You are a helpful AI Customer Support Agent. Use the following context to answer the user's question. If the answer isn't in the context, say you don't know based on the provided data, but try to be as helpful as possible.
  
Context:
${context}

Always cite your sources clearly if you use information from them.`;

  // 5. Stream response
  const stream = await model.stream([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ]);

  return {
    stream,
    sources: chunks.map(c => ({ documentName: c.documentName, chunkId: c.id }))
  };
};

module.exports = { performRAG };
