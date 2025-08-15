import fs from 'fs';
import path from 'path';

function copyRecursive(srcDir: string, destDir: string) {
  for (const entry of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, entry);
    const dst = path.join(destDir, entry);

    if (fs.statSync(src).isDirectory()) {
      copyRecursive(src, dst);
    } else if (src.endsWith('.graphql')) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
    }
  }
}

copyRecursive('src', 'dist/src');
