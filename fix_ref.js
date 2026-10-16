const fs = require('fs');
const content = fs.readFileSync('app/buy-online/page.tsx', 'utf8');
const fixed = content.replace(
  'const allFields = ["category", "title", "name", "surname", "mobile", "email", "nationality", "passportNo", "nid", "gender"];',
  'const allFields = ["category", "title", "name", "surname", "mobile", "email", "nationality", "passportNo", "nid", "gender"];\r\n\r\n  useImperativeHandle(ref, () => ({ validateAll }), [errors]);'
);
fs.writeFileSync('app/buy-online/page.tsx', fixed);
console.log('Done');