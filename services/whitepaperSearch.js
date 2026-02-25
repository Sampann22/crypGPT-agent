import sections from "./whitepaperLoader.js";

function scoreSection(section, query) {
  const words = query.toLowerCase().split(" ");
  let score = 0;

  words.forEach((word) => {
    if (section.toLowerCase().includes(word)) {
      score += 1;
    }
  });

  return score;
}

export function findRelevantSection(query) {
  let bestScore = 0;
  let bestSection = null;

  sections.forEach((section) => {
    const score = scoreSection(section, query);
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  });

  return bestSection;
}