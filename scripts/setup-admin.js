#!/usr/bin/env node

/**
 * Admin Setup Script for Wedding Website
 * This script helps set up the initial admin account and configuration
 */

import bcrypt from "bcryptjs";
import { writeFileSync } from "fs";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(`${colors.cyan}${question}${colors.reset} `);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

async function generatePasswordHash(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

function generateEnvFile(adminEmail, passwordHash) {
  const envContent = `# Wedding Website Environment Variables
# Generated on ${new Date().toISOString()}

# Admin Configuration
ADMIN_EMAIL="${adminEmail}"
ADMIN_PASSWORD_HASH="${passwordHash}"

# Email Service (Resend)
RESEND_API_KEY="your_resend_api_key_here"
RESEND_FROM_EMAIL="hello@alfinamugni.wedding"

# Site Configuration
VITE_SITE_URL="https://alfinamugni.wedding"
VITE_CONTACT_EMAIL="hello@alfinamugni.wedding"

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=""

# Development
ENVIRONMENT="production"
WEDDING_DATE="2025-11-29"
TIMEZONE="Asia/Jakarta"
WEDDING_LOCATION="Jakarta, Indonesia"
EXPECTED_GUESTS="200"
BRIDE_NAME="Alfina"
GROOM_NAME="Mugni"
`;

  return envContent;
}

function generateWranglerSecretsCommands(adminEmail, passwordHash) {
  return `# Cloudflare Wrangler Secrets Setup Commands
# Run these commands to set up your production secrets:

wrangler secret put ADMIN_EMAIL
# Enter: ${adminEmail}

wrangler secret put ADMIN_PASSWORD_HASH
# Enter: ${passwordHash}

wrangler secret put RESEND_API_KEY
# Enter: your_resend_api_key_here

wrangler secret put RESEND_FROM_EMAIL
# Enter: hello@alfinamugni.wedding
`;
}

async function main() {
  colorLog("blue", "🎊 Wedding Website Admin Setup");
  colorLog("blue", "================================");
  console.log("");

  colorLog(
    "yellow",
    "This script will help you set up your admin account for the wedding website."
  );
  colorLog("yellow", "You'll need to provide an admin email and password.");
  console.log("");

  // Get admin email
  const adminEmail = await prompt("Enter admin email address:");
  if (!adminEmail || !adminEmail.includes("@")) {
    colorLog("red", "❌ Invalid email address. Please run the script again.");
    process.exit(1);
  }

  // Get admin password
  const password = await prompt("Enter admin password (min 8 characters):");
  if (!password || password.length < 8) {
    colorLog("red", "❌ Password must be at least 8 characters long.");
    process.exit(1);
  }

  // Confirm password
  const confirmPassword = await prompt("Confirm admin password:");
  if (password !== confirmPassword) {
    colorLog("red", "❌ Passwords do not match.");
    process.exit(1);
  }

  console.log("");
  colorLog("blue", "🔐 Generating secure password hash...");

  try {
    // Generate password hash
    const passwordHash = await generatePasswordHash(password);

    console.log("");
    colorLog("green", "✅ Password hash generated successfully!");
    console.log("");

    // Generate .env file
    const envContent = generateEnvFile(adminEmail, passwordHash);
    const envPath = ".env.production";

    try {
      writeFileSync(envPath, envContent);
      colorLog("green", `✅ Environment file created: ${envPath}`);
    } catch {
      colorLog("yellow", `⚠️  Could not write ${envPath}. Here's the content:`);
      console.log("");
      colorLog("white", envContent);
    }

    console.log("");

    // Generate Wrangler secrets commands
    const secretsCommands = generateWranglerSecretsCommands(
      adminEmail,
      passwordHash
    );
    const commandsPath = "scripts/wrangler-secrets.txt";

    try {
      writeFileSync(commandsPath, secretsCommands);
      colorLog("green", `✅ Wrangler commands saved: ${commandsPath}`);
    } catch {
      colorLog(
        "yellow",
        `⚠️  Could not write ${commandsPath}. Here are the commands:`
      );
      console.log("");
      colorLog("white", secretsCommands);
    }

    console.log("");
    colorLog("blue", "📋 Next Steps:");
    console.log("");
    colorLog("white", "1. Set up Cloudflare secrets:");
    colorLog("cyan", "   npm run db:migrate  # Apply database migrations");
    colorLog("cyan", `   # Then run the commands in ${commandsPath} or above`);
    console.log("");
    colorLog("white", "2. Deploy your website:");
    colorLog("cyan", "   npm run deploy");
    console.log("");
    colorLog("white", "3. Access your admin dashboard:");
    colorLog("cyan", "   https://alfinamugni.wedding/admin");
    console.log("");
    colorLog("white", "4. Test the functionality:");
    colorLog("cyan", "   - RSVP submission");
    colorLog("cyan", "   - Guest wishes");
    colorLog("cyan", "   - Photo uploads");
    colorLog("cyan", "   - Email notifications");
    console.log("");
    colorLog("green", "🎉 Setup completed successfully!");
    colorLog("yellow", "⚠️  Remember to keep your admin credentials secure!");
  } catch (error) {
    colorLog("red", `❌ Error generating password hash: ${error.message}`);
    process.exit(1);
  }

  process.exit(0);
}

// Run the setup
main().catch((error) => {
  colorLog("red", `❌ Setup failed: ${error.message}`);
  process.exit(1);
});
