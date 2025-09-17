#!/bin/bash

# Wedding Website Setup Script
# Automated environment setup for Alfina & Mugni's Wedding Website
# Author: Alfina & Mugni Development Team
# Date: November 2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Wedding project information
WEDDING_COUPLE="Alfina & Mugni"
WEDDING_DATE="November 29, 2025"
PROJECT_NAME="alfinamugni.wedding"

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}==========================================${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}==========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Minimum required: $REQUIRED_VERSION"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to install Node.js using nvm if not present
install_nodejs() {
    if ! command_exists node || ! check_node_version; then
        print_info "Installing Node.js..."
        
        if command_exists nvm; then
            nvm install 20
            nvm use 20
            nvm alias default 20
        elif command_exists brew; then
            brew install node@20
        elif command_exists apt-get; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command_exists yum; then
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
        else
            print_error "Cannot install Node.js automatically. Please install Node.js 18+ manually."
            echo "Visit: https://nodejs.org/en/download/"
            exit 1
        fi
        
        if check_node_version; then
            print_success "Node.js installed successfully"
        else
            print_error "Failed to install compatible Node.js version"
            exit 1
        fi
    fi
}

# Function to install Bun if not present
install_bun() {
    if ! command_exists bun; then
        print_info "Installing Bun package manager..."
        curl -fsSL https://bun.sh/install | bash
        
        # Add Bun to PATH for current session
        export PATH="$HOME/.bun/bin:$PATH"
        
        if command_exists bun; then
            print_success "Bun installed successfully"
        else
            print_error "Failed to install Bun. Falling back to npm."
            return 1
        fi
    else
        print_success "Bun is already installed"
    fi
    return 0
}

# Function to detect package manager
detect_package_manager() {
    if [ -f "bun.lockb" ] && command_exists bun; then
        echo "bun"
    elif [ -f "yarn.lock" ] && command_exists yarn; then
        echo "yarn"
    elif [ -f "pnpm-lock.yaml" ] && command_exists pnpm; then
        echo "pnpm"
    else
        echo "npm"
    fi
}

# Function to install dependencies
install_dependencies() {
    local package_manager=$(detect_package_manager)
    
    print_info "Installing dependencies using $package_manager..."
    
    case $package_manager in
        "bun")
            bun install
            ;;
        "yarn")
            yarn install
            ;;
        "pnpm")
            pnpm install
            ;;
        *)
            npm install
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Function to setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            # Create basic .env file
            cat > .env << EOF
# Wedding Website Environment Variables
# Generated on $(date)

# Wedding Information
VITE_WEDDING_COUPLE="$WEDDING_COUPLE"
VITE_WEDDING_DATE="2025-11-29"
VITE_WEDDING_LOCATION="Jakarta, Indonesia"
VITE_WEDDING_HASHTAG="AlfinaMugniWedding"

# Development
NODE_ENV=development
VITE_APP_TITLE="$WEDDING_COUPLE Wedding"
VITE_APP_DESCRIPTION="Join us for our wedding celebration on $WEDDING_DATE"

# API Keys (Replace with actual values)
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# VITE_AIRTABLE_API_KEY=your_airtable_api_key
# VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id

# Social Media
# VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_token
# VITE_FACEBOOK_PAGE_ID=your_facebook_page_id

# Analytics
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

EOF
            print_success "Created basic .env file"
        fi
        
        print_warning "Please update .env file with your actual API keys and configuration"
        print_info "Refer to docs/examples/integration-examples/third-party-integrations.md for setup guides"
    else
        print_info ".env file already exists"
    fi
}

# Function to setup Git hooks
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_info "Setting up Git hooks..."
        
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for wedding website

echo "Running pre-commit checks for wedding website..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
fi

# Run type checking
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix errors before committing."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi
}

