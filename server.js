const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const port = Number(process.env.PORT || 8000);
const root = __dirname;
const files = new Set([
  "index.html", "styles.css", "script.js", "strings.js", "projects.json"
]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let file;
  try {
    file = decodeURIComponent(new URL(req.url, "http://localhost").pathname).slice(1);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (!file) file = "index.html";
  const segments = file.split(/[\\/]/);
  if (segments.some(segment => segment.startsWith(".") || segment.includes("\0")) ||
      (!files.has(file) && !file.startsWith("assets/") && !file.startsWith("screens/"))) {
    res.writeHead(404).end();
    return;
  }

  try {
    const content = await readFile(path.join(root, file));
    res.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch (error) {
    res.writeHead(["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code) ? 404 : 500).end();
  }
});

server.on("error", error => {
  console.error(error.code === "EADDRINUSE"
    ? `Port ${port} is in use. Stop the other server or run PORT=${port + 1} npm run dev.`
    : error.message);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Portfolio running at http://127.0.0.1:${server.address().port}`);
});
