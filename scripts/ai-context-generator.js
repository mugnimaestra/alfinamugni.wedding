#!/usr/bin/env node

/**
 * AI Context Generator Script
 * Auto-generates and updates AI context files for Alfina & Mugni's Wedding Website
 *
 * Features:
 * - Generates project context summaries
 * - Updates CLAUDE.md with latest project state
 * - Creates component usage examples
 * - Generates development workflow guides
 * - Updates type definitions context
 *
 * @author Alfina & Mugni Development Team
 * @date November 2025
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  projectRoot: process.cwd(),
  sourceDir: "./src",
  docsDir: "./docs",
  configDir: "./config",
  scriptsDir: "./scripts",
  weddingInfo: {
    couple: "Alfina & Mugni",
    brideFirstName: "Alfina",
    groomFirstName: "Mugni",
    date: "November 29, 2025",
    location: "Jakarta, Indonesia",
    hashtag: "#AlfinaMugniWedding",
  },
  aiContextFiles: [
    "CLAUDE.md",
    "config/ai/context-templates/development-context.md",
    "config/ai/workflow-templates/component-development.md",
  ],
};

// Console colors
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
 * Logging utility
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
 * Read file safely
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return null;
  }
}

/**
 * Write file safely
 */
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (error) {
    log("error", `Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Get all files matching pattern
 */
function getFiles(dir, extensions = [".tsx", ".ts", ".js", ".jsx"]) {
  const files = [];

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;

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
      } else if (
        stat.isFile() &&
        extensions.some((ext) => item.endsWith(ext))
      ) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Analyze project structure
 */
function analyzeProjectStructure() {
  log("subheader", "Analyzing Project Structure");

  const analysis = {
    components: [],
    routes: [],
    utilities: [],
    types: [],
    configs: [],
    tests: [],
    docs: [],
    lastUpdated: new Date().toISOString(),
  };

  // Analyze components
  const componentFiles = getFiles("./src/components");
  for (const file of componentFiles) {
    const content = readFile(file);
    const relativePath = path.relative("./src", file);

    // Extract component exports
    const exports = (
      content?.match(/export\s+(?:const|function|class)\s+(\w+)/g) || []
    ).map((match) => match.replace(/export\s+(?:const|function|class)\s+/, ""));

    // Check for props interfaces
    const propsInterfaces = (
      content?.match(/interface\s+(\w+Props)\s*\{/g) || []
    ).map((match) => match.replace(/interface\s+(\w+)\s*\{/, "$1"));

    analysis.components.push({
      file: relativePath,
      path: file,
      exports,
      propsInterfaces,
      isComponent: relativePath.includes("components/"),
      lastModified: fs.statSync(file).mtime,
    });
  }

  // Analyze routes
  const routeFiles = getFiles("./src/routes");
  for (const file of routeFiles) {
    const relativePath = path.relative("./src", file);
    analysis.routes.push({
      file: relativePath,
      path: file,
      lastModified: fs.statSync(file).mtime,
    });
  }

  // Analyze documentation
  const docFiles = getFiles("./docs", [".md"]);
  for (const file of docFiles) {
    const content = readFile(file);
    const relativePath = path.relative("./docs", file);
    const title =
      content?.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, ".md");

    analysis.docs.push({
      file: relativePath,
      path: file,
      title,
      lastModified: fs.statSync(file).mtime,
    });
  }

  log(
    "success",
    `Analyzed ${analysis.components.length} components, ${analysis.routes.length} routes, ${analysis.docs.length} docs`,
  );
  return analysis;
}

/**
 * Generate project overview
 */
function generateProjectOverview(analysis) {
  log("subheader", "Generating Project Overview");

  const overview = `# Project Overview - ${CONFIG.weddingInfo.couple} Wedding Website

*Auto-generated project context for AI assistance*

## Wedding Information

- **Couple:** ${CONFIG.weddingInfo.couple}
- **Bride:** ${CONFIG.weddingInfo.brideFirstName}
- **Groom:** ${CONFIG.weddingInfo.groomFirstName}
- **Wedding Date:** ${CONFIG.weddingInfo.date}
- **Location:** ${CONFIG.weddingInfo.location}
- **Hashtag:** ${CONFIG.weddingInfo.hashtag}

## Project Structure

### Components (${analysis.components.length} files)

${analysis.components
  .map((comp) => {
    const exports = comp.exports.join(", ") || "No exports detected";
    const props = comp.propsInterfaces.join(", ") || "No props interfaces";

    return `#### ${comp.file}
- **Exports:** ${exports}
- **Props:** ${props}
- **Type:** ${comp.isComponent ? "React Component" : "Utility/Hook"}
- **Path:** \`${comp.file}\``;
  })
  .join("\n\n")}

### Routes (${analysis.routes.length} files)

${analysis.routes.map((route) => `- **${route.file}** - \`${route.file}\``).join("\n")}

### Documentation (${analysis.docs.length} files)

${analysis.docs.map((doc) => `- **${doc.title}** - \`${doc.file}\``).join("\n")}

## Key Features

- **Framework:** Qwik with TypeScript
- **Styling:** Tailwind CSS with custom wedding theme
- **Color Scheme:** Warm earth tones (cream, beige, sage, brown, accent gold)
- **Components:** Modular wedding-specific components
- **Responsive:** Mobile-first design
- **Performance:** Optimized for fast loading

## Development Context

- **Package Manager:** Bun (with npm fallback)
- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with custom rules
- **Testing:** Vitest for unit tests
- **Documentation:** Comprehensive markdown docs

## AI Assistance Guidelines

1. **Wedding Context:** Always maintain the romantic, elegant tone appropriate for ${CONFIG.weddingInfo.couple}'s wedding
2. **Cultural Sensitivity:** Consider Indonesian wedding traditions and customs
3. **Date Format:** Use "December 15, 2024" consistently
4. **Component Style:** Follow existing wedding component patterns
5. **Color Usage:** Use CSS custom properties from wedding theme
6. **Responsive Design:** Ensure mobile-first approach
7. **Performance:** Prioritize fast loading and Qwik optimization

Generated on: ${new Date().toLocaleString()}
Last analysis: ${analysis.lastUpdated}
`;

  return overview;
}

/**
 * Generate component usage examples
 */
function generateComponentExamples(analysis) {
  log("subheader", "Generating Component Examples");

  const examples = `# Component Usage Examples

*Auto-generated examples for ${CONFIG.weddingInfo.couple}'s Wedding Website*

## Available Components

${analysis.components
  .filter((comp) => comp.isComponent)
  .map((comp) => {
    const componentName =
      comp.exports[0] || path.basename(comp.file, path.extname(comp.file));
    const propsInterface = comp.propsInterfaces[0] || `${componentName}Props`;

    return `### ${componentName}

**File:** \`${comp.file}\`
**Props Interface:** \`${propsInterface}\`

\`\`\`tsx
import { ${componentName} } from '~/components/${path.basename(comp.file, path.extname(comp.file))}';

export default component$(() => {
  return (
    <${componentName}
      // Add props here based on ${propsInterface}
    />
  );
});
\`\`\`

**Common Usage Patterns:**
- Wedding section component
- Responsive design with Tailwind classes
- Wedding theme color variables
- TypeScript props validation
`;
  })
  .join("\n")}

## Wedding Theme Usage

\`\`\`css
/* Wedding Color Variables */
:root {
  --wedding-cream: #faf7f5;
  --wedding-beige: #f0e3d9;
  --wedding-sage: #d9e5e0;
  --wedding-lavender: #e0d9e5;
  --wedding-brown: #4d3326;
  --wedding-accent: #b2804d;
  --wedding-text-primary: #4d3326;
  --wedding-text-secondary: #80664d;
  --wedding-text-muted: #998066;
}
\`\`\`

## Responsive Patterns

\`\`\`tsx
// Mobile-first responsive design
<section class="px-4 py-8 md:px-8 md:py-16 lg:px-16">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-2xl md:text-4xl lg:text-6xl font-serif text-wedding-brown">
      {title}
    </h2>
  </div>
</section>
\`\`\`

## Animation Patterns

\`\`\`tsx
// Scroll-triggered animations
<div class="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
  {content}
</div>
\`\`\`

Generated on: ${new Date().toLocaleString()}
`;

  return examples;
}

/**
 * Generate development workflow guide
 */
function generateWorkflowGuide() {
  log("subheader", "Generating Workflow Guide");

  const workflow = `# Development Workflow Guide

*AI-assisted development patterns for ${CONFIG.weddingInfo.couple}'s Wedding Website*

## Component Development Workflow

### 1. Planning Phase
- Define component purpose and wedding context
- Identify props and TypeScript interfaces
- Plan responsive behavior and styling
- Consider accessibility requirements

### 2. Implementation Phase
\`\`\`bash
# Create new component
touch src/components/new-wedding-component.tsx

# Follow naming convention
# - Use kebab-case for files
# - Use PascalCase for component names
# - Add 'Section' suffix for main sections
\`\`\`

### 3. Component Template
\`\`\`tsx
import { component$ } from '@builder.io/qwik';

interface NewWeddingComponentProps {
  title?: string;
  className?: string;
}

export const NewWeddingComponent = component$<NewWeddingComponentProps>((props) => {
  return (
    <section 
      class={\`wedding-section bg-wedding-cream \${props.className || ''}\`}
    >
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="wedding-heading text-4xl md:text-6xl mb-8">
          {props.title || 'Wedding Section'}
        </h2>
        {/* Component content */}
      </div>
    </section>
  );
});
\`\`\`

### 4. Testing & Validation
\`\`\`bash
# Type checking
bun run type-check

# Linting
bun run lint

# Testing
bun run test

# Development server
bun run dev
\`\`\`

## Wedding-Specific Guidelines

### Color Usage
- Always use CSS custom properties for colors
- Primary text: \`text-wedding-brown\`
- Secondary text: \`text-wedding-text-secondary\`
- Accent elements: \`text-wedding-accent\`
- Backgrounds: \`bg-wedding-cream\`, \`bg-wedding-beige\`

### Typography
- Headings: \`font-serif\` (Playfair Display)
- Body text: \`font-sans\` (Inter)
- Wedding names: Larger, elegant styling
- Dates: Prominent display

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactive elements
- Readable text sizes on all devices

### Cultural Considerations
- Indonesian wedding traditions
- Formal tone with romantic elements
- Family-friendly content
- Respect for religious customs

## AI Assistance Patterns

### When Adding New Features
1. Analyze existing components for patterns
2. Maintain wedding theme consistency
3. Follow TypeScript best practices
4. Ensure responsive design
5. Add appropriate documentation

### When Debugging
1. Check browser console for errors
2. Validate TypeScript types
3. Test responsive behavior
4. Verify accessibility features
5. Check performance impact

### When Optimizing
1. Bundle size analysis
2. Image optimization
3. Code splitting opportunities
4. Performance monitoring
5. SEO considerations

Generated on: ${new Date().toLocaleString()}
Wedding Date: ${CONFIG.weddingInfo.date}
`;

  return workflow;
}

/**
 * Update CLAUDE.md with latest context
 */
function updateClaudeContext(analysis) {
  log("subheader", "Updating CLAUDE.md");

  const claudeContent = `# CLAUDE.md - AI Assistant Context

*Comprehensive context file for AI assistance with ${CONFIG.weddingInfo.couple}'s Wedding Website*

## Project Overview

This is a wedding website for **${CONFIG.weddingInfo.couple}** celebrating their marriage on **${CONFIG.weddingInfo.date}** in **${CONFIG.weddingInfo.location}**.

### Key Information
- **Bride:** ${CONFIG.weddingInfo.brideFirstName}
- **Groom:** ${CONFIG.weddingInfo.groomFirstName}
- **Wedding Date:** ${CONFIG.weddingInfo.date}
- **Location:** ${CONFIG.weddingInfo.location}
- **Wedding Hashtag:** ${CONFIG.weddingInfo.hashtag}
- **Theme:** Elegant, romantic with warm earth tones

## Technical Stack

- **Framework:** Qwik with TypeScript
- **Styling:** Tailwind CSS + Custom CSS
- **Package Manager:** Bun (npm fallback)
- **Deployment:** Static hosting ready
- **Development:** Hot reload, type checking, linting

## Project Structure

\`\`\`
${CONFIG.projectRoot}/
├── src/
│   ├── components/          # Wedding components
│   ├── routes/             # Page routes
│   ├── global.css          # Global styles & wedding theme
│   └── root.tsx            # App root
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── development/       # Dev guides
│   ├── examples/          # Usage examples
│   └── deployment/        # Deployment guides
├── config/                # Configuration
│   └── ai/               # AI context files
├── scripts/              # Automation scripts
└── public/               # Static assets
\`\`\`

## Current Components

${analysis.components
  .filter((comp) => comp.isComponent)
  .map(
    (comp) =>
      `- **${comp.exports[0] || path.basename(comp.file, path.extname(comp.file))}** (\`${comp.file}\`)`,
  )
  .join("\n")}

## Wedding Theme

### Colors
\`\`\`css
:root {
  --wedding-cream: #faf7f5;     /* Light background */
  --wedding-beige: #f0e3d9;     /* Section backgrounds */
  --wedding-sage: #d9e5e0;      /* Accent backgrounds */
  --wedding-lavender: #e0d9e5;  /* Alternate accent */
  --wedding-brown: #4d3326;     /* Primary text */
  --wedding-accent: #b2804d;    /* Accent color */
  --wedding-text-primary: #4d3326;
  --wedding-text-secondary: #80664d;
  --wedding-text-muted: #998066;
}
\`\`\`

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Wedding Names:** Large, elegant display
- **Dates:** Prominent, readable

## Development Guidelines

### Component Patterns
1. Use Qwik's \`component$\` function
2. TypeScript interfaces for props
3. Responsive design (mobile-first)
4. Wedding theme colors
5. Accessibility features

### Naming Conventions
- **Files:** kebab-case (\`hero-section.tsx\`)
- **Components:** PascalCase (\`HeroSection\`)
- **Props:** Interface with \`Props\` suffix
- **Sections:** Add \`Section\` suffix

### Styling Approach
- Tailwind CSS for utility classes
- Custom CSS for wedding-specific styles
- CSS custom properties for theme colors
- Responsive breakpoints: sm/md/lg/xl

## Content Guidelines

### Tone & Voice
- Elegant and romantic
- Warm and welcoming
- Professional yet personal
- Family-friendly
- Culturally sensitive (Indonesian context)

### Key Messages
- Celebration of love
- Joy and anticipation
- Gratitude to guests
- Family and tradition
- New beginning together

## AI Assistant Instructions

When helping with this project:

1. **Maintain Wedding Context:** Always remember this is for ${CONFIG.weddingInfo.couple}'s wedding on ${CONFIG.weddingInfo.date}
2. **Use Established Patterns:** Follow existing component and styling patterns
3. **Responsive Design:** Ensure mobile-first, accessible design
4. **TypeScript:** Maintain type safety and proper interfaces
5. **Wedding Theme:** Use the defined color palette and typography
6. **Cultural Sensitivity:** Respect Indonesian wedding traditions
7. **Performance:** Keep Qwik optimization in mind
8. **Documentation:** Update relevant docs when making changes

### Common Tasks
- Creating new wedding components
- Updating content for accuracy
- Improving responsive design
- Adding interactive features
- Optimizing performance
- Fixing TypeScript errors
- Writing documentation

### Wedding-Specific Features
- RSVP functionality
- Photo galleries
- Event details and schedules
- Contact information
- Directions and maps
- Gift registry
- Guest messages

## Recent Updates

**Last Generated:** ${new Date().toLocaleString()}
**Components:** ${analysis.components.length} files
**Routes:** ${analysis.routes.length} files
**Documentation:** ${analysis.docs.length} files

## External Integrations

- Google Maps (venue directions)
- Email services (RSVP confirmations)
- Photo hosting (gallery images)
- Calendar integration (save the date)
- Social media (Instagram feed)
- Analytics (visitor tracking)

---

*This context file is automatically updated by the AI context generator script.*
*For manual updates, see \`config/ai/context-templates/development-context.md\`*
`;

  return claudeContent;
}

