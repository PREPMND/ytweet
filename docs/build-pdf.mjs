/**
 * Combines every numbered markdown part in this folder into one styled HTML
 * document, ready to be printed to PDF by headless Chrome.
 *
 *   node docs/build-pdf.mjs
 *
 * Deliberately dependency-free: a tiny purpose-built Markdown renderer rather
 * than pulling `marked` + `puppeteer` (~300 MB) for a one-off build.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

const files = fs
    .readdirSync(DIR)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .sort();

if (!files.length) {
    console.error("No numbered markdown files found in", DIR);
    process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Minimal Markdown → HTML                                            */
/* ------------------------------------------------------------------ */

const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(text) {
    return text
        // Inline code first, so its contents are not processed further.
        .replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href=\"$2\">$1</a>");
}

function renderTable(rows) {
    const cells = (line) =>
        line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

    const header = cells(rows[0]);
    const body = rows.slice(2).map(cells);

    return (
        "<table><thead><tr>" +
        header.map((h) => `<th>${inline(h)}</th>`).join("") +
        "</tr></thead><tbody>" +
        body
            .map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>")
            .join("") +
        "</tbody></table>"
    );
}

function markdownToHtml(md) {
    const lines = md.split("\n");
    const out = [];

    let inCode = false;
    let codeLang = "";
    let codeBuf = [];
    let listType = null;
    let tableBuf = [];
    let quoteBuf = [];

    const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
    const closeTable = () => { if (tableBuf.length) { out.push(renderTable(tableBuf)); tableBuf = []; } };
    const closeQuote = () => {
        if (quoteBuf.length) {
            out.push(`<blockquote>${quoteBuf.map((l) => `<p>${inline(l)}</p>`).join("")}</blockquote>`);
            quoteBuf = [];
        }
    };
    const closeAll = () => { closeList(); closeTable(); closeQuote(); };

    for (const raw of lines) {
        const line = raw.replace(/\s+$/, "");

        // Fenced code blocks
        const fence = line.match(/^```(\w*)/);
        if (fence) {
            if (inCode) {
                out.push(`<pre class="lang-${codeLang}"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
                codeBuf = [];
                inCode = false;
            } else {
                closeAll();
                inCode = true;
                codeLang = fence[1] || "text";
            }
            continue;
        }
        if (inCode) { codeBuf.push(raw); continue; }

        // Tables
        if (/^\|.*\|$/.test(line)) { closeList(); closeQuote(); tableBuf.push(line); continue; }
        closeTable();

        // Blockquotes
        if (/^>\s?/.test(line)) { closeList(); quoteBuf.push(line.replace(/^>\s?/, "")); continue; }
        closeQuote();

        if (!line.trim()) { closeList(); continue; }

        // Horizontal rule
        if (/^---+$/.test(line)) { closeList(); out.push("<hr>"); continue; }

        // Headings
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
            closeList();
            const level = h[1].length;
            const text = inline(h[2]);
            const id = h[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            out.push(`<h${level} id="${id}">${text}</h${level}>`);
            continue;
        }

        // Lists
        const ul = line.match(/^\s*[-*]\s+(.*)$/);
        const ol = line.match(/^\s*\d+\.\s+(.*)$/);
        if (ul || ol) {
            const want = ul ? "ul" : "ol";
            if (listType !== want) { closeList(); out.push(`<${want}>`); listType = want; }
            out.push(`<li>${inline((ul || ol)[1])}</li>`);
            continue;
        }
        closeList();

        out.push(`<p>${inline(line)}</p>`);
    }

    closeAll();
    if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);

    return out.join("\n");
}

/* ------------------------------------------------------------------ */
/* Assemble                                                           */
/* ------------------------------------------------------------------ */

