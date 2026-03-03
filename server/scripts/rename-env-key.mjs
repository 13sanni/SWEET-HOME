import fs from "fs";

const [, , filePath, fromKey, toKey] = process.argv;

if (!filePath || !fromKey || !toKey) {
  console.error("Usage: node rename-env-key.mjs <filePath> <fromKey> <toKey>");
  process.exit(1);
}

const content = fs.readFileSync(filePath, "utf8");
const lines = content.split(/\r?\n/);
let renamed = false;

const updated = lines.map((line) => {
  if (line.startsWith(`${fromKey}=`)) {
    renamed = true;
    return `${toKey}=${line.slice(fromKey.length + 1)}`;
  }
  return line;
});

if (renamed) {
  fs.writeFileSync(filePath, updated.join("\n"));
  console.log(`Renamed ${fromKey} -> ${toKey}`);
} else {
  console.log(`${fromKey} not found`);
}
