import { writeFileSync } from 'node:fs';

/** Minimal single-page PDF used to smoke-test the documents upload/stream flow. */
const objects = [
  '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 150] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  '4 0 obj\n<< /Length 66 >>\nstream\nBT /F1 18 Tf 24 80 Td (Mizan smoke test PDF) Tj ET\nendstream\nendobj\n',
  '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
];

let pdf = '%PDF-1.4\n';
const offsets = [];

for (const object of objects) {
  offsets.push(pdf.length);
  pdf += object;
}

const xrefStart = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets) {
  pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

const target = process.argv[2] ?? 'sample.pdf';
writeFileSync(target, pdf, 'latin1');
console.log(`wrote ${target}`);
