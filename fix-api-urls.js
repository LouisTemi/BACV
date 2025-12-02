const fs = require('fs');
const path = require('path');

const API_URL = 'https://bacv-backend.onrender.com';

const files = [
  'client/src/App.js',
  'client/src/pages/LoginPage.jsx',
  'client/src/pages/SignupPage.jsx',
  'client/src/pages/Dashboard.jsx',
  'client/src/pages/SubmitDoc.jsx',
  'client/src/pages/VerifyDoc.jsx',
  'client/src/components/DeployPopup.jsx',
  'client/src/pages/Settings.jsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all variations
    content = content.replace(/fetch\(`\/api\//g, `fetch(\`${API_URL}/api/`);
    content = content.replace(/fetch\("\/api\//g, `fetch("${API_URL}/api/`);
    content = content.replace(/fetch\('\/api\//g, `fetch('${API_URL}/api/`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
  }
});

console.log('Done!');
