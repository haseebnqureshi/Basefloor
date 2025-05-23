# Publishing Guide

## Prerequisites

- [ ] Logged into npm: `npm whoami`
- [ ] Have publish access to `@basefloor` scope
- [ ] All tests passing: `npm run test:all`
- [ ] Build succeeds: `npm run build:all`
- [ ] Documentation is up to date
- [ ] CHANGELOG.md updated

## Publishing Workflow

### Option 1: Automated with Lerna (Recommended)

```bash
# 1. Ensure everything is clean and built
npm install
npm run build:all
npm run test:all

# 2. Version all packages (choose one)
npm run version:patch    # Bug fixes (1.0.0 -> 1.0.1)
npm run version:minor    # New features (1.0.0 -> 1.1.0)  
npm run version:major    # Breaking changes (1.0.0 -> 2.0.0)

# 3. Push version changes
git push origin main --tags

# 4. Publish all packages
npm run publish
```

### Option 2: Manual Publishing

If you need more control or Lerna isn't working:

```bash
# 1. Publish shared package first
cd packages/shared
npm run build
npm run test
npm version patch
npm publish

# 2. Update dependents and publish API
cd ../api
# Update @basefloor/shared version in package.json if needed
npm run build
npm run test
npm version patch  
npm publish

# 3. Publish App package
cd ../app
# Update @basefloor/shared version in package.json if needed
npm run build
npm run test
npm version patch
npm publish
```

## Package Details

### @basefloor/shared
- **Purpose**: Common types, schemas, utilities
- **Dependencies**: None
- **Dependents**: @basefloor/api, @basefloor/app
- **Build**: TypeScript compilation

### @basefloor/api  
- **Purpose**: Backend API framework
- **Dependencies**: @basefloor/shared, express, mongoose, etc.
- **Dependents**: @basefloor/app (peer dependency)
- **Build**: Provider scripts, dependency installation

### @basefloor/app
- **Purpose**: Vue.js frontend framework
- **Dependencies**: @basefloor/shared, vue, @vueuse/core, etc.
- **Peer Dependencies**: @basefloor/api
- **Build**: Vite build, TypeScript compilation

## Version Strategy

- **Patch** (x.x.X): Bug fixes, documentation updates
- **Minor** (x.X.x): New features, backwards compatible
- **Major** (X.x.x): Breaking changes

## Release Process

1. **Development**: Work on features in feature branches
2. **Integration**: Merge to main branch
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update docs and changelogs
5. **Versioning**: Use semantic versioning
6. **Publishing**: Publish packages in dependency order
7. **Verification**: Test installations in clean environment

## Troubleshooting

### Permission Issues
```bash
sudo chown -R $(whoami) ~/.npm
```

### Cache Issues
```bash
npm cache clean --force
```

### Build Issues
```bash
npm run clean
npm install
npm run build:all
```

### Dependency Issues
- Ensure shared package is published before dependents
- Update version numbers in dependent package.json files
- Use `npm ls` to check dependency tree

## Post-Publishing

- [ ] Verify packages on npmjs.com
- [ ] Test installation in clean project
- [ ] Update documentation website
- [ ] Announce release in appropriate channels
- [ ] Update example projects

## Canary Releases

For testing pre-release versions:

```bash
npm run publish:canary
```

This publishes with tags like `1.0.1-alpha.0` for testing. 