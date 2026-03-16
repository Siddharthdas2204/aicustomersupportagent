try {
  const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
  console.log('Success: RecursiveCharacterTextSplitter loaded');
} catch (e) {
  console.error('Error loading RecursiveCharacterTextSplitter:', e);
}
