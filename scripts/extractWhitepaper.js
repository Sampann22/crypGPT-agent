import fs from "fs";
import mammoth from "mammoth";

async function extract() {
  const result = await mammoth.extractRawText({
    path: "./whitepaper.docx"
  });

  const text = result.value;

  fs.writeFileSync("./whitepaper.txt", text);

  console.log("Whitepaper extracted successfully.");
}

extract();