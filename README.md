<p align="center">
	<img src="static/favicon.svg" alt="Better Svelte Email" width="128" height="128">
  <h3 align="center">Better Svelte Email</h3>
	<p align="center">
		Create beautiful emails in Svelte with first-class Tailwind support
	</p>
	<p align="center">
		<a href="https://better-svelte-email.konixy.fr">Website</a>
		 · 
		<a href="https://github.com/Konixy/better-svelte-email">GitHub</a>
	</p>
  <p align="center">
    <a href="https://github.com/Konixy/better-svelte-email/actions/workflows/release.yml">
      <img src="https://github.com/Konixy/better-svelte-email/actions/workflows/release.yml/badge.svg" alt="Tests">
    </a>
    <a href="https://www.npmjs.com/package/better-svelte-email">
      <img src="https://img.shields.io/npm/v/better-svelte-email.svg?logo=npm" alt="npm version">
    </a>
    <a href="https://github.com/Konixy/better-svelte-email/stargazers">
      <img src="https://img.shields.io/github/stars/Konixy/better-svelte-email?style=default&logo=github" alt="GitHub stars">
    </a>
  </p>
</p>

## Usage

See the [documentation](https://better-svelte-email.konixy.fr/docs) for a complete guide on how to use Better Svelte Email.

## Features

- **Tailwind v4 Support** - Transforms Tailwind classes to inline styles for email clients
- **Built-in Email Preview** - Visual email preview and test sending
- **TypeScript First** - Fully typed with comprehensive type definitions
- **Well Tested** - >90% test coverage with unit and integration tests

_See [Roadmap](./ROADMAP.md) for future features and planned improvements._

## Why?

Existing Svelte email solutions have significant limitations:

- **svelte-email** hasn't been updated in over 2 years
- **svelte-email-tailwind** suffers from stability issues and maintaining it is not sustainable anymore

Better Svelte Email is a complete rewrite of [svelte-email-tailwind](https://github.com/steveninety/svelte-email-tailwind) inspired by [React Email](https://react.email/), providing the rock-solid foundation your email infrastructure needs. It brings the simplicity, reliability, and feature richness of [React Email](https://react.email/) to the Svelte ecosystem.

## Minimum Svelte Version

The minimum supported Svelte version is 5.14.3.
For older versions, you can use [`svelte-email-tailwind`](https://github.com/steveninety/svelte-email-tailwind).

## Supported Features

### ✅ Supported

- All tailwindcss v4 utilities
- Custom Tailwind classes (`bg-[#fff]`, `my:[40px]`, ...)
- Dynamic Tailwind classes (`class={someVar}`)
- Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- HTML elements and Svelte components
- Nested components
- All svelte features such as each blocks (`{#each}`) and if blocks (`{#if}`), and more
- Custom Tailwind configurations

## Author

Anatole Dufour ([@Konixy](https://github.com/Konixy))

### Author of `svelte-email-tailwind`

Steven Polak ([@steveninety](https://github.com/steveninety))

### Authors of `react-email`

Bu Kinoshita ([@bukinoshita](https://github.com/bukinoshita))

Zeno Rocha ([@zenorocha](https://github.com/zenorocha))

## Development

### Running Tests

```bash
bun run test
```

All tests must pass before pushing to main. The CI/CD pipeline will automatically run tests on every push and pull request.

### Building

```bash
bun run build
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

To do so, you'll need to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`bun run test`)
5. Commit your changes using [conventional commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks
6. Push to your branch (`git push origin feat/amazing-feature`)
7. Open a Pull Request

## Acknowledgements

Many components and logic were inspired by or adapted from [svelte-email-tailwind](https://github.com/steveninety/svelte-email-tailwind) and [react-email](https://react.email/). Huge thanks to the authors and contributors of these projects for their excellent work.
