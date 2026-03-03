import "dotenv/config";
import { execSync } from "child_process";
import mongoose from "mongoose";

const srvUri = process.env.MONGODB_URI;
if (!srvUri || !srvUri.startsWith("mongodb+srv://")) {
  console.error("MONGODB_URI is missing or not mongodb+srv://");
  process.exit(1);
}

const parsed = new URL(srvUri);
const username = parsed.username;
const password = parsed.password;
const clusterHost = parsed.host;
const appName = parsed.searchParams.get("appName") || "Cluster0";

const srvOutput = execSync(`nslookup -type=SRV _mongodb._tcp.${clusterHost}`, { encoding: "utf8" });
const hosts = srvOutput
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.toLowerCase().startsWith("svr hostname"))
  .map((line) => line.split("=").pop().trim());

if (!hosts.length) {
  console.error("Failed to resolve shard hosts from SRV record");
  process.exit(1);
}

const txtOutput = execSync(`nslookup -type=TXT ${clusterHost}`, { encoding: "utf8" });
const txtMatch = txtOutput.match(/"([^"]+)"/);
const txtOptions = txtMatch ? txtMatch[1] : "authSource=admin";

const standardUri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hosts.join(",")}/hotel-booking?ssl=true&${txtOptions}&retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;

try {
  await mongoose.connect(standardUri, { serverSelectionTimeoutMS: 10000 });
  console.log("Standard URI connection test: SUCCESS");
} catch (error) {
  console.error("Standard URI connection test: FAILED");
  console.error(error.message);
} finally {
  await mongoose.disconnect();
}
