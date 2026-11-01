const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const mdPath = path.resolve('docs/lab-04/Lab04_Report.md');
  const pdfPath = path.resolve('docs/lab-04/Lab04_Report.pdf');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  // Markdown to HTML conversion
  let htmlBody = mdContent
    // Escape basic html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Images
    .replace(/!\[(.*?)\]\(\.\/screenshots\/(.*?)\)/gim, (match, alt, filename) => {
      const imgPath = path.resolve('docs/lab-04/screenshots', filename);
      if (fs.existsSync(imgPath)) {
        const base64 = fs.readFileSync(imgPath).toString('base64');
        return `<div class="img-container"><img src="data:image/png;base64,${base64}" alt="${alt}" /><p class="caption">รูปที่: ${alt}</p></div>`;
      }
      return `<p>[Image: ${alt}]</p>`;
    })
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    // Bold / italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Horizontal rule
    .replace(/^---$/gim, '<hr/>')
    // Ordered list items
    .replace(/^\d+\. (.*$)/gim, '<li class="ordered">$1</li>')
    // Unordered lists
    .replace(/^\s*- (.*$)/gim, '<li>$1</li>')
    // Checkboxes
    .replace(/<li>\[x\] (.*?)<\/li>/gim, '<li class="checked">✅ $1</li>')
    .replace(/<li>\[ \] (.*?)<\/li>/gim, '<li class="unchecked">⬜ $1</li>')
    // Line breaks for paragraphs
    .replace(/\n\n/gim, '</p><p>');

  // Process tables
  const lines = htmlBody.split('\n');
  let inTable = false;
  let tableHtml = '';
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="table-wrapper"><table><thead>';
        const headers = line.split('|').slice(1, -1).map(h => `<th>${h.trim()}</th>`).join('');
        tableHtml += `<tr>${headers}</tr></thead><tbody>`;
      } else if (line.includes('---')) {
        // separator, skip
      } else {
        const cells = line.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
        tableHtml += `<tr>${cells}</tr>`;
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody></table></div>';
        newLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      newLines.push(line);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table></div>';
    newLines.push(tableHtml);
  }

  // Wrap list items in proper <ul> tags
  let processed = newLines.join('\n');
  processed = processed.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/gim, '<ul>$1</ul>');

  const fullHtml = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --zen-primary: #2D6A4F;
    --zen-primary-dark: #1B4332;
    --zen-primary-light: #40916C;
    --zen-surface: #F0F7F4;
    --zen-surface-alt: #FAFDFB;
    --zen-border: #D8F3DC;
    --zen-border-dark: #B7E4C7;
    --zen-text: #1B1F1E;
    --zen-text-muted: #52796F;
    --zen-accent: #95D5B2;
    --zen-danger: #D32F2F;
    --zen-warning: #F9A825;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--zen-text);
    line-height: 1.75;
    font-size: 12.5px;
    background: #fff;
  }

  /* ===================== COVER / HEADER ===================== */
  h1 {
    color: #fff;
    background: linear-gradient(135deg, var(--zen-primary-dark), var(--zen-primary), var(--zen-primary-light));
    font-size: 22px;
    font-weight: 800;
    padding: 28px 32px;
    margin: 0 -14mm;
    margin-top: -18mm;
    border-radius: 0 0 12px 12px;
    letter-spacing: -0.3px;
    text-align: center;
  }

  /* ===================== SECTION HEADERS ===================== */
  h2 {
    color: var(--zen-primary-dark);
    font-size: 16px;
    font-weight: 700;
    border-left: 4px solid var(--zen-primary);
    padding: 8px 0 8px 14px;
    margin-top: 28px;
    margin-bottom: 12px;
    background: linear-gradient(90deg, var(--zen-surface), transparent);
    page-break-after: avoid;
  }

  h3 {
    color: var(--zen-primary);
    font-size: 13.5px;
    font-weight: 600;
    margin-top: 18px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px dashed var(--zen-border);
    page-break-after: avoid;
  }

  /* ===================== PARAGRAPHS ===================== */
  p {
    margin-bottom: 8px;
    text-align: justify;
    text-justify: inter-character;
  }

  /* ===================== TABLES ===================== */
  .table-wrapper {
    margin: 14px 0;
    page-break-inside: avoid;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 11px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--zen-border-dark);
  }

  th {
    background: linear-gradient(180deg, var(--zen-primary-dark), var(--zen-primary));
    color: #fff;
    padding: 8px 10px;
    font-weight: 600;
    text-align: left;
    font-size: 10.5px;
    letter-spacing: 0.2px;
    text-transform: none;
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid var(--zen-border);
    vertical-align: top;
    font-size: 11px;
  }

  tr:nth-child(even) td {
    background-color: var(--zen-surface);
  }

  tr:nth-child(odd) td {
    background-color: #fff;
  }

  tr:last-child td {
    border-bottom: none;
  }

  /* ===================== HORIZONTAL RULE ===================== */
  hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--zen-border-dark), var(--zen-accent), var(--zen-border-dark), transparent);
    margin: 24px 0;
  }

  /* ===================== CODE ===================== */
  code {
    background-color: var(--zen-surface);
    color: var(--zen-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10.5px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    border: 1px solid var(--zen-border);
  }

  /* ===================== LISTS ===================== */
  ul {
    padding-left: 22px;
    margin-bottom: 10px;
  }

  li {
    margin-bottom: 4px;
  }

  li.checked {
    list-style: none;
    margin-left: -22px;
    padding: 3px 8px;
    background-color: var(--zen-surface);
    border-radius: 6px;
    border-left: 3px solid var(--zen-primary-light);
    margin-bottom: 6px;
  }

  /* ===================== IMAGES ===================== */
  .img-container {
    text-align: center;
    margin: 18px 0;
    page-break-inside: avoid;
    padding: 12px;
    background: var(--zen-surface);
    border-radius: 10px;
    border: 1px solid var(--zen-border);
  }

  img {
    max-width: 92%;
    height: auto;
    border: 1px solid var(--zen-border-dark);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }

  .caption {
    font-size: 10.5px;
    color: var(--zen-text-muted);
    margin-top: 8px;
    font-style: italic;
    font-weight: 500;
  }

  /* ===================== LINKS ===================== */
  a {
    color: var(--zen-primary);
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px dotted var(--zen-accent);
  }

  /* ===================== STRONG / EM ===================== */
  strong {
    color: var(--zen-primary-dark);
    font-weight: 700;
  }

  em {
    color: var(--zen-text-muted);
    font-style: italic;
  }

  /* ===================== KBD ===================== */
  kbd {
    background: var(--zen-surface);
    border: 1px solid var(--zen-border-dark);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  /* ===================== PAGE BREAKS ===================== */
  @page {
    margin: 18mm 14mm;
    size: A4;
  }

  @page :first {
    margin-top: 0;
  }
</style>
</head>
<body>
${processed}
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '14mm',
      right: '14mm',
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 8px; font-family: 'Inter', sans-serif; color: #52796F; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">TokTickIT — Lab 4 Report</span>
        <span>CPE 334 | Aran Edlek — 67070505230</span>
      </div>`,
    footerTemplate: `
      <div style="width: 100%; font-size: 8px; font-family: 'Inter', sans-serif; color: #52796F; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center;">
        <span>November 2026</span>
        <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  });

  await browser.close();
  console.log('Successfully generated:', pdfPath);
})();
