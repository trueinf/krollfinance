const fs = require('fs');
const files = [
  'src/components/generated/MicroSolveDashboard.tsx',
  'src/components/generated/InvoicingBillingView.tsx',
  'src/components/generated/InvoiceDeliveryView.tsx'
];
files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/SAP Ariba/g, 'Client Portal')
             .replace(/Ariba/g, 'Portal')
             .replace(/Client Portal portal/gi, 'Client Portal')
             .replace(/Portal portal/gi, 'Portal')
             .replace(/ANID/g, 'Portal ID')
             .replace(/AN ID/g, 'Portal ID');
  fs.writeFileSync(f, text);
});
console.log('Replaced Ariba references.');
