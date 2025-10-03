# Release Process

This project uses automated releases based on version changes in `package.json`.

## How It Works

1. **Make your changes** and commit them to a feature branch
2. **Run tests locally** to ensure everything works:
   ```bash
   bun test
   ```
3. **Update the version** in `package.json` following [Semantic Versioning](https://semver.org/):
   - **Patch** (0.0.x): Bug fixes, minor changes
   - **Minor** (0.x.0): New features, backwards compatible
   - **Major** (x.0.0): Breaking changes

   ```bash
   # Example: bump version
   npm version patch  # 0.0.1 -> 0.0.2
   npm version minor  # 0.0.2 -> 0.1.0
   npm version major  # 0.1.0 -> 1.0.0
   ```

4. **Commit the version bump**:

   ```bash
   git add package.json
   git commit -m "chore: bump version to 0.1.0"
   ```

5. **Push to main branch**:

   ```bash
   git push origin main
   ```

6. **GitHub Actions** will automatically:
   - Run all tests
   - Check if the version has changed
   - Generate a changelog from commit messages
   - Create a new GitHub release with the changelog

## Commit Message Format

For better changelog generation, use conventional commit format:

- `feat:` - New features (appears under ✨ Features)
- `fix:` - Bug fixes (appears under 🐛 Bug Fixes)
- `docs:` - Documentation changes (appears under 📚 Documentation)
- `test:` - Test additions/changes (appears under 🧪 Tests)
- `chore:` - Maintenance tasks (appears under 🔧 Maintenance)
- `ci:` - CI/CD changes (appears under 🔧 Maintenance)
- `build:` - Build system changes (appears under 🔧 Maintenance)

### Examples

```bash
git commit -m "feat: add support for responsive media queries"
git commit -m "fix: resolve semicolon issue in styleString"
git commit -m "docs: update README with installation instructions"
git commit -m "test: add end-to-end component tests"
git commit -m "chore: update dependencies"
```

## Release Workflow

The release workflow (`.github/workflows/release.yml`) will:

1. ✅ **Run tests** - Ensure all tests pass
2. 🔍 **Check version** - Compare `package.json` version with existing tags
3. 📝 **Generate changelog** - Create categorized changelog from commits
4. 🚀 **Create release** - Publish new GitHub release with changelog

## Manual Release

If you need to create a release manually:

```bash
# Create and push a version tag
git tag v0.1.0
git push origin v0.1.0

# Then create release on GitHub with changelog
```

## Checking Release Status

After pushing to main:

1. Go to **Actions** tab in GitHub repository
2. Find the "Test and Release" workflow run
3. Check the logs to see if a release was created

## Troubleshooting

### Release Not Created

- **Version already exists**: The version in `package.json` matches an existing tag
  - Solution: Bump the version to a new number
- **Tests failed**: The test suite didn't pass
  - Solution: Fix failing tests before pushing
- **Not on main branch**: Releases only trigger from the `main` branch
  - Solution: Merge your changes to `main`

### Changelog Issues

- **Empty changelog**: No commits since last release
  - This is normal for version-only changes
- **Missing categories**: Commits don't use conventional format
  - Use proper commit prefixes for better organization

## Version Strategy

### Pre-1.0.0 (Current)

- Breaking changes: Bump minor version (0.x.0)
- New features: Bump minor version (0.x.0)
- Bug fixes: Bump patch version (0.0.x)

### Post-1.0.0

- Breaking changes: Bump major version (x.0.0)
- New features: Bump minor version (1.x.0)
- Bug fixes: Bump patch version (1.0.x)

## Example Workflow

```bash
# Create feature branch
git checkout -b feature/add-new-component

# Make changes and commit
git add .
git commit -m "feat: add Image component with lazy loading"

# Run tests
bun test

# Bump version (if ready for release)
npm version minor  # 0.0.1 -> 0.1.0

# Commit version bump
git add package.json
git commit -m "chore: bump version to 0.1.0"

# Merge to main
git checkout main
git merge feature/add-new-component
git push origin main

# GitHub Actions creates release automatically! 🎉
```

## Notes

- Releases are **immutable** - once created, they cannot be changed
- Tags are **permanent** - don't delete tags from published releases
- The `main` branch should always contain the latest stable version
- Use feature branches for development and merge to `main` when ready
