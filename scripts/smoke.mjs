import { mkdtemp, mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { strict as assert } from 'node:assert';
const run=promisify(execFile);
const dir=await mkdtemp(join(tmpdir(),'data-lab-pages-'));
const content=join(dir,'content'), pub=join(dir,'public'), out=join(dir,'dist');
try {
  await mkdir(content,{recursive:true}); await mkdir(join(pub,'reports','test'),{recursive:true});
  await cp(resolve('public/styles.css'),join(pub,'styles.css'));
  await cp(resolve('public/site.js'),join(pub,'site.js'));
  await writeFile(join(pub,'reports','test','index.html'),'<html>Test report</html>');
  const p={slug:'test',title:'Test project',summary:'<script>unsafe</script>',findings:'A finding',reports:[{title:'Explore',href:'/reports/test/index.html'}],sources:[{title:'Example',url:'https://example.org/data'}]};
  await writeFile(join(content,'test.json'),JSON.stringify(p));
  const env={...process.env,DATA_LAB_CONTENT:content,DATA_LAB_PUBLIC:pub,DATA_LAB_OUTPUT:out};
  await run(process.execPath,['scripts/build.mjs'],{env});
  const page=await readFile(join(out,'projects','test','index.html'),'utf8');
  assert.match(page,/\.\.\/\.\.\/reports\/test\/index\.html/);
  assert.match(page,/&lt;script&gt;unsafe&lt;\/script&gt;/);
  assert.doesNotMatch(page,/<script>unsafe<\/script>/);
  p.reports[0].href='javascript:alert(1)';
  await writeFile(join(content,'test.json'),JSON.stringify(p));
  await assert.rejects(run(process.execPath,['scripts/build.mjs'],{env}));
  console.log('Smoke passed: project pages, relative report paths, HTML escaping, and unsafe link rejection.');
} finally { await rm(dir,{recursive:true,force:true}); }