/**
 * Generate type definitions context
 */
function generateTypeContext(analysis) {
  log("subheader", "Generating Type Context");

  const typeContext = `# TypeScript Context for AI

*Type definitions and interfaces for ${CONFIG.weddingInfo.couple}'s Wedding Website*

## Component Props Interfaces

${analysis.components
  .filter((comp) => comp.propsInterfaces.length > 0)
  .map((comp) => {
    return `### ${comp.file}

\`\`\`typescript
${comp.propsInterfaces
  .map(
    (iface) => `interface ${iface} {
  // Props defined in ${comp.file}
  // See docs/api/components-api.md for complete definitions
}`,
  )
  .join("\n\n")}
\`\`\``;
  })
  .join("\n\n")}

## Wedding Domain Types

\`\`\`typescript
// Core wedding information
interface WeddingInfo {
  couple: string;
  bride: string;
  groom: string;
  date: string;
  location: string;
  hashtag: string;
}

// RSVP form data
interface RSVPFormData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
}

// Photo gallery item
interface PhotoItem {
  id: string | number;
  src?: string;
  alt: string;
  caption?: string;
  backgroundColor?: string;
}

// Contact person
interface ContactPerson {
  role: 'bride' | 'groom' | 'family' | 'coordinator';
  name: string;
  relation: string;
  phone: string;
  email?: string;
  whatsapp?: string;
}
\`\`\`

## Theme Types

\`\`\`typescript
interface WeddingTheme {
  cream: string;
  beige: string;
  sage: string;
  lavender: string;
  brown: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}
\`\`\`

Generated on: ${new Date().toLocaleString()}
`;

  return typeContext;
}

