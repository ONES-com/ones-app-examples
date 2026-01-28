const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');

// Get built asset files
function getAssetFiles() {
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found. Please run build first.');
    process.exit(1);
  }
  
  const files = fs.readdirSync(assetsDir);
  const assets = {
    'settings-page': { js: null, css: null },
    shared: { js: null, css: null }
  };
  
  files.forEach(file => {
    if (file.includes('settings-page') && file.endsWith('.js')) {
      assets['settings-page'].js = file;
    } else if (file.includes('index') && file.endsWith('.js')) {
      assets.shared.js = file;
    } else if (file.endsWith('.css')) {
      assets['settings-page'].css = file;
      assets.shared.css = file;
    }
  });
  
  return assets;
}

// Generate HTML template
function generateHTML(pageName, assets) {
  const title = pageName === 'settings-page' ? 'Watcher Rule Settings' : 'AppV2';
  const jsFile = assets[pageName].js;
  const sharedJsFile = assets.shared.js;
  const cssFile = assets.shared.css;
  
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${cssFile ? `<link rel="stylesheet" crossorigin href="./assets/${cssFile}">` : ''}
    ${sharedJsFile ? `<link rel="modulepreload" crossorigin href="./assets/${sharedJsFile}">` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="./assets/${jsFile}"></script>
  </body>
</html>`;
}

// Main function
function main() {
  const assets = getAssetFiles();
  
  // Generate settings-page.html
  const settingsPageHTML = generateHTML('settings-page', assets);
  fs.writeFileSync(path.join(distDir, 'settings-page.html'), settingsPageHTML);
  
  console.log('HTML files generated successfully!');
  console.log('Generated files:');
  console.log('- settings-page.html');
}

main();
