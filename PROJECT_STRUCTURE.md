# GrowAgentAI Project Structure & Git Configuration

**Centralización completada:** 2026-11-06

## Directorio Principal
```
D:\2026\Markdown\GrowAgentAI/
├── backend/                          # Backend Node.js + Express
├── .github/                          # GitHub Actions, templates
├── Dockerfile                        # Docker build configuration
├── docker-compose.yml                # Multi-service orchestration
├── DEPLOYMENT.md                     # Production deployment guide
├── RELEASE_NOTES_V2.0.0.md           # Version 2.0.0 changelog
├── ARCHITECTURE.md                   # System architecture
├── PROJECT_STRUCTURE.md              # Este archivo
├── .gitignore                        # Git ignore rules
├── .dockerignore                     # Docker build ignore
└── [Otros archivos documentación]
```

## Backend Structure
```
backend/
├── src/                              # Source TypeScript code
│   ├── app.ts                        # Express app entry point
│   ├── config/                       # Configuration
│   ├── constants/                    # Constants (coaching framework, etc)
│   ├── controllers/                  # Request handlers
│   ├── database/                     # TypeORM setup & entities
│   │   ├── db.ts                     # Database connection
│   │   ├── entities/                 # 9 data models
│   │   └── migrations/               # Schema migrations
│   ├── errors/                       # Custom error classes
│   ├── middleware/                   # Express middleware
│   ├── routes/                       # API route definitions
│   ├── services/                     # Business logic
│   │   ├── ProviderRouter.ts         # LLM routing engine
│   │   ├── CrisisDetector.ts         # Crisis detection system
│   │   └── providers/                # Provider implementations
│   ├── types/                        # TypeScript type definitions
│   └── utils/                        # Helpers (logger, validators, crypto)
├── tests/                            # Test suite (54 tests)
│   ├── unit/
│   │   ├── basic.test.js             # Smoke tests (6)
│   │   └── services.test.js          # Services tests (24)
│   └── integration/
│       ├── api.test.js               # API connectivity (3)
│       └── endpoints.test.js         # Endpoint tests (20)
├── jest.config.js                    # Jest test configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.dev.json                 # Dev TypeScript config
├── tsconfig.test.json                # Test TypeScript config
└── README.md                         # Backend setup instructions
```

## Files NOT Committed to GitHub (Git Ignored)

### Environment & Secrets
```
.env                          # Runtime environment variables (DO NOT COMMIT)
.env.local                    # Local overrides (DO NOT COMMIT)
.env.*.local                  # Environment-specific (DO NOT COMMIT)
.env.production.local         # Production secrets (DO NOT COMMIT)
```