/**
 * Update all AI context files
 */
function updateAIContextFiles(analysis) {
  log("subheader", "Updating AI Context Files");

  const updates = [];

  // Update CLAUDE.md
  const claudeContent = updateClaudeContext(analysis);
  if (writeFile("CLAUDE.md", claudeContent)) {
    updates.push("CLAUDE.md");
  }

  // Update development context
  const devContext = generateProjectOverview(analysis);
  if (
    writeFile("config/ai/context-templates/development-context.md", devContext)
  ) {
    updates.push("config/ai/context-templates/development-context.md");
  }

  // Update component development workflow
  const workflowGuide = generateWorkflowGuide();
  if (
    writeFile(
      "config/ai/workflow-templates/component-development.md",
      workflowGuide,
    )
  ) {
    updates.push("config/ai/workflow-templates/component-development.md");
  }

  // Generate component examples
  const componentExamples = generateComponentExamples(analysis);
  if (
    writeFile(
      "docs/examples/component-templates/auto-generated-examples.md",
      componentExamples,
    )
  ) {
    updates.push(
      "docs/examples/component-templates/auto-generated-examples.md",
    );
  }

  // Generate type context
  const typeContext = generateTypeContext(analysis);
  if (
    writeFile("config/ai/context-templates/type-definitions.md", typeContext)
  ) {
    updates.push("config/ai/context-templates/type-definitions.md");
  }

  log(
    "success",
    `Updated ${updates.length} AI context files: ${updates.join(", ")}`,
  );
  return updates;
}

