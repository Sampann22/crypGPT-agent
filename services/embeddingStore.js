import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_PATH = path.join(__dirname, '../data/embeddings.json');

/**
 * Load embeddings from disk
 */
function loadEmbeddings() {
  try {
    if (fs.existsSync(EMBEDDINGS_PATH)) {
      const content = fs.readFileSync(EMBEDDINGS_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading embeddings:', error.message);
  }
  return { sections: [] };
}

/**
 * Save embeddings to disk
 */
function saveEmbeddings(embeddings) {
  try {
    fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(embeddings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving embeddings:', error.message);
  }
}

/**
 * Generate embeddings for whitepaper sections using Gemini
 * This is called once to create embeddings.json
 */
async function generateEmbeddingsForWhitepaper(sections) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Embeddings cannot be generated.');
    return null;
  }

  try {
    const embeddings = {
      sections: [],
      model: 'embedding-001',
      generatedAt: new Date().toISOString()
    };

    for (const section of sections) {
      // Use Gemini API to embed the section
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: {
            parts: [{ text: section.content }]
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`Error embedding section "${section.id}":`, error);
        continue;
      }

      const data = await response.json();
      const vector = data?.embedding?.values || [];

      embeddings.sections.push({
        id: section.id,
        content: section.content,
        title: section.title,
        vector,
        createdAt: new Date().toISOString()
      });
    }

    saveEmbeddings(embeddings);
    console.log(`Generated embeddings for ${embeddings.sections.length} sections`);
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error.message);
    return null;
  }
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return 0;
  }

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  return dotProduct / (mag1 * mag2);
}

/**
 * Get embedding for a query
 */
async function getQueryEmbedding(query) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text: query }]
        }
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.embedding?.values || null;
  } catch (error) {
    console.error('Error getting query embedding:', error.message);
    return null;
  }
}

/**
 * Find most relevant whitepaper sections for a query
 */
async function findRelevantSections(query, topK = 3) {
  const embeddings = loadEmbeddings();

  if (!embeddings.sections || embeddings.sections.length === 0) {
    console.warn('No embeddings found. Whitepaper sections cannot be retrieved.');
    return [];
  }

  const queryEmbedding = await getQueryEmbedding(query);
  if (!queryEmbedding) {
    return [];
  }

  // Calculate similarity scores
  const scored = embeddings.sections.map(section => ({
    ...section,
    similarity: cosineSimilarity(queryEmbedding, section.vector)
  }));

  // Sort by similarity and return top K
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(({ vector, ...rest }) => rest); // Remove vector to reduce token usage
}

export const embeddingStore = {
  loadEmbeddings,
  saveEmbeddings,
  generateEmbeddingsForWhitepaper,
  getQueryEmbedding,
  findRelevantSections,
  cosineSimilarity
};
