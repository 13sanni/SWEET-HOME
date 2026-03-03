import fs from "fs";

const expected = [
  "PORT",
  "MONGODB_URI",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_USER",
  "SMTP_PASS",
  "SENDER_EMAIL",
  "CURRENCY",
  "FRONTEND_URL",
];

const content = fs.readFileSync(".env", "utf8").replace(/^\uFEFF/, "");
const lines = content.split(/\r?\n/);

const keys = [];
for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i].trim();
  if (!line || line.startsWith("#")) continue;
  const match = line.match(/^([^=]+)=/);
  if (!match) continue;
  keys.push({ line: i + 1, name: match[1].trim() });
}

const keySet = new Set(keys.map((item) => item.name));
const missing = expected.filter((name) => !keySet.has(name));
const unexpected = keys.filter((item) => !expected.includes(item.name));

console.log("Found keys:");
for (const key of keys) {
  console.log(`${key.line}: ${key.name}`);
}

console.log("---");
console.log(`Missing expected keys: ${missing.length ? missing.join(", ") : "none"}`);
console.log(
  `Unexpected key names: ${unexpected.length ? unexpected.map((x) => `${x.line}:${x.name}`).join(", ") : "none"}`
);
