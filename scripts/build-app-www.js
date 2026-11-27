// Builds www/ for the Capacitor app from lumen/: copies the game, wraps
// index.html in the document skeleton (the web and artifact builds add their
// own) and bundles the native bridges behind app/native.js. The build is a
// playtest build (unlock-all and unlimited switches in Settings) unless it is
// run with --release, which is the build to ship to the stores.
// Run with: npm run build [-- --release]
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const src = path.join(root, 'lumen');
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });

const release = process.argv.includes('--release');
const flag = release ? '' : '<script>window.LUMEN_PLAYTEST = true</script>\n';
const page = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
fs.writeFileSync(
  path.join(out, 'index.html'),
  `<!doctype html>\n<html lang="en">\n${flag}${page}<script src="lumen-native-ads.js"></script>\n</html>\n`,
);

esbuild.buildSync({
  entryPoints: [path.join(root, 'app', 'native.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  outfile: path.join(out, 'lumen-native-ads.js'),
  logLevel: 'warning',
});

console.log(`Built ${path.relative(root, out)}/ (${fs.readdirSync(out).length} entries, ${release ? 'release' : 'playtest'})`);
