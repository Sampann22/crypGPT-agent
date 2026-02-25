import fs from "fs";

const rawText = fs.readFileSync("./data/whitepaper.txt", "utf-8");

// Split by double line breaks (basic section splitting)
const sections = rawText
  .split(/\n\s*\n/)
  .map((section) => section.trim())
  .filter((section) => section.length > 200); // ignore very small fragments

export default sections;