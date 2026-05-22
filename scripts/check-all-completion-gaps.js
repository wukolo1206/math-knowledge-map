const { spawnSync } = require('child_process');
const path = require('path');

const checks = [
  'check-g1a-completion-gap.js',
  'check-g1b-completion-gap.js',
  'check-g2a-completion-gap.js',
  'check-g2b-completion-gap.js',
  'check-g3a-completion-gap.js',
  'check-g4a-completion-gap.js',
  'check-g4b-completion-gap.js',
  'check-g5a-completion-gap.js',
  'check-g5b-completion-gap.js',
  'check-g6a-completion-gap.js',
  'check-g6b-completion-gap.js',
  'check-g3b-card-data.js',
  'check-card-render-samples.js',
  'check-data-quality.js',
  'check-side-panel-ui.js',
  'check-zoom-control.js',
  'check-indicator-filter-ui.js'
];

for (const script of checks) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8'
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    throw new Error(script + ' failed with exit code ' + result.status);
  }
}

console.log('All completion gap checks passed');
