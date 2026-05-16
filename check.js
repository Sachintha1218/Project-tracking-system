const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  fs.writeFileSync('output.txt', 'SUCCESS:\n' + result);
} catch (error) {
  fs.writeFileSync('output.txt', 'ERROR:\n' + error.stdout + '\n' + error.stderr);
}