/**
 * Generate commit message for updates
 */
function generateCommitMessage(updates) {
  const timestamp = new Date().toISOString().split("T")[0];
  return `docs: auto-update AI context files (${timestamp})

- Updated ${updates.length} AI context files
- Refreshed component analysis
- Generated latest project overview
- Updated workflow guidelines

Generated by ai-context-generator.js`;
}

/**
 * Main execution
 */
async function main() {
  log("header", `AI Context Generator - ${CONFIG.weddingInfo.couple}`);

  log("info", "Generating AI context for wedding website development");
  log(
    "info",
    `Wedding: ${CONFIG.weddingInfo.couple} - ${CONFIG.weddingInfo.date}`,
  );

  try {
    // Analyze current project state
    const analysis = analyzeProjectStructure();

    // Update all AI context files
    const updates = updateAIContextFiles(analysis);

    // Summary
    log("header", "Context Generation Complete! 🤖");
    log("success", `Updated ${updates.length} AI context files`);
    log("info", "Files updated:");
    updates.forEach((file) => console.log(`  ✓ ${file}`));

    // Git commit suggestion
    if (updates.length > 0) {
      log("info", "\nSuggested commit message:");
      console.log(generateCommitMessage(updates));
    }

    log("info", "\nNext steps:");
    console.log("  1. Review updated context files");
    console.log("  2. Commit changes if satisfied");
    console.log("  3. Use updated context for AI assistance");
  } catch (error) {
    log("error", `Context generation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
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
  analyzeProjectStructure,
  generateProjectOverview,
  generateComponentExamples,
  generateWorkflowGuide,
  updateClaudeContext,
  updateAIContextFiles,
};
