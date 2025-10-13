#!/usr/bin/env node

/**
 * Production Testing Script for Wedding Website
 * This script tests all critical functionality before and after deployment
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    colorLog('blue', `🔧 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    colorLog('green', `✅ ${description} - Success`);
    return { success: true, output: result };
  } catch (error) {
    colorLog('red', `❌ ${description} - Failed`);
    colorLog('red', `   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath, description) {
  try {
    if (existsSync(filePath)) {
      colorLog('green', `✅ ${description} - Found`);
      return true;
    } else {
      colorLog('red', `❌ ${description} - Missing`);
      return false;
    }
  } catch (error) {
    colorLog('red', `❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

function checkPackageJson() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const requiredScripts = ['build', 'test:run', 'deploy', 'db:migrate'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length === 0) {
      colorLog('green', '✅ Package.json scripts - All required scripts present');
      return true;
    } else {
      colorLog('red', `❌ Package.json scripts - Missing: ${missingScripts.join(', ')}`);
      return false;
    }
  } catch (error) {
    colorLog('red', `❌ Package.json - Error reading: ${error.message}`);
    return false;
  }
}

function checkWranglerConfig() {
  try {
    const wranglerConfig = readFileSync('wrangler.toml', 'utf8');
    const requiredBindings = ['DB', 'WEDDING_PHOTOS', 'SESSIONS', 'ADMIN_KV'];
    
    let allBindingsPresent = true;
    for (const binding of requiredBindings) {
      if (!wranglerConfig.includes(`binding = "${binding}"`)) {
        colorLog('red', `❌ Wrangler config - Missing binding: ${binding}`);
        allBindingsPresent = false;
      }
    }
    
    if (allBindingsPresent) {
      colorLog('green', '✅ Wrangler config - All required bindings present');
    }
    
    return allBindingsPresent;
  } catch (error) {
    colorLog('red', `❌ Wrangler config - Error reading: ${error.message}`);
    return false;
  }
}

async function runTests() {
  colorLog('blue', '🧪 Wedding Website Production Testing');
  colorLog('blue', '====================================');
  console.log('');

  const results = {
    projectStructure: true,
    dependencies: true,
    build: true,
    tests: true,
    database: true,
    deployment: true
  };

  // 1. Check Project Structure
  colorLog('magenta', '📁 Checking Project Structure...');
  const structureChecks = [
    { file: 'package.json', desc: 'Package.json' },
    { file: 'wrangler.toml', desc: 'Wrangler configuration' },
    { file: 'src/entry.cloudflare-pages.tsx', desc: 'Cloudflare Pages entry' },
    { file: 'src/routes/layout.tsx', desc: 'Root layout' },
    { file: 'src/routes/index.tsx', desc: 'Home page' },
    { file: 'src/routes/admin/layout.tsx', desc: 'Admin layout' },
    { file: 'src/routes/admin/dashboard/index.tsx', desc: 'Admin dashboard' },
    { file: 'src/lib/database.ts', desc: 'Database layer' },
    { file: 'src/lib/auth.ts', desc: 'Authentication system' },
    { file: 'migrations/0001_initial_schema.sql', desc: 'Database migrations' }
  ];

  for (const check of structureChecks) {
    if (!checkFileExists(check.file, check.desc)) {
      results.projectStructure = false;
    }
  }

  // 2. Check Package.json Configuration
  if (!checkPackageJson()) {
    results.dependencies = false;
  }

  // 3. Check Wrangler Configuration
  if (!checkWranglerConfig()) {
    results.deployment = false;
  }

  console.log('');

  // 4. Install Dependencies
  colorLog('magenta', '📦 Checking Dependencies...');
  const installResult = runCommand('pnpm install', 'Installing dependencies');
  if (!installResult.success) {
    results.dependencies = false;
  }

  console.log('');

  // 5. Run Linting
  colorLog('magenta', '🔍 Running Code Quality Checks...');
  const lintResult = runCommand('pnpm run lint', 'ESLint check');
  if (!lintResult.success) {
    results.tests = false;
  }

  // 6. Run Tests
  const testResult = runCommand('pnpm run test:run', 'Unit tests');
  if (!testResult.success) {
    results.tests = false;
  }

  console.log('');

  // 7. Build Project
  colorLog('magenta', '🔨 Building Project...');
  const buildResult = runCommand('pnpm run build', 'Production build');
  if (!buildResult.success) {
    results.build = false;
  }

  // 8. Check Build Output
  if (buildResult.success) {
    const buildChecks = [
      { file: 'dist', desc: 'Build output directory' },
      { file: 'dist/q-manifest.json', desc: 'Qwik manifest' },
      { file: 'dist/build', desc: 'Build assets' },
      { file: 'dist/assets', desc: 'Static assets' }
    ];

    for (const check of buildChecks) {
      if (!checkFileExists(check.file, check.desc)) {
        results.build = false;
      }
    }
  }

  console.log('');

  // 9. Database Migration Check
  colorLog('magenta', '🗄️  Database Configuration...');
  colorLog('cyan', '   Note: Actual migrations should be run manually with: npm run db:migrate');
  const migrationCheck = checkFileExists('migrations/0001_initial_schema.sql', 'Database migration file');
  if (!migrationCheck) {
    results.database = false;
  }

  console.log('');

  // 10. Generate Test Report
  colorLog('blue', '📊 Test Results Summary');
  colorLog('blue', '=======================');
  console.log('');

  const allPassed = Object.values(results).every(result => result);

  if (allPassed) {
    colorLog('green', '🎉 All tests passed! Your wedding website is ready for deployment.');
    console.log('');
    colorLog('cyan', 'Next steps:');
    colorLog('white', '1. Set up admin credentials: npm run admin:setup');
    colorLog('white', '2. Apply database migrations: npm run db:migrate');
    colorLog('white', '3. Deploy to production: npm run deploy');
    console.log('');
    colorLog('yellow', '⚠️  Remember to:');
    colorLog('white', '   • Set up Cloudflare secrets (ADMIN_EMAIL, ADMIN_PASSWORD_HASH)');
    colorLog('white', '   • Configure email service (RESEND_API_KEY)');
    colorLog('white', '   • Test all functionality after deployment');
    colorLog('white', '   • Monitor performance and error logs');
  } else {
    colorLog('red', '❌ Some tests failed. Please fix the issues before deploying.');
    console.log('');
    
    const failedTests = Object.entries(results)
      .filter(([, passed]) => !passed)
      .map(([test]) => test);
    
    colorLog('yellow', 'Failed tests:');
    failedTests.forEach(test => {
      colorLog('red', `  ❌ ${test}`);
    });
    
    console.log('');
    colorLog('cyan', 'Please address these issues and run the test again.');
  }

  console.log('');
  colorLog('blue', '📋 Pre-deployment Checklist:');
  colorLog('white', '□ Admin account configured');
  colorLog('white', '□ Database migrations applied');
  colorLog('white', '□ Email service configured');
  colorLog('white', '□ Custom domain set up (if applicable)');
  colorLog('white', '□ SSL certificates configured');
  colorLog('white', '□ Performance monitoring enabled');
  colorLog('white', '□ Error tracking configured');
  colorLog('white', '□ Backup strategy in place');
  colorLog('white', '□ Mobile responsiveness tested');
  colorLog('white', '□ Accessibility audit completed');
  colorLog('white', '□ Security review performed');

  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  colorLog('red', `❌ Test script failed: ${error.message}`);
  process.exit(1);
});