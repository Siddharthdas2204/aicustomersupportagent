const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { OpenAIEmbeddings } = require('@langchain/openai');

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

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
  } else if (type === 'text/plain') {
    text = buffer.toString('utf-8');
  } else if (['image/jpeg', 'image/png', 'image/jpg'].includes(type)) {
    const { data: { text: ocrText } } = await Tesseract.recognize(buffer, 'eng');
    text = ocrText;
  } else {
    throw new Error(`Unsupported file type: ${type}`);
  }

  // Clean text a bit
  text = text.replace(/\s+/g, ' ').trim();

  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  
  // Generate embeddings for each chunk
  const chunksWithEmbeddings = await Promise.all(
    docs.map(async (doc) => {
      const embedding = await embeddings.embedQuery(doc.pageContent);
      return {
        content: doc.pageContent,
        embedding
      };
    })
  );

  return chunksWithEmbeddings;
};

module.exports = { processDocument };
