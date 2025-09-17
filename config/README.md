# Configuration

This directory contains environment-specific configurations and templates for Alfina & Mugni's Wedding Website project.

## Directory Structure

### 🤖 AI Configuration (`ai/`)

AI-assisted development configurations, context templates, and workflow automation:

- **Context Templates**: Pre-defined context for AI development assistance
- **Workflow Templates**: Automated development and deployment workflows

### 🛠️ Development (`development/`)

Development environment configurations, local settings, and developer tools setup.

### 🚀 Deployment (`deployment/`)

Production and staging environment configurations, build settings, and hosting configurations.

## Configuration Management

- **Environment Variables**: Managed through `.env` files (not committed to version control)
- **Build Configurations**: Vite and Qwik build settings for different environments
- **CI/CD Configurations**: GitHub Actions and deployment pipeline settings
- **AI Workflow Configurations**: Templates for consistent AI-assisted development

## Usage Guidelines

- Keep sensitive configuration data in environment variables
- Use environment-specific configuration files
- Maintain separate configurations for development, staging, and production
- Document configuration changes in relevant README files
- Validate configurations before deployment

## Security Notes

- Never commit sensitive data (API keys, passwords, tokens)
- Use `.local` suffix for local overrides (automatically ignored by git)
- Regularly review and update security configurations
- Follow principle of least privilege for API access
