# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-10-03

### Added

- **Core Preprocessor**
  - Svelte 5 preprocessor for transforming Tailwind CSS classes in email components
  - AST-based parsing using official Svelte compiler API
  - Build-time transformation for zero runtime overhead
  - Support for static Tailwind classes to inline styles conversion
- **Responsive Email Support**
  - Automatic detection of responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
  - Media query generation and injection into `<Head>` component
  - Proper `!important` flags for email client compatibility
- **Parser Module** (`parser.ts`)
  - Extract class attributes from Svelte 5 AST
  - Support for HTML elements and Svelte components
  - Handle conditional blocks (`{#if}`) and loops (`{#each}`)
  - Detect dynamic vs static class expressions
  - Find and locate `<Head>` component for style injection
- **Transformer Module** (`transformer.ts`)
  - Convert Tailwind utilities to CSS using `tw-to-css`
  - Separate responsive from non-responsive classes
  - Generate media queries with proper breakpoint configuration
  - Sanitize class names for CSS compatibility
- **Head Injector Module** (`head-injector.ts`)
  - Surgical insertion of media query styles
  - Support for self-closing and regular `<Head>` tags
  - Preserve existing content in `<Head>` component
- **Type Definitions**
  - Comprehensive TypeScript interfaces for all modules
  - Full type safety throughout the codebase
  - Exported types for library users
- **Configuration Options**
  - `pathToEmailFolder` - Configure email component directory
  - `tailwindConfig` - Custom Tailwind configuration support
  - `debug` - Enable debug logging for development
- **Testing**
  - 52 passing unit and integration tests
  - Parser tests for AST traversal
  - Transformer tests for Tailwind conversion
  - Head injector tests for style insertion
  - Integration tests for end-to-end workflows
  - Test coverage for edge cases
- **Documentation**
  - Comprehensive README with examples
  - Implementation guide (1700+ lines)
  - API reference
  - Troubleshooting section
  - Usage examples

### Technical Details

- Uses Svelte 5 compiler API (`parse` function)
- Leverages `magic-string` for efficient source code transformations
- Integrates `tw-to-css` for Tailwind to CSS conversion
- Maintains source map compatibility
- Zero dependencies on Svelte internals (future-proof)

### Supported Tailwind Features

- ✅ All standard Tailwind utilities (colors, spacing, typography, borders, etc.)
- ✅ Responsive breakpoints with media queries
- ✅ Custom Tailwind configurations
- ✅ Nested components and HTML elements
- ✅ Conditional rendering and loops

### Known Limitations

- Dynamic class expressions (`class={variable}`) are detected but not transformed
- Only processes files in configured email folder
- Requires `<Head>` component for responsive classes

### Dependencies

- `magic-string`: ^0.30.19
- `tw-to-css`: ^0.0.12

### Peer Dependencies

- `svelte`: ^5.0.0

[0.0.1]: https://github.com/yourusername/better-svelte-email/releases/tag/v0.0.1