const sections = files.map((file) => {
    const md = fs.readFileSync(path.join(DIR, file), "utf8");
    const title = (md.match(/^#\s+(.*)$/m) || [, file])[1];
    return { file, title, html: markdownToHtml(md) };
});

const toc = sections
    .map((s, i) => `<li><a href="#part-${i}">${s.title}</a></li>`)
    .join("\n");

const body = sections
    .map((s, i) => `<section class="part" id="part-${i}">${s.html}</section>`)
    .join("\n");

const today = new Date().toISOString().slice(0, 10);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SocialSphere — Interview Preparation</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }

  :root {
    --ink: #16181d;
    --muted: #5b616e;
    --line: #dfe3e8;
    --accent: #1f4ed8;
    --code-bg: #f6f7f9;
  }

  * { box-sizing: border-box; }

  body {
    font-family: "Segoe UI", -apple-system, system-ui, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: var(--ink);
    margin: 0;
  }

  h1, h2, h3, h4 { line-height: 1.25; font-weight: 650; margin: 1.4em 0 .5em; }
  h1 { font-size: 20pt; color: var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: .25em; }
  h2 { font-size: 14pt; margin-top: 1.6em; border-bottom: 1px solid var(--line); padding-bottom: .2em; }
  h3 { font-size: 11.5pt; }
  h4 { font-size: 10.5pt; color: var(--muted); }

  /* Keep a heading with the text that follows it. */
  h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }

  p { margin: .55em 0; }
  a { color: var(--accent); text-decoration: none; }

  code {
    font-family: "Cascadia Mono", Consolas, "SF Mono", monospace;
    font-size: 9pt;
    background: var(--code-bg);
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: .08em .32em;
  }

  pre {
    background: var(--code-bg);
    border: 1px solid var(--line);
    border-left: 3px solid var(--accent);
    border-radius: 5px;
    padding: .7em .9em;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    break-inside: avoid;
    page-break-inside: avoid;
    margin: .8em 0;
  }
  pre code { background: none; border: 0; padding: 0; font-size: 8.6pt; line-height: 1.45; }

  blockquote {
    margin: .9em 0;
    padding: .5em .95em;
    border-left: 3px solid var(--accent);
    background: #f4f7ff;
    border-radius: 0 5px 5px 0;
  }
  blockquote p { margin: .35em 0; }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: .9em 0;
    font-size: 9.2pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  th, td { border: 1px solid var(--line); padding: .4em .6em; text-align: left; vertical-align: top; }
  th { background: var(--code-bg); font-weight: 650; }

  ul, ol { margin: .55em 0; padding-left: 1.5em; }
  li { margin: .22em 0; }

  hr { border: 0; border-top: 1px solid var(--line); margin: 1.6em 0; }

  .cover {
    height: 247mm;
    display: flex; flex-direction: column; justify-content: center;
    text-align: center;
    break-after: page; page-break-after: always;
  }
  .cover h1 { border: 0; font-size: 30pt; margin-bottom: .1em; }
  .cover .sub { font-size: 13pt; color: var(--muted); }
  .cover .meta { margin-top: 2.5em; font-size: 10pt; color: var(--muted); }

  .toc { break-after: page; page-break-after: always; }
  .toc ol { font-size: 11pt; line-height: 2; }

  .part { break-before: page; page-break-before: always; }
</style>
</head>
<body>

<div class="cover">
  <h1>SocialSphere</h1>
  <div class="sub">Full-Stack Interview Preparation</div>
  <div class="sub" style="font-size:11pt;margin-top:.6em">
    React &middot; Node &middot; Express &middot; MongoDB &middot; Redis &middot; Socket.IO
  </div>
  <div class="meta">
    Architecture, language fundamentals, every bug explained,<br>
    design decisions and interview Q&amp;A<br><br>
    Generated ${today}
  </div>
</div>

<div class="toc">
  <h1>Contents</h1>
  <ol>${toc}</ol>
</div>

${body}

</body>
</html>`;

const outPath = path.join(DIR, "SocialSphere-Interview-Prep.html");
fs.writeFileSync(outPath, html, "utf8");

console.log(`Wrote ${outPath}`);
console.log(`Combined ${files.length} parts: ${files.join(", ")}`);
