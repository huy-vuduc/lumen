// Builds www/ for the Capacitor app from lumen/: copies the game, wraps
// index.html in the document skeleton (the web and artifact builds add their
// own) and bundles the native ads bridge in app/native-ads.js. No playtest
// flag, so the app build has neither the unlock-all nor the unlimited switch.
// Run with: npm run build
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const src = path.join(root, 'lumen');
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });

const page = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
fs.writeFileSync(
  path.join(out, 'index.html'),
  `<!doctype html>\n<html lang="en">\n${page}<script src="lumen-native-ads.js"></script>\n</html>\n`,
);

esbuild.buildSync({
  entryPoints: [path.join(root, 'app', 'native-ads.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  outfile: path.join(out, 'lumen-native-ads.js'),
  logLevel: 'warning',
});

console.log(`Built ${path.relative(root, out)}/ (${fs.readdirSync(out).length} entries)`);
