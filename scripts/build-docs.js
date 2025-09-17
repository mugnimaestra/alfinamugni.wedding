#!/usr/bin/env node

/**
 * Documentation Build Script
 * Generates and builds documentation for Alfina & Mugni's Wedding Website
 *
 * Features:
 * - Generates API documentation from TypeScript files
 * - Creates table of contents for markdown files
 * - Validates internal links and references
 * - Builds static documentation site
 * - Generates search index
 *
 * @author Alfina & Mugni Development Team
 * @date November 2025
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  sourceDir: "./src",
  docsDir: "./docs",
  outputDir: "./dist/docs",
  tempDir: "./temp/docs-build",
  weddingInfo: {
    couple: "Alfina & Mugni",
    date: "November 29, 2025",
    location: "Jakarta, Indonesia",
  },
};

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Print colored console messages
 */
function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const levels = {
    info: `${colors.blue}ℹ️  INFO${colors.reset}`,
    success: `${colors.green}✅ SUCCESS${colors.reset}`,
    warning: `${colors.yellow}⚠️  WARNING${colors.reset}`,
    error: `${colors.red}❌ ERROR${colors.reset}`,
    header: `${colors.magenta}${colors.bright}`,
    subheader: `${colors.cyan}`,
  };

  if (level === "header") {
    console.log(
      `\n${levels.header}==========================================${colors.reset}`,
    );
    console.log(`${levels.header}  ${message}${colors.reset}`);
    console.log(
      `${levels.header}==========================================${colors.reset}\n`,
    );
  } else if (level === "subheader") {
    console.log(`\n${levels.subheader}--- ${message} ---${colors.reset}`);
  } else {
    console.log(`[${timestamp}] ${levels[level]} ${message}`);
  }
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log("info", `Created directory: ${dirPath}`);
  }
}

/**
 * Read file contents safely
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    log("error", `Failed to read file: ${filePath}`);
    return null;
  }
}

/**
 * Write file contents safely
 */
function writeFile(filePath, content) {
  try {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf8");
    log("success", `Written file: ${filePath}`);
    return true;
  } catch (error) {
    log("error", `Failed to write file: ${filePath} - ${error.message}`);
    return false;
  }
}

/**
 * Get all markdown files in directory recursively
 */
function getMarkdownFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Get all TypeScript component files
 */
function getComponentFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith(".")) {
        traverse(fullPath);
      } else if (
        stat.isFile() &&
        (item.endsWith(".tsx") || item.endsWith(".ts")) &&
        !item.endsWith(".d.ts")
      ) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Extract TypeScript interface definitions
 */
function extractTypeScriptInterfaces(content) {
  const interfaces = [];
  const exportRegex =
    /export\s+(?:interface|type|class|function|const)\s+(\w+)/g;

  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    interfaces.push(match[1]);
  }

  return interfaces;
}

/**
 * Generate API documentation from TypeScript files
 */
function generateApiDocs() {
  log("subheader", "Generating API Documentation");

  const componentFiles = getComponentFiles(CONFIG.sourceDir);
  const apiDocs = [];

  for (const file of componentFiles) {
    const content = readFile(file);
    if (!content) continue;

    const relativePath = path.relative(CONFIG.sourceDir, file);
    const interfaces = extractTypeScriptInterfaces(content);

    if (interfaces.length > 0) {
      apiDocs.push({
        file: relativePath,
        path: file,
        interfaces,
      });

      log("info", `Processed: ${relativePath} (${interfaces.length} exports)`);
    }
  }

  // Generate API summary
  const apiSummary = `# API Documentation Summary

*Auto-generated API documentation for ${CONFIG.weddingInfo.couple}'s Wedding Website*

Generated on: ${new Date().toLocaleString()}

## Component Files

${apiDocs
  .map((doc) => {
    return `### ${doc.file}

**Exports:** ${doc.interfaces.join(", ")}

**File Path:** \`${doc.file}\`

**Interfaces:**
${doc.interfaces.map((iface) => `- [\`${iface}\`](./components-api.md#${iface.toLowerCase()})`).join("\n")}
`;
  })
  .join("\n")}

## Quick Reference

| Component | File | Key Exports |
|-----------|------|-------------|
${apiDocs.map((doc) => `| ${path.basename(doc.file, path.extname(doc.file))} | \`${doc.file}\` | ${doc.interfaces.slice(0, 3).join(", ")}${doc.interfaces.length > 3 ? "..." : ""} |`).join("\n")}

