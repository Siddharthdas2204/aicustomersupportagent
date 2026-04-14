const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Process a document: parse text, split into chunks, and generate embeddings.
 * @param {Buffer} buffer - File buffer
 * @param {string} type - MIME type
 * @returns {Promise<Array<{content: string, embedding: number[]}>>}
 */
const processDocument = async (buffer, type) => {
  let text = '';
  
  if (type === 'application/pdf') {
    const data = await pdf(buffer);
    text = data.text;
  } else if (type === 'text/plain' || type === 'text/markdown') {
    text = buffer.toString('utf-8');
  } else if (['image/jpeg', 'image/png', 'image/jpg'].includes(type)) {
    const { data: { text: ocrText } } = await Tesseract.recognize(buffer, 'eng');
    text = ocrText;
  } else {
    throw new Error(`Unsupported file type: ${type}`);
  }

  // Clean text
  text = text.replace(/\s+/g, ' ').trim();

  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  
  // Generate embeddings for each chunk using Gemini
  const chunksWithEmbeddings = await Promise.all(
    docs.map(async (doc) => {
      const result = await embeddingModel.embedContent(doc.pageContent);
      return {
        content: doc.pageContent,
        embedding: result.embedding.values
      };
    })
  );

  return chunksWithEmbeddings;
};

module.exports = { processDocument };
