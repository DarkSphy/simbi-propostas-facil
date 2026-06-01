const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/routes');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('toast.error(error.message)')) {
    content = content.replace(/toast\.error\(error\.message\)/g, 'toast.error(getErrorMessage(error))');
    changed = true;
  }
  
  // also catch cases where error variable is different like err.message
  if (content.includes('toast.error(err.message)')) {
    content = content.replace(/toast\.error\(err\.message\)/g, 'toast.error(getErrorMessage(err))');
    changed = true;
  }
  
  if (changed && !content.includes('getErrorMessage')) {
    content = 'import { getErrorMessage } from "@/lib/utils/error";\n' + content;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
console.log('Done.');
