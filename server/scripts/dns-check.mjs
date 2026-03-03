import dns from "dns/promises";
import dnsSync from "dns";

const host = "_mongodb._tcp.cluster0.ajp6gr7.mongodb.net";

if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean);
  dnsSync.setServers(servers);
  console.log("Using DNS servers:", servers.join(", "));
}

try {
  const records = await dns.resolveSrv(host);
  console.log("SRV records:", records);
} catch (error) {
  console.error("SRV lookup failed:", error.code, error.message);
}
