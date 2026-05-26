#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const mobilePackagePath = path.join(repoRoot, 'apps/mobile/package.json');
const mobileLockPath = path.join(repoRoot, 'apps/mobile/package-lock.json');

const pkg = JSON.parse(fs.readFileSync(mobilePackagePath, 'utf8'));

if (pkg.dependencies && pkg.dependencies['expo-dev-client']) {
  delete pkg.dependencies['expo-dev-client'];
}
if (pkg.devDependencies && pkg.devDependencies['expo-dev-client']) {
  delete pkg.devDependencies['expo-dev-client'];
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
