# Contributing to GrowAgentAI

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Contributor License Agreement

By submitting a PR, you agree to our [CLA.md](CLA.md) terms:
- You assign IP rights to GrowAgentAI maintainers
- Your contribution will be under GNU AGPLv3 license
- You confirm the code is your own and doesn't infringe third-party rights

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Use GitHub Issues to search for similar bugs
2. **Create detailed report** - Use the [bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md) template
3. **Include:**
   - What you expected to happen
   - What actually happened
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
   - Screenshots/logs if applicable

### Suggesting Features

1. **Check existing requests** - Browse GitHub Issues
2. **Use feature template** - Fill out [feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)
3. **Explain:**
   - What problem it solves
   - How it would work
   - Why it's important
   - Possible implementation approaches

### Contributing Code

#### Setup Development Environment

```bash
# 1. Fork repository
git clone https://github.com/[usuario]/growagentai.git
cd growagentai

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Install dependencies
npm install

# 4. Create .env from example
cp .env.example .env
# Edit with your settings

# 5. Start development
npm run dev
```

#### Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint
npm run format

# Build for production
npm run build
```

#### Code Standards

**TypeScript Only**
- All code must be TypeScript
- Strict mode: `"strict": true`
- No `any` types without justification

**ESLint & Prettier**
```bash
npm run lint      # Check
npm run lint:fix  # Auto-fix
npm run format    # Format with Prettier
```

**Testing Requirements**
- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Playwright
- Coverage target: 80%+

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Example Unit Test**
```typescript
// src/__tests__/example.test.ts
describe('Example', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Git Workflow

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Longer explanation if needed.

Fixes #issue-number
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Dependencies, build

**Examples:**
```
feat(coaching): add GROW stage visualization
fix(auth): correct JWT expiration bug
docs(api): add endpoint examples
test(goals): increase coverage to 85%
```

#### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/descriptive-name
   ```

2. **Make changes & commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Keep updated with main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/descriptive-name
   ```

5. **Open Pull Request**
   - Use PR template
   - Provide clear description
   - Link related issues
   - Request reviewers

6. **Respond to reviews**
   - Make requested changes
   - Push updates (don't force)
   - Mark conversations as resolved

### Pull Request Guidelines

**Title (max 70 chars):**
```
feat: Add real-time goal progress tracking
```

**Description template:**
```markdown
## Description
Brief explanation of what this PR does.

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Checklist
- [ ] Tests pass locally
- [ ] Coverage is 80%+
- [ ] Linting passes
- [ ] No console errors
- [ ] Documentation updated
```

## Project Structure

```
growagentai/
├── backend/              # Node.js API
│  ├── src/
│  │  ├── controllers/   # Route handlers
│  │  ├── services/      # Business logic
│  │  ├── middleware/    # Express middleware
│  │  ├── utils/         # Helper functions
│  │  └── server.ts
│  ├── tests/            # Tests
│  └── prisma/           # Database
├── frontend/            # React apps
│  ├── web/              # Web React app
│  ├── desktop/          # Electron app
│  └── mobile/           # React Native
├── docs/                # Documentation
├── legal/               # Legal documents
└── base_conocimientos/  # Knowledge base
```

## What We're Looking For

### Easy (Good for newcomers)
- [ ] Bug fixes
- [ ] Documentation improvements
- [ ] Translations (ES, EN, FR, DE, PT)
- [ ] Tests
- [ ] UI tweaks

### Medium
- [ ] Feature additions
- [ ] Performance improvements
- [ ] Refactoring
- [ ] API enhancements

### Hard
- [ ] Architecture changes
- [ ] New platforms (iOS, Android)
- [ ] Core algorithm improvements

## Getting Help

- **Questions?** Ask in GitHub Discussions
- **Stuck?** Join [Discord Community](https://discord.gg/growagentai)
- **Issues?** Check [Troubleshooting](docs/12_TROUBLESHOOTING.md)

## Review Process

### What Reviewers Check
1. ✅ Code quality & standards
2. ✅ Tests passing
3. ✅ No breaking changes
4. ✅ Documentation updated
5. ✅ Performance impact
6. ✅ Security issues

### Timeline
- Minor fixes: 24-48 hours
- Features: 48-72 hours
- Breaking changes: 1+ week

## Release Process

Releases are tagged and numbered following [Semantic Versioning](https://semver.org/):
- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features
- **Patch (0.0.1)**: Bug fixes

## Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Welcome diverse perspectives
- Constructive feedback only
- Report violations to: conduct@growagentai.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Acknowledgments

Contributors will be recognized in:
- README.md
- Release notes
- GitHub contributors graph

---

**Thank you for contributing to GrowAgentAI! Together we're building the future of AI coaching.** 🚀

[Code of Conduct](CODE_OF_CONDUCT.md) | [Security Policy](SECURITY.md)
