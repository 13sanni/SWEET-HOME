import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const line = env
  .split(/\r?\n/)
  .find((item) => item.trim().startsWith("MONGODB_URI="));

if (!line) {
  console.log("MONGODB_URI line not found");
  process.exit(0);
}

const raw = line.slice("MONGODB_URI=".length);
const value = raw.trim();
const hasQuotes =
  (value.startsWith('"') && value.endsWith('"')) ||
  (value.startsWith("'") && value.endsWith("'"));
const stripped = hasQuotes ? value.slice(1, -1) : value;
const hasSpaces = /\s/.test(stripped);
const hasSrv = stripped.startsWith("mongodb+srv://");
const hasStandard = stripped.startsWith("mongodb://");

let host = "unparsed";
try {
  const withoutScheme = stripped.replace(/^mongodb(\+srv)?:\/\//, "");
  const hostPart = withoutScheme.split("/")[0];
  host = hostPart.includes("@") ? hostPart.split("@").pop() : hostPart;
} catch {
  host = "parse-error";
}

const maskedHost = host.replace(/^[^\.]+/, (m) => (m.length <= 2 ? "**" : `${m.slice(0, 2)}***`));

console.log(`scheme: ${hasSrv ? "mongodb+srv" : hasStandard ? "mongodb" : "unknown"}`);
console.log(`has_wrapping_quotes: ${hasQuotes}`);
console.log(`has_whitespace: ${hasSpaces}`);
console.log(`host: ${maskedHost}`);
