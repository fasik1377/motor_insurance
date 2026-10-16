const fs = require('fs');
const content = fs.readFileSync('app/buy-online/page.tsx', 'utf8');
const fixed = content.replace(
  'case "KYC":\n        // Use the KYC form\'s validateAll to show inline errors\n        if (kycFormRef.current) {\n          const isValid = kycFormRef.current.validateAll();\n          if (!isValid) {\n            // Collect errors from the form state\n            const formErrors = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`);\n            return formErrors.length > 0 ? formErrors : ["Please fill in all required fields"];\n          }\n          return [];\n        }\n        // Fallback if ref not available',
  'case "KYC":'
);
fs.writeFileSync('app/buy-online/page.tsx', fixed);
console.log('Done');