**Contents (Example):**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/growagentai
REDIS_URL=redis://localhost:6379
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NODE_ENV=development
PORT=3000
```

### Dependencies
```
backend/node_modules/        # npm packages (use `npm install`)
package-lock.json            # Dependency lock file (if excluded)
yarn.lock                     # Yarn lock file (if excluded)
pnpm-lock.yaml               # pnpm lock file (if excluded)
```

### Build & Compiled Output
```
backend/dist/                # Compiled JavaScript (generated)
backend/build/               # Alternative build output
backend/out/                 # Build artifacts
.next/                       # Next.js builds
.nuxt/                       # Nuxt builds
```

### Testing & Coverage
```
backend/coverage/            # Jest coverage reports (generated)
.nyc_output/                 # Istanbul coverage
*.lcov                       # Coverage files
```

### IDE & Editor
```
.vscode/                     # VS Code settings (user-specific)
.idea/                       # JetBrains IDE settings
*.swp, *.swo, *~            # Vim/Emacs temp files
.DS_Store                    # macOS files
Thumbs.db                    # Windows thumbnails
.project, .classpath         # Eclipse files
.settings/                   # IDE settings
*.sublime-workspace          # Sublime editor
```

### Local Development
```
logs/                        # Application logs
*.log                        # Log files
tmp/, temp/                  # Temporary files
*.tmp, *.bak                 # Backup files
.pgdata/                     # Local PostgreSQL data
dump.rdb                     # Redis dump file
```

### Database & Data
```
*.db, *.sqlite, *.sqlite3   # SQLite databases
.prisma/                     # Prisma artifacts
prisma/migrations/           # Migration history
```

### Docker
```
docker-compose.override.yml  # Local overrides (user-specific)
.docker/                     # Docker context files
```

### Private Documentation
```
BITACORA_PROYECTO.md         # Project internal log (NOT tracked)
PLAYBOOK_REPLICABLE.md       # Internal playbook (NOT tracked)
.claude/                     # Claude Code settings (local)
.internal/                   # Internal documentation
```

### OS Specific
```
._*                          # macOS metadata
.Spotlight-V100              # macOS search
.Trashes                     # macOS trash
ehthumbs.db, desktop.ini     # Windows desktop database
```

### Generated & Cache
```
.eslintcache                 # ESLint cache
.stylelintcache              # Stylelint cache
.parcel-cache                # Parcel bundler cache
generated/                   # Auto-generated code
types/                       # Generated types
```

### Secrets (CRITICAL - Never Commit!)
```
.secrets/                    # Secrets directory
secrets.json                 # Secrets file
*.pem, *.key, *.crt         # SSL certificates & keys
```

## What IS Committed to GitHub

### Code
✅ `backend/src/**/*.ts` - All source TypeScript  
✅ `backend/tests/**/*.js` - Test files  
✅ Package configuration files  
✅ TypeScript configuration  

### Configuration (Safe)
✅ `.github/workflows/*.yml` - CI/CD pipelines  
✅ `.github/ISSUE_TEMPLATE/*` - Issue templates  
✅ `.gitignore` - Git rules  
✅ `.dockerignore` - Docker build rules  
✅ `Dockerfile` - Docker image definition  
✅ `docker-compose.yml` - Service orchestration  

### Documentation
✅ `*.md` files (README, DEPLOYMENT, RELEASE_NOTES, etc.)  
✅ Architecture diagrams  
✅ API documentation  

## Environment Setup

### First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/growagentai/growagentai.git
cd growagentai

# 2. Install dependencies
cd backend
npm install

# 3. Create .env file (REQUIRED - not in git)
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/growagentai
REDIS_URL=redis://localhost:6379
CLAUDE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
EOF

# 4. Start services
cd ..
docker-compose up -d

# 5. Run tests
cd backend
npm run test
```

### Important Notes

1. **Never commit `.env`** - Git will prevent this if configured correctly
2. **API Keys are personal** - Each developer has their own in `.env`
3. **Passwords are local** - Database passwords in compose file are for LOCAL ONLY
4. **CI/CD uses secrets** - GitHub Actions has separate credential management
5. **Database is ephemeral** - Docker Compose doesn't persist data between teardowns

## Git Commands Reference

### Check what will be committed
```bash
git status                    # Shows untracked & modified files
git diff                      # Shows changes in tracked files
git diff --cached             # Shows staged changes
```

### Add files safely
```bash
git add backend/src/          # Add only source code
git add backend/tests/         # Add only test files
git add Dockerfile            # Add Docker configuration
git add DEPLOYMENT.md         # Add documentation
git status                    # Always verify before commit
```

### Verify nothing private is staged
```bash
git diff --cached             # Inspect all staged changes
grep -i "password\|api_key\|secret" $(git diff --cached --name-only)
```

### Push to GitHub
```bash
git push origin main          # Push to GitHub
```

## CI/CD Environment Variables

**GitHub Actions** (`.github/workflows/ci-cd.yml`) uses:
- `secrets.CLAUDE_API_KEY` - Stored in GitHub Secrets
- `secrets.OPENAI_API_KEY` - Stored in GitHub Secrets
- `secrets.DEPLOY_KEY` - SSH key for deployment
- `secrets.DEPLOY_HOST` - Deployment server hostname

These are NOT in `.env` - they're managed by GitHub.

## Troubleshooting

### "Added large files to Git"
```bash
# Check for accidentally tracked files
git ls-files --cached | grep -E "node_modules|dist|\.env|node_modules"

# Remove from git (keep local file)
git rm --cached filename
git commit -m "Remove filename from git"
```

### ".env is being tracked"
```bash
# Untrack it
git rm --cached .env
git commit -m "Remove .env from tracking"

# Add to .gitignore (already done)
grep ".env" .gitignore
```

### "node_modules checked in accidentally"
```bash
# Remove directory from git
git rm --cached -r backend/node_modules
git commit -m "Remove node_modules from tracking"

# Verify
git status  # Should show nothing for node_modules
```

## Summary

| Category | Status | Location |
|----------|--------|----------|
| **Source Code** | ✅ Tracked | `backend/src/` |
| **Tests** | ✅ Tracked | `backend/tests/` |
| **Configuration (safe)** | ✅ Tracked | `.github/`, `Dockerfile` |
| **Documentation** | ✅ Tracked | `*.md` files |
| **Environment Vars** | ❌ NOT Tracked | `.env` (local only) |
| **Dependencies** | ❌ NOT Tracked | `node_modules/` |
| **Build Output** | ❌ NOT Tracked | `dist/`, `coverage/` |
| **API Keys** | ❌ NOT Tracked | `.env` (never commit!) |
| **IDE Settings** | ❌ NOT Tracked | `.vscode/`, `.idea/` |
| **Local Config** | ❌ NOT Tracked | `docker-compose.override.yml` |

---

**Status:** All code centralized in `D:\2026\Markdown\GrowAgentAI`  
**Git Ready:** Yes, all .gitignore rules are in place  
**Next Step:** Push to GitHub with `git push origin main`
