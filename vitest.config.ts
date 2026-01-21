/**
 * Vitest Configuration
 *
 * Test framework setup for the Decision Engine and other modules.
 *
 * Features:
 * - Node environment for fast unit testing
 * - Global test functions (describe, test, expect) without imports
 * - TypeScript path alias support (@/ -> ./src/)
 * - Watch mode for rapid TDD workflow
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // Use node environment for faster unit tests
    // Change to 'jsdom' if DOM testing is needed in the future
    environment: 'node',

    // Enable global describe/test/expect (no imports needed in test files)
    globals: true,

    // Test file patterns
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.next', 'build'],

    // Setup files (optional, for global test utilities)
    // setupFiles: ['./src/test/setup.ts'],
  },

  // Resolve TypeScript path aliases to match tsconfig.json
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
