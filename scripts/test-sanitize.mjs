// Teste da allowlist de sanitização (PLANO_PAINEL.md, E1 / T1.1).
//
// DOMPurify precisa de um DOM. No navegador isso é grátis; no Node exige jsdom.
//   Com jsdom instalado:  node scripts/test-sanitize.mjs   -> roda as asserções
//   Sem jsdom:            sai com aviso (exit 0). Verifique no console do browser:
//     import('/src/lib/sanitize.js').then(m => console.log(m.sanitizeHtml(FIXTURE)))

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.warn(
    '[test-sanitize] jsdom não instalado — teste pulado. ' +
      'Para rodar no terminal: npm i -D jsdom'
  );
  process.exit(0);
}

const { window } = new JSDOM('<!doctype html>');
globalThis.window = window;
globalThis.document = window.document;

const { sanitizeHtml } = await import('../src/lib/sanitize.js');

const cases = [
  {
    name: 'mantém os elementos jornalísticos (D1)',
    input:
      '<blockquote class="olho">a</blockquote>' +
      '<aside class="boxe">b</aside>' +
      '<aside class="nota-editor">c</aside>' +
      '<figure><img src="x.jpg" alt="foto"><figcaption class="credito">d</figcaption></figure>',
    includes: [
      'class="olho"',
      'class="boxe"',
      'class="nota-editor"',
      'class="credito"',
      '<figure>',
      '<figcaption',
      'alt="foto"'
    ],
    excludes: []
  },
  {
    name: 'mantém hr, cite, listas, headings e link com rel/target',
    input:
      '<h2>t</h2><h3>u</h3><h4>v</h4><hr><cite>fonte</cite>' +
      '<ul><li>i</li></ul><ol><li>j</li></ol>' +
      '<p><a href="https://ex.com" target="_blank" rel="noopener noreferrer">l</a></p>',
    includes: [
      '<h2>',
      '<h3>',
      '<h4>',
      '<hr',
      '<cite>',
      '<ul>',
      '<ol>',
      'target="_blank"',
      'rel="noopener noreferrer"'
    ],
    excludes: []
  },
  {
    name: 'remove script, iframe, style inline e handlers',
    input:
      '<p>ok</p><script>alert(1)</script>' +
      '<iframe src="https://evil"></iframe>' +
      '<p style="color:red" onclick="x()">z</p>',
    includes: ['<p>ok</p>'],
    excludes: ['<script', '<iframe', 'style=', 'onclick']
  },
  {
    name: 'remove classes fora da allowlist (lixo de Word/Docs)',
    input:
      '<p class="MsoNormal">a</p>' +
      '<span class="c1 c2">b</span>' +
      '<blockquote class="olho lixo">c</blockquote>',
    includes: ['class="olho"'],
    excludes: ['MsoNormal', 'c1', 'c2', 'lixo']
  },
  {
    name: 'string vazia / não-string -> vazio',
    input: '',
    includes: [],
    excludes: [],
    expectEmpty: true
  }
];

let failed = 0;
for (const c of cases) {
  const out = sanitizeHtml(c.input);
  const problems = [];
  if (c.expectEmpty && out !== '') problems.push(`esperava vazio, veio ${JSON.stringify(out)}`);
  for (const s of c.includes || []) if (!out.includes(s)) problems.push(`faltou ${JSON.stringify(s)}`);
  for (const s of c.excludes || []) if (out.includes(s)) problems.push(`não devia conter ${JSON.stringify(s)}`);
  if (problems.length) {
    failed += 1;
    console.error(`FAIL  ${c.name}`);
    console.error(`      saída: ${out}`);
    problems.forEach((p) => console.error(`      - ${p}`));
  } else {
    console.log(`PASS  ${c.name}`);
  }
}

console.log(`\n${cases.length - failed}/${cases.length} ok`);
process.exit(failed ? 1 : 0);
