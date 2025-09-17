# Testing Framework

This directory contains the comprehensive testing infrastructure for Alfina & Mugni's Wedding Website.

## Directory Structure

### 🧪 Unit Tests (`unit/`)

Individual component and function tests using Qwik's testing utilities and Vitest.

### 🔗 Integration Tests (`integration/`)

Tests for component interactions, data flow, and feature integration within the wedding website.

### 🌐 End-to-End Tests (`e2e/`)

Full user journey tests covering RSVP flow, gallery navigation, and complete wedding website experience.

### 👁️ Visual Tests (`visual/`)

Visual regression tests to ensure consistent UI appearance across different devices and browsers.

### 🎭 Mocks (`__mocks__/`)

Mock implementations for external services, APIs, and components used during testing.

## Testing Strategy

- **Unit Testing**: Individual component functionality
- **Integration Testing**: Feature workflows and data integration
- **E2E Testing**: Complete user scenarios and wedding guest interactions
- **Visual Testing**: UI consistency and responsive design validation
- **Performance Testing**: Load times and user experience metrics

## Test Execution

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:visual
```

## Coverage and Reporting

Test coverage reports and visual test artifacts are generated in the respective output directories and excluded from version control.
