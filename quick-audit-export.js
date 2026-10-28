import { library, download } from './exports.js';

const MIME = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

export function refOf(id) { return String(id).replace(/^clause-/, '').replace(/-/g, '.'); }

function filename(report, extension) {
  const location = (report.location || 'location').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'location';
  return 'SiteReady-quick-audit-' + location + '.' + extension;
}

function flatten(report) {
  return report.groups.flatMap(group => group.items.map(item => ({ group, item })));
}

export async function exportQuickAuditWorkbook(report) {
  const XLSX = await library('vendor/xlsx.full.min.js', 'XLSX');
  const list = flatten(report);
  const header = ['ID', 'Clause', 'Clause title', 'Requirement', 'Requirement summary', 'Question', 'Sections covered', 'Rating', 'Response / evidence'];
  const data = [header].concat(list.map(({ group, item }) => [
    item.id, group.clause, group.title, item.ref, item.summary, item.question,
    item.covers.map(refOf).join(', '), item.rating || '', item.evidence || ''
  ]));
  const audit = XLSX.utils.aoa_to_sheet(data);
  audit['!cols'] = [9, 8, 24, 16, 50, 80, 28, 16, 60].map(wch => ({ wch }));
  audit['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: data.length - 1, c: header.length - 1 } }) };
  const coverage = [['Requirement section', 'Question IDs']].concat(report.sections.map(section => [refOf(section), (report.coverage[section] || []).join(', ')]));
  const coverageSheet = XLSX.utils.aoa_to_sheet(coverage);
  coverageSheet['!cols'] = [{ wch: 22 }, { wch: 60 }];
  const info = [
    ['Quick audit'],
    ['Location', report.location || ''],
    ['Exported', new Date().toISOString().slice(0, 10)],
    ['Questions', list.length],
    ['Requirement sections covered', report.sections.length],
    [],
    ['Rating scale']
  ].concat(report.ratingScale.map(label => [label]));
  const infoSheet = XLSX.utils.aoa_to_sheet(info);
  infoSheet['!cols'] = [{ wch: 28 }, { wch: 40 }];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, audit, 'Audit');
  XLSX.utils.book_append_sheet(book, coverageSheet, 'Coverage');
  XLSX.utils.book_append_sheet(book, infoSheet, 'Read me');
  const out = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
  download(new Blob([out], { type: MIME.xlsx }), filename(report, 'xlsx'));
}

export async function exportQuickAuditWord(report) {
  const lib = await library('vendor/docx.umd.js', 'docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = lib;
  const size = 20;
  const para = (text, options = {}) => new Paragraph({ spacing: { after: 90 }, ...options, children: [new TextRun({ text: String(text), size })] });
  const labelled = (label, text) => new Paragraph({ spacing: { after: 90 }, children: [new TextRun({ text: label + ' ', bold: true, size }), new TextRun({ text: String(text), size })] });
  const heading = (text, level) => new Paragraph({ text, heading: level, spacing: { before: 220, after: 100 } });
  const children = [
    heading('Quick audit', HeadingLevel.TITLE),
    labelled('Location:', report.location || 'Not recorded'),
    labelled('Rating scale:', report.ratingScale.join('; ') + '.')
  ];
  for (const group of report.groups) {
    children.push(heading(group.clause + ' ' + group.title, HeadingLevel.HEADING_1), para(group.summary));
    for (const item of group.items) {
      children.push(
        new Paragraph({ keepNext: true, spacing: { before: 160, after: 60 }, children: [new TextRun({ text: item.id + ' · ' + item.ref, bold: true, size, color: '414141' })] }),
        labelled('Requirement:', item.summary),
        new Paragraph({ keepNext: true, spacing: { after: 90 }, children: [new TextRun({ text: item.question, size })] }),
        labelled('Rating:', item.rating || 'Not rated'),
        labelled('Response / evidence:', item.evidence || 'Not recorded')
      );
    }
  }
  const doc = new Document({
    creator: 'Site Ready',
    title: 'Quick audit',
    styles: { default: { document: { run: { font: 'Arial', size, color: '303030' } } } },
    sections: [{ properties: { page: { margin: { top: 800, bottom: 800, left: 700, right: 700 } } }, children }]
  });
  download(await Packer.toBlob(doc), filename(report, 'docx'));
}

export async function exportQuickAuditPowerPoint(report) {
  const PptxGenJS = await library('vendor/pptxgen.bundle.js', 'PptxGenJS');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Site Ready';
  pptx.title = 'Quick audit';
  pptx.lang = 'en-US';
  pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };
  const font = { fontFace: 'Arial' };
  const ink = '303030', green = '414141', muted = '5F6F66';
  const cover = pptx.addSlide();
  cover.addText('Quick audit', { ...font, x: 0.7, y: 2.2, w: 11.9, h: 1, fontSize: 40, bold: true, color: ink });
  cover.addText(report.location || 'Location not recorded', { ...font, x: 0.7, y: 3.2, w: 11.9, h: 0.5, fontSize: 18, color: green });
  cover.addText(flatten(report).length + ' questions · clauses 4 to 10', { ...font, x: 0.7, y: 3.8, w: 11.9, h: 0.4, fontSize: 14, color: muted });
  cover.addText('Ratings: ' + report.ratingScale.join(' · '), { ...font, x: 0.7, y: 4.3, w: 11.9, h: 0.4, fontSize: 12, color: muted });
  for (const { group, item } of flatten(report)) {
    const slide = pptx.addSlide();
    slide.addText('CLAUSE ' + group.clause + ' · ' + group.title.toUpperCase(), { ...font, x: 0.7, y: 0.45, w: 11.9, h: 0.35, fontSize: 12, bold: true, color: green });
    slide.addText(item.id + ' · Requirement ' + item.ref, { ...font, x: 0.7, y: 0.85, w: 11.9, h: 0.5, fontSize: 20, bold: true, color: ink });
    slide.addText(item.question, { ...font, x: 0.7, y: 1.6, w: 11.9, h: 2.6, valign: 'top', fontSize: 18, color: ink, fit: 'shrink' });
    slide.addText('Requirement: ' + item.summary, { ...font, x: 0.7, y: 4.35, w: 11.9, h: 0.7, valign: 'top', fontSize: 12, color: muted });
    slide.addText('Rating: ' + (item.rating || 'Not rated'), { ...font, x: 0.7, y: 5.2, w: 11.9, h: 0.4, fontSize: 14, bold: true, color: ink });
    slide.addText('Response / evidence: ' + (item.evidence || 'Not recorded'), { ...font, x: 0.7, y: 5.7, w: 11.9, h: 1.2, valign: 'top', fontSize: 12, color: ink, fit: 'shrink' });
  }
  await pptx.writeFile({ fileName: filename(report, 'pptx') });
}
