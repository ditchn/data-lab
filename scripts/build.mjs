import { readFile, readdir, mkdir, writeFile, cp, rm, stat, lstat } from 'node:fs/promises';
import { join, resolve, basename } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const content = resolve(process.env.DATA_LAB_CONTENT || join(root, 'content/projects'));
const output = resolve(process.env.DATA_LAB_OUTPUT || join(root, 'dist'));
const pub = resolve(process.env.DATA_LAB_PUBLIC || join(root, 'public'));
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value, label, required = false) => {
  assert(!required || (typeof value === 'string' && value.trim()), `${label} is required`);
  assert(value === undefined || typeof value === 'string', `${label} must be text`);
  return value?.trim() || '';
};
function link(value, label) {
  const href = text(value, label, true);
  if (href.startsWith('/') && !href.startsWith('//')) {
    assert(/^\/[A-Za-z0-9_./%-]+$/.test(href) && !href.split('/').includes('..') && !href.includes('%'), `${label} must be a simple site path`);
    return href;
  }
  const u = new URL(href);
  assert(u.protocol === 'https:' && !u.username && !u.password, `${label} must be HTTPS or a site path`);
  return href;
}
const paragraphs = s => esc(s).split(/\n\s*\n/).map(p=>`<p>${p.replaceAll('\n','<br>')}</p>`).join('');
function items(value, label, map) {
  assert(value === undefined || Array.isArray(value), `${label} must be a list`);
  return (value || []).map((v,i) => map(v, `${label}[${i}]`));
}
function normalize(raw, file) {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), `${file}: project must be an object`);
  const slug = text(raw.slug, `${file}.slug`, true);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && basename(file) === `${slug}.json`, `${file}: filename and slug must match (lowercase letters, numbers, hyphens)`);
  const p = {
    slug, title:text(raw.title,`${file}.title`,true), kicker:text(raw.kicker,`${file}.kicker`),
    summary:text(raw.summary,`${file}.summary`,true), question:text(raw.question,`${file}.question`),
    findings:text(raw.findings,`${file}.findings`,true), methods:text(raw.methods,`${file}.methods`),
    limitations:text(raw.limitations,`${file}.limitations`), updated:text(raw.updated,`${file}.updated`),
    codeUrl:raw.codeUrl ? link(raw.codeUrl,`${file}.codeUrl`) : '',
    topics:items(raw.topics,`${file}.topics`,(v,l)=>text(v,l,true)),
    reports:items(raw.reports,`${file}.reports`,(v,l)=>({title:text(v?.title,`${l}.title`,true),description:text(v?.description,`${l}.description`),href:link(v?.href,`${l}.href`),kind:text(v?.kind,`${l}.kind`)||'Interactive report'})),
    downloads:items(raw.downloads,`${file}.downloads`,(v,l)=>({title:text(v?.title,`${l}.title`,true),description:text(v?.description,`${l}.description`),href:link(v?.href,`${l}.href`)})),
    sources:items(raw.sources,`${file}.sources`,(v,l)=>({title:text(v?.title,`${l}.title`,true),publisher:text(v?.publisher,`${l}.publisher`),coverage:text(v?.coverage,`${l}.coverage`),accessed:text(v?.accessed,`${l}.accessed`),license:text(v?.license,`${l}.license`),notes:text(v?.notes,`${l}.notes`),url:v?.url?link(v.url,`${l}.url`):''})),
  };
  assert(!p.updated || /^\d{4}-\d{2}-\d{2}$/.test(p.updated),`${file}.updated must be YYYY-MM-DD`);
  return p;
}
const rel = (href, depth) => href.startsWith('/') ? `${depth}${href.slice(1)}` : href;
const attr = href => esc(href);
const anchor = (href, label, depth, klass = '') => `<a class="${klass}" href="${attr(rel(href, depth))}"${href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${label}${href.startsWith('https:')?' <span aria-hidden="true">↗</span>':''}</a>`;
const shell = ({title, description, depth, main}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="${esc(description)}"><title>${esc(title)} | Bill Ditchman · Data Lab</title><link rel="icon" href="${depth}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${depth}styles.css"><script src="${depth}site.js" defer></script></head>
<body><a class="skip" href="#main">Skip to content</a><header class="mast"><div class="wrap mast-inner"><a class="brand" href="${depth}" aria-label="Data Lab home"><span class="brand-symbol">BD</span><span><strong>DATA LAB</strong><small>BY BILL DITCHMAN</small></span></a><nav aria-label="Main navigation"><a href="${depth}#projects">Projects</a><a href="${depth}#approach">Approach</a></nav></div></header><main id="main">${main}</main><footer class="footer"><div class="wrap footer-inner"><span>Bill Ditchman · Data Lab</span><span>Questions, evidence, and reproducible analysis.</span></div></footer></body></html>`;
function home(projects) {
  const cards = projects.map(p=>`<article class="project-card" data-project-card><div class="card-top"><span class="micro">${esc(p.kicker||'ANALYSIS')}</span>${p.updated?`<span>${esc(p.updated)}</span>`:''}</div><h3>${anchor(`/projects/${p.slug}/`,esc(p.title),'','card-link')}</h3><p>${esc(p.summary)}</p><div class="topic-row">${p.topics.slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><span class="card-foot">Explore project <span aria-hidden="true">→</span></span></article>`).join('');
  return shell({title:'Explore the analysis',description:'Data projects, findings, methods, sources, and interactive reports by Bill Ditchman.',depth:'',main:`<section class="hero"><div class="wrap hero-grid"><div><span class="eyebrow">INDEPENDENT ANALYSIS · OPEN METHODS</span><h1>Follow the question.<br><em>Explore the evidence.</em></h1><p class="hero-lead">A home for data projects and the thinking behind them. Read the findings, explore interactive reports, and trace the sources and methods.</p><a class="button" href="#projects">Explore projects <span aria-hidden="true">↓</span></a></div><div class="hero-note"><span class="micro">THE DATA LAB</span><p>From a research question to a clear result.</p><div class="note-rule"></div><span>Analysis prepared offsite. Published work is reviewed and presented here for exploration.</span></div></div></section>
  <section class="section wrap" id="projects"><div class="section-head"><div><span class="eyebrow">PUBLISHED WORK</span><h2>Projects</h2><p>Each project brings the findings, sources, and deeper analysis together.</p></div><span class="count" data-result-count>${projects.length} project${projects.length===1?'':'s'}</span></div>${projects.length?`<label class="search-label">Find a project<input type="search" placeholder="Search title, topic, or finding" data-project-search></label><div class="project-grid">${cards}</div><p class="empty-match" data-no-matches hidden>No projects match that search.</p>`:`<div class="empty-card"><div class="empty-mark">01 / 01</div><h3>First project in progress</h3><p>Published analysis will appear here, with an interactive report and links to its sources and code.</p></div>`}</section>
  <section class="approach" id="approach"><div class="wrap"><span class="eyebrow">HOW TO EXPLORE</span><h2>Start with the finding. Go as deep as you like.</h2><div class="approach-grid"><div><span>01</span><h3>Read the story</h3><p>See the question, key findings, methods, and limitations in one place.</p></div><div><span>02</span><h3>Explore the report</h3><p>Open the interactive analysis and inspect approved tables, charts, and downloads.</p></div><div><span>03</span><h3>Trace the work</h3><p>Review the original sources and follow the code when you want the full detail.</p></div></div></div></section>`});
}
function projectPage(p) {
  const cards = p.reports.map(r=>`<article class="resource-card"><span class="micro">${esc(r.kind)}</span><h3>${esc(r.title)}</h3>${r.description?`<p>${esc(r.description)}</p>`:''}${anchor(r.href,'Explore report', '../../','resource-link')}</article>`).join('');
  const downloads = p.downloads.map(d=>`<li><div><strong>${esc(d.title)}</strong>${d.description?`<span>${esc(d.description)}</span>`:''}</div>${anchor(d.href,'Download', '../../')}</li>`).join('');
  const sources = p.sources.map(s=>`<li class="source-item"><div><strong>${esc(s.title)}</strong><p>${[s.publisher,s.coverage].filter(Boolean).map(esc).join(' · ')}</p>${s.notes?`<p>${esc(s.notes)}</p>`:''}<small>${[s.accessed?`Accessed ${s.accessed}`:'',s.license?`License: ${s.license}`:''].filter(Boolean).map(esc).join(' · ')}</small></div>${s.url?anchor(s.url,'View source','../../'):''}</li>`).join('');
  return shell({title:p.title,description:p.summary,depth:'../../',main:`<div class="wrap breadcrumb"><a href="../../">Projects</a><span aria-hidden="true">/</span><span>${esc(p.title)}</span></div><section class="project-hero"><div class="wrap"><span class="eyebrow">${esc(p.kicker||'DATA LAB PROJECT')}</span><h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p><div class="project-meta">${p.topics.map(t=>`<span>${esc(t)}</span>`).join('')}${p.updated?`<span>Updated ${esc(p.updated)}</span>`:''}</div></div></section><div class="wrap detail-layout"><div class="story">${p.question?`<section><span class="eyebrow">THE QUESTION</span><h2>What are we trying to understand?</h2>${paragraphs(p.question)}</section>`:''}<section><span class="eyebrow">THE READOUT</span><h2>What the analysis found</h2>${paragraphs(p.findings)}</section>${p.reports.length?`<section class="report-section"><span class="eyebrow">EXPLORE</span><h2>Interactive reports</h2><p>Open a report to explore its charts and tables. Reports open as full pages for the best reading experience.</p><div class="resource-grid">${cards}</div></section>`:''}${p.downloads.length?`<section><span class="eyebrow">DATA & FILES</span><h2>Approved downloads</h2><ul class="download-list">${downloads}</ul></section>`:''}${p.methods?`<section><span class="eyebrow">THE METHOD</span><h2>How the work was done</h2>${paragraphs(p.methods)}</section>`:''}${p.limitations?`<section><span class="eyebrow">CONTEXT</span><h2>Limitations</h2>${paragraphs(p.limitations)}</section>`:''}<section><span class="eyebrow">PROVENANCE</span><h2>Sources behind the work</h2>${sources?`<ul class="sources-list">${sources}</ul>`:'<p>Source documentation will be added with this project.</p>'}</section></div><aside class="detail-aside"><div class="aside-card"><span class="micro">PROJECT GUIDE</span><h2>Go deeper</h2><p>Use the report for exploration, then follow the source links for context and reproducibility.</p>${p.reports[0]?anchor(p.reports[0].href,'Open main report','../../','button aside-button'):''}${p.codeUrl?anchor(p.codeUrl,'View code on GitHub','../../','aside-code'):''}<div class="aside-rule"></div><span class="muted">${p.reports.length} report${p.reports.length===1?'':'s'} · ${p.sources.length} source${p.sources.length===1?'':'s'}</span></div></aside></div>`});
}
async function main() {
  const files = (await readdir(content)).filter(name=>name.endsWith('.json')).sort();
  const projects = [];
  for (const name of files) {
    const raw = JSON.parse(await readFile(join(content,name),'utf8'));
    projects.push(normalize(raw,name));
  }
  const seen = new Set(); for(const p of projects) { assert(!seen.has(p.slug),`Duplicate slug ${p.slug}`); seen.add(p.slug); }
  const cmp = (a,b)=>b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title);
  projects.sort(cmp);
  // Validate local report/download paths before publishing a new revision.
  for(const p of projects) for(const r of [...p.reports,...p.downloads]) if(r.href.startsWith('/')) {
    const path = resolve(pub,'.'+r.href);
    assert(path.startsWith(pub+'/'),`Invalid path ${r.href}`);
    assert((await stat(path).catch(()=>null))?.isFile(),`${p.slug}: missing public file ${r.href}`);
  }
  await rm(output,{recursive:true,force:true});
  await mkdir(output,{recursive:true});
  await cp(pub,output,{recursive:true,filter:async source => { const s=await lstat(source); assert(!s.isSymbolicLink(),`Do not publish symlinks: ${source}`); return true; }});
  await writeFile(join(output,'index.html'),home(projects));
  for(const p of projects) {
    const dir=join(output,'projects',p.slug);
    await mkdir(dir,{recursive:true});
    await writeFile(join(dir,'index.html'),projectPage(p));
  }
  await writeFile(join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ditchn.com/</loc></url>${projects.map(p=>`<url><loc>https://ditchn.com/projects/${p.slug}/</loc></url>`).join('')}</urlset>`);
  console.log(`Built ${projects.length} published project${projects.length===1?'':'s'} into ${output}`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
