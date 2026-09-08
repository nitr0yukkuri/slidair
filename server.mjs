import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const noCacheExtensions = new Set([".html", ".css", ".js", ".mjs"]);

export function resolveFilePath(pathname) {
  const requestPath = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
  const filePath = normalize(join(root, requestPath));
  const relativePath = relative(root, filePath);
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    return null;
  }
  return filePath;
}

export function contentType(filePath) {
  return types[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function cacheControl(filePath) {
  return noCacheExtensions.has(extname(filePath).toLowerCase())
    ? "no-cache"
    : "public, max-age=3600";
}

export function createStaticServer() {
  return createServer(async (req, res) => {
    const method = req.method ?? "GET";
    if (method !== "GET" && method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method Not Allowed");
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    const filePath = resolveFilePath(pathname);
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const body = await readFile(filePath);
      res.writeHead(200, {
        "Content-Length": body.byteLength,
        "Content-Type": contentType(filePath),
        "Cache-Control": cacheControl(filePath),
      });
      res.end(method === "HEAD" ? undefined : body);
    } catch (error) {
      const statusCode = error?.code === "ENOENT" ? 404 : 500;
      res.writeHead(statusCode);
      res.end(statusCode === 404 ? "Not found" : "Internal Server Error");
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createStaticServer().listen(4173, "127.0.0.1", () => {
    console.log("slide-atmosphere: http://127.0.0.1:4173");
  });
}