# Function to create necessary directories
create_directories() {
    print_info "Creating project directories..."
    
    local directories=(
        "public/images/gallery"
        "public/images/hero"
        "public/images/story"
        "public/images/venue"
        "public/images/gifts"
        "src/assets"
        "src/lib"
        "src/hooks"
        "src/services"
        "src/types"
        "src/utils"
        "logs"
        "temp"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Function to setup development tools
setup_dev_tools() {
    print_info "Setting up development tools..."
    
    # Create VS Code settings if not exists
    if [ ! -d ".vscode" ]; then
        mkdir -p .vscode
        
        cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "javascript": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["class:\\s*?[\"'`]([^\"'`]*).*?[\"'`]", "class:\\s*?[\"'`]([^\"'`]*)"],
    ["className:\\s*?[\"'`]([^\"'`]*).*?[\"'`]", "className:\\s*?[\"'`]([^\"'`]*)"]
  ]
}
EOF
        
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF
        
        print_success "VS Code configuration created"
    fi
    
    # Setup Prettier configuration if not exists
    if [ ! -f ".prettierrc" ]; then
        cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOF
        print_success "Prettier configuration created"
    fi
}

# Function to verify installation
verify_installation() {
    print_info "Verifying installation..."
    
    local errors=0
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        ((errors++))
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_error "node_modules directory not found"
        ((errors++))
    fi
    
    # Check if main source files exist
    local required_files=(
        "src/root.tsx"
        "src/routes/index.tsx"
        "src/global.css"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file not found: $file"
            ((errors++))
        fi
    done
    
    # Try to run type checking
    print_info "Running type check..."
    local package_manager=$(detect_package_manager)
    
    case $package_manager in
        "bun")
            if ! bun run type-check >/dev/null 2>&1; then
                print_warning "Type check failed - this is normal for initial setup"
            fi
            ;;
        *)
            if ! npm run type-check >/dev/null 2>&1; then
                print_warning "Type check failed - this is normal for initial setup"
            fi
            ;;
    esac
    
    if [ $errors -eq 0 ]; then
        print_success "Installation verification completed successfully"
        return 0
    else
        print_error "Installation verification failed with $errors errors"
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${CYAN}Your wedding website for $WEDDING_COUPLE is ready!${NC}\n"
    
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update .env file with your API keys and configuration"
    echo "2. Customize wedding details in src/components/"
    echo "3. Add your photos to public/images/"
    echo "4. Test the development server:"
    echo "   $(detect_package_manager) run dev"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "• Setup Guide: docs/development/setup-guide.md"
    echo "• API Documentation: docs/api/"
    echo "• Integration Examples: docs/examples/integration-examples/"
    echo "• Deployment Guide: docs/deployment/deployment-guide.md"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "• Start development server: $(detect_package_manager) run dev"
    echo "• Build for production: $(detect_package_manager) run build"
    echo "• Run tests: $(detect_package_manager) run test"
    echo "• Check types: $(detect_package_manager) run type-check"
    echo "• Lint code: $(detect_package_manager) run lint"
    echo ""
    echo -e "${GREEN}Happy coding! 💒✨${NC}"
}

# Function to handle errors
handle_error() {
    print_error "Setup failed at step: $1"
    echo "Please check the error messages above and try again."
    echo "For help, refer to the documentation or create an issue."
    exit 1
}

# Main setup function
main() {
    print_header "Wedding Website Setup"
    echo -e "${CYAN}Setting up development environment for:${NC}"
    echo -e "${CYAN}Couple: $WEDDING_COUPLE${NC}"
    echo -e "${CYAN}Wedding Date: $WEDDING_DATE${NC}"
    echo -e "${CYAN}Project: $PROJECT_NAME${NC}\n"
    
    # Check prerequisites
    print_header "Checking Prerequisites"
    
    # Check operating system
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        print_warning "Windows detected. Some features may require WSL or Git Bash."
    fi
    
    # Install Node.js if needed
    install_nodejs || handle_error "Node.js installation"
    
    # Try to install Bun, fallback to npm if failed
    if ! install_bun; then
        print_info "Using npm as package manager"
    fi
    
    # Setup project
    print_header "Setting Up Project"
    
    install_dependencies || handle_error "Dependency installation"
    setup_environment || handle_error "Environment setup"
    create_directories || handle_error "Directory creation"
    setup_dev_tools || handle_error "Development tools setup"
    setup_git_hooks || handle_error "Git hooks setup"
    
    # Verification
    print_header "Verification"
    verify_installation || handle_error "Installation verification"
    
    # Show completion message
    show_next_steps
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi