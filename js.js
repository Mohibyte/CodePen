
/* --------------------------
  Mini CodePen Logic (Dark)
  -------------------------- */

const htmlEditorEl = document.getElementById('htmlEditor');
const cssEditorEl  = document.getElementById('cssEditor');
const jsEditorEl   = document.getElementById('jsEditor');
const previewFrame = document.getElementById('preview');
const runBtn       = document.getElementById('runBtn');
const autoRunEl    = document.getElementById('autoRun');
const statusBadge  = document.getElementById('statusBadge');
const clearBtn     = document.getElementById('clearBtn');
const downloadBtn  = document.getElementById('downloadBtn');

function setStatus(text, t = 1800){
statusBadge.textContent = text;
if(t) setTimeout(()=>{ if(statusBadge.textContent === text) statusBadge.textContent = 'Ready'; }, t);
}

/* Initialize Ace editors (dark theme) */
const htmlEditor = ace.edit(htmlEditorEl, {
mode: "ace/mode/html",
theme: "ace/theme/monokai",
value: "",
tabSize: 2,
useSoftTabs: true
});
const cssEditor  = ace.edit(cssEditorEl, {
mode: "ace/mode/css",
theme: "ace/theme/monokai",
value: "",
tabSize: 2,
useSoftTabs: true
});
const jsEditor   = ace.edit(jsEditorEl, {
mode: "ace/mode/javascript",
theme: "ace/theme/monokai",
value: "",
tabSize: 2,
useSoftTabs: true
});

/* Starter templates */
const starterHTML = `<!-- HTML: add your markup here -->
<div class="card">
<h2>Hello from Mini CodePen</h2>
<p>Edit HTML / CSS / JS and press Run</p>
</div>
`;
const starterCSS = `/* CSS: styles here */
:root{ --accent: #1fb6ff; --bg:#0b0d10; --card:#0f1113; --muted:#98a0a6; --text:#e6eef3 }
body{font-family:system-ui,Segoe UI,Roboto,Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:linear-gradient(180deg,#071019,#0b0d10);color:var(--text)}
.card{padding:28px;border-radius:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03)}
h2{margin:0 0 8px 0;color:var(--accent)}
p{margin:0;color:var(--muted)}`;
const starterJS = `// JS: add interactivity
document.querySelectorAll('.card').forEach(c=>{
c.addEventListener('click', ()=> alert('Card clicked!'));
});`;

/* Set initial content */
htmlEditor.setValue(starterHTML, -1);
cssEditor.setValue(starterCSS, -1);
jsEditor.setValue(starterJS, -1);

/* Compose the preview document */
function buildPreviewDoc(){
const html = htmlEditor.getValue();
const css  = cssEditor.getValue();
const js   = jsEditor.getValue();
const combined = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      // sandbox safe wrapper
      try {
        ${js}
      } catch(e) {
        const err = document.createElement('pre');
        err.style.position='fixed'; err.style.bottom='8px'; err.style.right='8px';
        err.style.background='rgba(0,0,0,0.7)'; err.style.color='tomato'; err.style.padding='8px';
        err.textContent = 'JS Error: ' + e;
        document.body.appendChild(err);
        console.error(e);
      }
    <\/script>
  </body>
  </html>
`;
return combined;
}

/* Render preview */
function renderPreview(){
const doc = buildPreviewDoc();
previewFrame.srcdoc = doc;
setStatus('Preview updated', 900);
}

/* Controls */
runBtn.addEventListener('click', renderPreview);
clearBtn.addEventListener('click', ()=>{
if(!confirm('Clear all editors? This cannot be undone.')) return;
htmlEditor.setValue('', -1);
cssEditor.setValue('', -1);
jsEditor.setValue('', -1);
renderPreview();
setStatus('Cleared');
});

downloadBtn.addEventListener('click', ()=>{
const assembled = buildPreviewDoc();
const blob = new Blob([assembled], {type:'text/html'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'mini-codepen.html';
a.click();
URL.revokeObjectURL(url);
setStatus('Downloaded');
});

/* Auto-run (debounced) */
let debounceTimer = null;
function maybeAutoRun(){
if(!autoRunEl.checked) return;
clearTimeout(debounceTimer);
debounceTimer = setTimeout(renderPreview, 600);
}
[htmlEditor, cssEditor, jsEditor].forEach(ed => ed.getSession().on('change', maybeAutoRun));

/* Keyboard shortcut: Cmd/Ctrl + Enter to run */
document.addEventListener('keydown', (e)=>{
if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); renderPreview(); }
});

/* Initial render */
renderPreview();

/* Make preview size label update (optional) */
function updatePreviewLabel(){
const w = previewFrame.clientWidth;
document.getElementById('previewSize').textContent = Math.round(w) + 'px';
}
window.addEventListener('resize', updatePreviewLabel);
updatePreviewLabel();

/* Accessibility: focus editors when clicked on title */
document.querySelectorAll('.pane').forEach(p=>{
const title = p.querySelector('.title');
if(!title) return;
title.addEventListener('dblclick', ()=>{
  const aceEl = p.querySelector('.ace_editor');
  if(aceEl) {
    // Ace editor instance sometimes stored on element
    const inst = ace.edit(aceEl);
    try { inst.focus(); } catch(e) {}
  }
});
});

/* Expose small API for console (dev convenience) */
window.__miniCodePen = {
render: renderPreview,
getHtml: ()=> htmlEditor.getValue(),
getCss: ()=> cssEditor.getValue(),
getJs: ()=> jsEditor.getValue(),
setHtml: v=> htmlEditor.setValue(v, -1),
setCss: v=> cssEditor.setValue(v, -1),
setJs: v=> jsEditor.setValue(v, -1),
};