---

*This documentation is automatically generated from TypeScript source files.*
`;

  writeFile(
    path.join(CONFIG.docsDir, "api", "auto-generated-summary.md"),
    apiSummary,
  );

  log("success", `Generated API documentation for ${apiDocs.length} files`);
  return apiDocs;
}

/**
 * Generate table of contents for markdown files
 */
function generateTableOfContents() {
  log("subheader", "Generating Table of Contents");

  const markdownFiles = getMarkdownFiles(CONFIG.docsDir);
  const tocStructure = {};

  // Organize files by directory
  for (const file of markdownFiles) {
    const relativePath = path.relative(CONFIG.docsDir, file);
    const dir = path.dirname(relativePath);
    const fileName = path.basename(relativePath, ".md");

    if (!tocStructure[dir]) {
      tocStructure[dir] = [];
    }

    // Read file to get title
    const content = readFile(file);
    const titleMatch = content ? content.match(/^#\s+(.+)$/m) : null;
    const title = titleMatch ? titleMatch[1] : fileName;

    tocStructure[dir].push({
      fileName,
      title,
      path: relativePath,
    });
  }

  // Generate TOC markdown
  const tocContent = `# Documentation Table of Contents

*Complete documentation index for ${CONFIG.weddingInfo.couple}'s Wedding Website*

Last updated: ${new Date().toLocaleString()}

## Documentation Structure

${Object.entries(tocStructure)
  .sort()
  .map(([dir, files]) => {
    const dirTitle =
      dir === "."
        ? "Root Documentation"
        : dir
            .split("/")
            .map((part) =>
              part
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
            )
            .join(" / ");

    return `### ${dirTitle}

${files
  .sort((a, b) => a.fileName.localeCompare(b.fileName))
  .map((file) => `- [${file.title}](./${file.path})`)
  .join("\n")}`;
  })
  .join("\n\n")}

## Quick Navigation

### 🚀 Getting Started
- [Setup Guide](./development/setup-guide.md)
- [Architecture Overview](./architecture/system-overview.md)
- [Deployment Guide](./deployment/deployment-guide.md)

### 📖 API Documentation
- [Components API](./api/components-api.md)
- [Utilities API](./api/utilities-api.md)
- [Types API](./api/types-api.md)

### 💡 Examples
- [Component Templates](./examples/component-templates/)
- [Integration Examples](./examples/integration-examples/)
- [Styling Examples](./examples/styling-examples/)

### 🛠️ Development
- [Troubleshooting](./troubleshooting/common-issues.md)
- [Testing Guide](../tests/README.md)
- [Configuration](../config/README.md)

---

