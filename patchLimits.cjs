const fs = require('fs');

const filesToPatch = [
  'src/routes/_authenticated/catalog.tsx',
  'src/routes/_authenticated/proposals.new.tsx',
  'src/routes/_authenticated/settings.tsx'
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if limit is already applied to avoid duplicates
    if (!content.includes('A imagem deve ter no máximo 5MB')) {
      content = content.replace(
        /(const file = e\.target\.files\[0\];)/g,
        "$1\n    if (file.size > 5 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 5MB para conexões lentas.'); return; }"
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log('Patched limits in ' + file);
    }
  }
});
