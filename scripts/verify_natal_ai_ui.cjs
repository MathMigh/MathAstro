#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const target = path.join(ROOT, 'src/traditions/western/natal/NatalOnlyWorkspace.tsx');
const source = fs.readFileSync(target, 'utf8');
const result = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.Preserve,
  },
  reportDiagnostics: true,
  fileName: target,
});
const errors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
if (errors.length) {
  for (const diagnostic of errors) {
    console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
  console.log(`NATAL_AI_UI=FAIL | errors=${errors.length}`);
  process.exit(1);
}

const required = [
  'aiIntegration',
  'READY_FOR_PROVIDER',
  'Salvar invocação do provedor',
  'Adapter IA',
  'Prompt Absoluto em português',
];
const missing = required.filter((token) => !source.includes(token));
if (missing.length) {
  console.error(`NATAL_AI_UI=FAIL | missing=${missing.join(',')}`);
  process.exit(1);
}
console.log('NATAL_AI_UI=PASS | provider-ready controls present');