*Wedding Website Documentation for ${CONFIG.weddingInfo.couple} - ${CONFIG.weddingInfo.date}*
`;

  writeFile(path.join(CONFIG.docsDir, "table-of-contents.md"), tocContent);
  log(
    "success",
    `Generated table of contents for ${markdownFiles.length} files`,
  );
}

/**
 * Validate internal links in markdown files
 */
function validateInternalLinks() {
  log("subheader", "Validating Internal Links");

  const markdownFiles = getMarkdownFiles(CONFIG.docsDir);
  const errors = [];
  const warnings = [];

  for (const file of markdownFiles) {
    const content = readFile(file);
    if (!content) continue;

    const relativePath = path.relative(CONFIG.docsDir, file);

    // Find markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];

      // Skip external links
      if (linkUrl.startsWith("http") || linkUrl.startsWith("mailto:")) {
        continue;
      }

      // Check relative links
      if (linkUrl.startsWith("./") || linkUrl.startsWith("../")) {
        const targetPath = path.resolve(path.dirname(file), linkUrl);
        const cleanPath = targetPath.split("#")[0]; // Remove anchor

        if (!fs.existsSync(cleanPath)) {
          errors.push({
            file: relativePath,
            linkText,
            linkUrl,
            error: "Target file does not exist",
          });
        }
      }

      // Check anchor links
      if (linkUrl.includes("#")) {
        const anchor = linkUrl.split("#")[1];
        if (
          anchor &&
          !content.includes(`# ${anchor}`) &&
          !content.includes(`## ${anchor}`)
        ) {
          warnings.push({
            file: relativePath,
            linkText,
            linkUrl,
            warning: "Anchor may not exist",
          });
        }
      }
    }
  }

  // Report results
  if (errors.length > 0) {
    log("error", `Found ${errors.length} broken links:`);
    errors.forEach((error) => {
      console.log(`  ${error.file}: "${error.linkText}" -> ${error.linkUrl}`);
    });
  }

  if (warnings.length > 0) {
    log("warning", `Found ${warnings.length} potential issues:`);
    warnings.forEach((warning) => {
      console.log(
        `  ${warning.file}: "${warning.linkText}" -> ${warning.linkUrl}`,
      );
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    log("success", "All internal links are valid");
  }

  return { errors, warnings };
}

/**
 * Generate documentation search index
 */
function generateSearchIndex() {
  log("subheader", "Generating Search Index");

  const markdownFiles = getMarkdownFiles(CONFIG.docsDir);
  const searchIndex = [];

  for (const file of markdownFiles) {
    const content = readFile(file);
    if (!content) continue;

    const relativePath = path.relative(CONFIG.docsDir, file);

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(file, ".md");

    // Extract headings
    const headings = [...content.matchAll(/^#{2,6}\s+(.+)$/gm)].map(
      (match) => match[1],
    );

    // Extract text content (remove markdown syntax)
    const textContent = content
      .replace(/^#{1,6}\s+.+$/gm, "") // Remove headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with text
      .replace(/[*_`]/g, "") // Remove formatting
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/`[^`]+`/g, "") // Remove inline code
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join(" ")
      .substring(0, 500); // Limit content length

    searchIndex.push({
      id: relativePath.replace(/\.md$/, ""),
      title,
      headings,
      content: textContent,
      path: relativePath,
      url: `/${relativePath.replace(/\.md$/, ".html")}`,
    });
  }

  const searchIndexJson = JSON.stringify(searchIndex, null, 2);
  writeFile(path.join(CONFIG.tempDir, "search-index.json"), searchIndexJson);

  log("success", `Generated search index with ${searchIndex.length} documents`);
  return searchIndex;
}

/**
 * Build static documentation site
 */
function buildStaticSite() {
  log("subheader", "Building Static Documentation Site");

  try {
    // Copy markdown files to temp directory
    const markdownFiles = getMarkdownFiles(CONFIG.docsDir);

    for (const file of markdownFiles) {
      const relativePath = path.relative(CONFIG.docsDir, file);
      const targetPath = path.join(CONFIG.tempDir, relativePath);

      const content = readFile(file);
      if (content) {
        writeFile(targetPath, content);
      }
    }

    // Create index.html for documentation
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.weddingInfo.couple} Wedding - Documentation</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #faf7f5;
            color: #4d3326;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .nav-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-decoration: none;
            color: #4d3326;
            transition: transform 0.3s ease;
        }
        .nav-item:hover {
            transform: translateY(-2px);
        }
        .nav-item h3 {
            margin: 0 0 10px 0;
            color: #b2804d;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            color: #998066;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 Wedding Website Documentation</h1>
        <p><strong>${CONFIG.weddingInfo.couple}</strong> • ${CONFIG.weddingInfo.date} • ${CONFIG.weddingInfo.location}</p>
        <p>Complete development and user documentation</p>
    </div>
    
    <div class="nav">
        <a href="./table-of-contents.html" class="nav-item">
            <h3>📋 Table of Contents</h3>
            <p>Complete documentation index and navigation</p>
        </a>
        
        <a href="./development/setup-guide.html" class="nav-item">
            <h3>🚀 Setup Guide</h3>
            <p>Development environment setup and configuration</p>
        </a>
        
        <a href="./api/components-api.html" class="nav-item">
            <h3>📖 API Documentation</h3>
            <p>Component interfaces and type definitions</p>
        </a>
        
        <a href="./examples/integration-examples/third-party-integrations.html" class="nav-item">
            <h3>🔗 Integration Examples</h3>
            <p>Third-party service integration guides</p>
        </a>
        
        <a href="./deployment/deployment-guide.html" class="nav-item">
            <h3>🌐 Deployment Guide</h3>
            <p>Production deployment and hosting setup</p>
        </a>
        
        <a href="./troubleshooting/common-issues.html" class="nav-item">
            <h3>🛠️ Troubleshooting</h3>
            <p>Common issues and solutions</p>
        </a>
    </div>
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Wedding Website Documentation System</p>
    </div>
</body>
</html>`;

    writeFile(path.join(CONFIG.tempDir, "index.html"), indexHtml);

    log("success", "Static documentation site built successfully");

    // Try to convert markdown to HTML if pandoc is available
    try {
      execSync("which pandoc", { stdio: "ignore" });
      log("info", "Pandoc found - converting markdown files to HTML");

      const htmlDir = path.join(CONFIG.tempDir, "html");
      ensureDir(htmlDir);

      for (const file of markdownFiles) {
        const relativePath = path.relative(CONFIG.docsDir, file);
        const htmlPath = path.join(
          htmlDir,
          relativePath.replace(/\.md$/, ".html"),
        );

        try {
          execSync(
            `pandoc "${file}" -o "${htmlPath}" --standalone --css=../docs-style.css`,
            { stdio: "ignore" },
          );
        } catch (error) {
          // Silently continue if individual file conversion fails
        }
      }

      log("success", "Markdown files converted to HTML");
    } catch (error) {
      log("warning", "Pandoc not found - HTML conversion skipped");
    }
  } catch (error) {
    log("error", `Failed to build static site: ${error.message}`);
    return false;
  }

  return true;
}

/**
 * Clean up temporary files
 */
function cleanup() {
  log("subheader", "Cleaning Up");

  if (fs.existsSync(CONFIG.tempDir)) {
    try {
      fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
      log("success", "Temporary files cleaned up");
    } catch (error) {
      log("warning", `Failed to clean temporary files: ${error.message}`);
    }
  }
}

/**
 * Main build process
 */
async function main() {
  log("header", `Documentation Build - ${CONFIG.weddingInfo.couple}`);

  log("info", `Building documentation for wedding website`);
  log("info", `Couple: ${CONFIG.weddingInfo.couple}`);
  log("info", `Date: ${CONFIG.weddingInfo.date}`);
  log("info", `Location: ${CONFIG.weddingInfo.location}`);

  // Ensure directories exist
  ensureDir(CONFIG.tempDir);
  ensureDir(CONFIG.outputDir);

  try {
    // Run build steps
    generateApiDocs();
    generateTableOfContents();
    const linkValidation = validateInternalLinks();
    generateSearchIndex();
    buildStaticSite();

    // Summary
    log("header", "Build Complete! 🎉");
    log("success", "Documentation build completed successfully");

    if (linkValidation.errors.length > 0) {
      log(
        "warning",
        `Found ${linkValidation.errors.length} broken links that should be fixed`,
      );
    }

    log("info", `Documentation available at: ${CONFIG.tempDir}`);
    log("info", "Next steps:");
    console.log("  1. Review generated documentation");
    console.log("  2. Fix any broken links");
    console.log("  3. Deploy to documentation hosting");
  } catch (error) {
    log("error", `Build failed: ${error.message}`);
    process.exit(1);
  } finally {
    // Uncomment to keep temp files for review
    // cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log("error", `Unhandled error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  generateApiDocs,
  generateTableOfContents,
  validateInternalLinks,
  generateSearchIndex,
  buildStaticSite,
};
