const Sentiment = require('sentiment');
const sentimentMapper = new Sentiment();

/**
 * Analyze sentiment of a text and return normalized score and label.
 * @param {string} text 
 * @returns {{ score: number, label: string }}
 */
const analyzeSentiment = (text) => {
  const result = sentimentMapper.analyze(text);
  const score = result.comparative; // Normalized score (-5 to 5 typically)
  
  let label = 'Neutral';
  if (score > 0.05) label = 'Positive';
  if (score < -0.05) label = 'Negative';

  return { 
    score: score * 10, // Scale for better charting (e.g. -50 to 50)
    label 
  };
};

module.exports = { analyzeSentiment };
