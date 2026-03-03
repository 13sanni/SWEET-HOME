import "dotenv/config";
import fs from "fs";

const envPath = ".env";
const envContent = fs.readFileSync(envPath, "utf8");
const currentUri = process.env.MONGODB_URI;

if (!currentUri) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}

if (currentUri.startsWith("mongodb+srv://")) {
  console.log("MONGODB_URI is already mongodb+srv://");
  process.exit(0);
}

if (!currentUri.startsWith("mongodb://")) {
  console.error("MONGODB_URI is not a recognized Mongo URI");
  process.exit(1);
}

const parsed = new URL(currentUri);
const username = parsed.username;
const password = parsed.password;

const firstHost = parsed.host.split(",")[0];
const parts = firstHost.split(".");
if (parts.length < 3) {
  console.error("Unable to derive Atlas domain from current MONGODB_URI");
  process.exit(1);
}

const atlasSuffix = parts.slice(1).join(".");
const clusterHost = `cluster0.${atlasSuffix}`;
const dbName = parsed.pathname?.replace(/^\//, "") || "hotel-booking";
const appName = parsed.searchParams.get("appName") || "Cluster0";

const srvUri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${clusterHost}/${dbName}?retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;

const updated = envContent.replace(/^MONGODB_URI=.*/m, `MONGODB_URI=${srvUri}`);
fs.writeFileSync(envPath, updated);

console.log("Updated MONGODB_URI to mongodb+srv:// format in server/.env");
