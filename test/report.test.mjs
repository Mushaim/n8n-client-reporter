// Verifies the report email assembly: subject, at-a-glance footer, and per-site
// recipient (defaults to review inbox). Pure logic — no LLM/network.
// Run: node test/report.test.mjs

const RECIPIENTS = { 'example-client.com': 'owner@example-client.com' };
const REVIEW = 'alerts@yourdomain.com';

function assemble(m, report = '(report)') {
  const to = RECIPIENTS[m.site] || REVIEW;
  const subject = '📊 Monthly site report — ' + m.site;
  const footer = '———\nAt a glance: ' + (m.up ? 'online' : 'OFFLINE') + ' · load ' + m.loadMs + 'ms · ' + m.sizeKb + 'KB · SSL ' +
    (m.sslDays == null ? '?' : m.sslDays + 'd left');
  return { to, subject, text: report + '\n\n' + footer };
}

let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n); } };

const healthy = { site: 'example-client.com', up: true, loadMs: 800, sizeKb: 411, sslDays: 66 };
const down = { site: 'newclient.com', up: false, loadMs: 0, sizeKb: 0, sslDays: null };

const a = assemble(healthy);
check('recipient uses configured client email', a.to === 'owner@example-client.com');
check('subject names the site', a.subject.includes('example-client.com'));
check('footer shows online + load + SSL', a.text.includes('online') && a.text.includes('800ms') && a.text.includes('66d left'));

const b = assemble(down);
check('unknown site → review inbox', b.to === REVIEW);
check('down site → OFFLINE in footer', b.text.includes('OFFLINE'));
check('missing SSL → "?"', b.text.includes('SSL ?'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
