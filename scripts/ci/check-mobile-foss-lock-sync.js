#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const mobilePackagePath = path.join(repoRoot, 'apps/mobile/package.json');
const mobileLockPath = path.join(repoRoot, 'apps/mobile/package-lock.json');

const pkg = JSON.parse(fs.readFileSync(mobilePackagePath, 'utf8'));

for (const dep of ['expo-dev-client', 'expo-store-review']) {
  if (pkg.dependencies && pkg.dependencies[dep]) {
    delete pkg.dependencies[dep];
  }
  if (pkg.devDependencies && pkg.devDependencies[dep]) {
    delete pkg.devDependencies[dep];
  }
}
if (pkg.dependencies && pkg.dependencies['@mindwtr/core'] === 'workspace:*') {
  pkg.dependencies['@mindwtr/core'] = 'file:../../packages/core';
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mindwtr-mobile-foss-package-'));
const tmpPackagePath = path.join(tmpDir, 'package.json');
fs.writeFileSync(tmpPackagePath, `${JSON.stringify(pkg, null, 2)}\n`);

const result = spawnSync(
  process.execPath,
  [
    path.join(repoRoot, 'scripts/ci/check-package-lock-sync.js'),
    tmpPackagePath,
    mobileLockPath,
  ],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 1);
