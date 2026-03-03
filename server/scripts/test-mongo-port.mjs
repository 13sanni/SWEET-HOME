import net from "net";

const hosts = [
  "ac-gsn5gxv-shard-00-00.wyjl0ql.mongodb.net",
  "ac-gsn5gxv-shard-00-01.wyjl0ql.mongodb.net",
  "ac-gsn5gxv-shard-00-02.wyjl0ql.mongodb.net",
];

const port = 27017;

const checkHost = (host) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const timeoutMs = 5000;

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      socket.destroy();
      resolve({ host, ok: true, message: `connected on ${port}` });
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve({ host, ok: false, message: "timeout" });
    });

    socket.once("error", (error) => {
      socket.destroy();
      resolve({ host, ok: false, message: `${error.code || "ERROR"}: ${error.message}` });
    });

    socket.connect(port, host);
  });

for (const host of hosts) {
  const result = await checkHost(host);
  console.log(`${result.host} -> ${result.ok ? "OK" : "FAIL"} (${result.message})`);
}
