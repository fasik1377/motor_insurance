const fs = require('fs');
const content = fs.readFileSync('app/buy-online/page.tsx', 'utf8');
const idx = content.indexOf('function ClientDetailsForm');
const endIdx = content.indexOf('function MotorProposalForm');
const beforeComponent = content.substring(0, idx);
const componentContent = content.substring(idx, endIdx);
const afterComponent = content.substring(endIdx);

// Extract the JSX from the nationalityOptions assignment
const natStart = componentContent.indexOf('const nationalityOptions = [');
const jsxEnd = 16799; // Found earlier

// The JSX content is from after 'const nationalityOptions = [' to jsxEnd
const jsxStart = natStart + 'const nationalityOptions = ['.length;
const jsxContent = componentContent.substring(jsxStart, jsxEnd).trim();

// Build the fixed component
const beforeNat = componentContent.substring(0, natStart);
const afterJSX = componentContent.substring(jsxEnd);

const correctNatOptions = 'const nationalityOptions = [\r\n    { value: "", label: "Select nationality" },\r\n    { value: "Mauritius", label: "Mauritius" },\r\n    { value: "Rodrigues", label: "Rodrigues" },\r\n  ];';

const fixedComponent = beforeNat + correctNatOptions + '\r\n\r\n  return (' + jsxContent + '\r\n  );\r\n}\r\n';

const fixedContent = beforeComponent + fixedComponent + afterComponent;
fs.writeFileSync('app/buy-online/page.tsx', fixedContent);
console.log('Done');