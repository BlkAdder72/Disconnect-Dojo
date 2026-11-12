import http from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const base = new URL("./", import.meta.url);
const read = name => readFile(new URL(name, base), "utf8");
const launchRules = (await read("../README.md")).split(/\r?\n/).find(line => line.startsWith("> Run "));
if (!launchRules) throw new Error("Could not find Claude Project instructions in README.md.");
const policies = (await readdir(new URL("retention-department/", base))).filter(name => name.endsWith(".md")).sort();
const files = ["../identity.md","../rules.md","../examples.md","company.md","account.md",...policies.map(name => "retention-department/" + name)];
const system = [launchRules.slice(2), ...await Promise.all(files.map(async name => "# " + name + "\n" + await read(name)))].join("\n\n");
const assets = new Map([["/",["mode-picker.html","text/html"]],["/conversation.js",["conversation.js","text/javascript"]]]);

export function createServer(key, request = fetch) {
  return http.createServer(async (req,res) => {
    const json = (code, data) => {
      res.writeHead(code, {"Content-Type":"application/json", "Cache-Control":"no-store"});
      res.end(JSON.stringify(data));
    };
    try {
      const host = "127.0.0.1:" + req.socket.localPort;
      if (req.headers.host !== host) return json(403,{error:"Local access only."});
      const asset = assets.get(req.url);
      if (req.method === "GET" && asset) {
        const data = await read(asset[0]);
        res.writeHead(200, {"Content-Type":asset[1] + "; charset=utf-8","Cache-Control":"no-store"});
        return res.end(data);
      }
      if (req.method !== "POST" || req.url !== "/api/turn") return json(404,{error:"Page not found."});
      if (req.headers.origin !== "http://" + host || req.headers["content-type"] !== "application/json") return json(403,{error:"Open the simulator in its own browser tab."});
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 1500000) return json(413,{error:"This call exceeds the transcript limit."});
        chunks.push(chunk);
      }
      let messages;
      try { messages = JSON.parse(Buffer.concat(chunks).toString()).messages; }
      catch { return json(400,{error:"Invalid call data."}); }
      if (!Array.isArray(messages) || messages.length % 2 !== 1 || !messages.every((m,i) =>
        m && m.role === (i % 2 ? "assistant" : "user") && typeof m.content === "string" && m.content.trim()
      )) return json(400,{error:"Incomplete call transcript."});
      const response = await request("https://api.anthropic.com/v1/messages",{
        method:"POST", signal:AbortSignal.timeout(120000),
        headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:process.env.ANTHROPIC_MODEL || "claude-opus-5-5",max_tokens:3500,system,messages})
      });
      if (!response.ok) {
        const detail = {401:"Check the Anthropic API key.",403:"Check model access for your API key.",404:"Check the ANTHROPIC_MODEL setting.",429:"Rate limit reached. Please try again shortly."};
        return json(502,{error:detail[response.status] || "Claude could not process this turn (HTTP " + response.status + "). Check API access and available credit."});
      }
      const result = await response.json();
      const reply = result.content?.filter(block => block.type === "text").map(block => block.text).join("\n").trim();
      if (!reply || result.stop_reason === "max_tokens") return json(502,{error:"Claude returned an incomplete response. Please retry."});
      json(200,{reply});
    } catch {
      json(502,{error:"Could not complete the request. Check your connection and retry."});
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { console.error("Set ANTHROPIC_API_KEY or use the Windows launcher."); process.exit(1); }
  const server = createServer(key);
  server.listen(0,"127.0.0.1",() => {
    const url = "http://127.0.0.1:" + server.address().port;
    console.log("Open " + url + " to start. Close this window to stop the simulator.");
    if (process.argv.includes("--open") && process.platform === "win32") execFile("rundll32.exe",["url.dll,FileProtocolHandler",url]);
  });
}
