# GrowAgentAI 🌱

[![GitHub License](https://img.shields.io/github/license/[usuario]/growagentai?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/[usuario]/growagentai?style=social)](https://github.com/[usuario]/growagentai)
[![GitHub Forks](https://img.shields.io/github/forks/[usuario]/growagentai?style=social)](https://github.com/[usuario]/growagentai)
[![Discord Community](https://img.shields.io/badge/chat-discord-7289da?style=flat-square)](https://discord.gg/growagentai)

**A conversational AI coaching platform with 7-stage GROW methodology goal tracking.**

[**Versión en Español**](docs/README_ES.md)

- 🎯 ICF (International Coach Federation) methodology
- 🌍 Bilingual: Spanish + English
- 📱 Multiplataform: Web, Windows, Mac, iOS, Android
- 🔒 GDPR + CCPA compliant
- 🤖 Powered by Claude AI
- 🎨 UX designed for clarity and engagement

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Node.js 18+, PostgreSQL 14+
- Anthropic API key (Claude)

### With Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/[usuario]/growagentai.git
cd growagentai

# Setup environment
cp .env.example .env

# Edit .env with your API keys and database credentials
# nano .env   (Linux/Mac)
# notepad .env (Windows)

# Start services
docker compose up -d

# Wait 30 seconds for database initialization
sleep 30

# Access application
# Web: http://localhost:3000
# API: http://localhost:3001
```

### Manual Installation

See [Installation Guide](docs/01_INSTALLATION.md) for step-by-step instructions without Docker.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [**Quickstart (60 seconds)**](docs/02_QUICK_START.md) | Get running in under a minute |
| [**Full Installation**](docs/01_INSTALLATION.md) | Detailed setup for all platforms |
| [**Architecture**](docs/03_ARCHITECTURE.md) | System design & components |
| [**API Reference**](docs/04_API_REFERENCE.md) | Backend endpoints & webhooks |
| [**Frontend Guide**](docs/05_FRONTEND.md) | UI components & design system |
| [**Database Schema**](docs/06_DATABASE.md) | Prisma models & relationships |
| [**Testing Guide**](docs/07_TESTING.md) | Unit, integration & E2E tests |
| [**Deployment**](docs/08_DEPLOYMENT.md) | Deploy to AWS, Azure, GCP, VPS |
| [**Security Hardening**](docs/09_SECURITY.md) | Security best practices |
| [**Compliance**](docs/10_COMPLIANCE.md) | GDPR, CCPA, data privacy |
| [**FAQ**](docs/11_FAQ.md) | Common questions answered |
| [**Troubleshooting**](docs/12_TROUBLESHOOTING.md) | Common issues & fixes |
| [**Roadmap**](docs/13_ROADMAP.md) | Future features & vision |

## ✨ Features

### Core Coaching Engine
- ✅ Conversational AI coaching powered by Claude
- ✅ 7-stage GROW methodology with visual indicators
- ✅ Goal setting & commitment tracking
- ✅ Progress dashboard with analytics
- ✅ Session history & notes
- ✅ Multi-language support (ES/EN)

### Knowledge Base
- 📚 **20 comprehensive coaching frameworks** (Spanish + English)
- 🎯 C.O.A.C.H. model (Ortiz & Webb)
- ❓ 400+ coaching questions (McPheat)
- 🏆 ICF best practices (Brooks & Vogt)
- 👔 Leadership questions (Posner)
- 🧠 Critical thinking prompts (Elder & Paul)
- 👨‍👩‍👧‍👦 Youth & family coaching guides
- 💼 Real-world case studies

### Platform Features
- 🌐 Web application (React 18)
- 💻 Desktop apps (Windows, Mac via Electron)
- 📱 Mobile apps (iOS, Android via React Native)
- 🔐 End-to-end encryption support
- 🌍 Multi-language (Spanish, English)
- ♿ WCAG 2.1 AA accessibility
- 🎨 Dark mode & light mode

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma (database-agnostic)
- **Databases:** PostgreSQL, Oracle, MySQL
- **AI:** Anthropic Claude API, OpenAI Embeddings
- **Auth:** JWT + OAuth 2.0
- **Cache:** Redis
- **Queue:** Bull

### Frontend
- **Web:** React 18 + Vite + TailwindCSS
- **Desktop:** Electron (Chromium-based)
- **Mobile:** React Native + Expo
- **UI Components:** Headless UI + Radix UI
- **State:** Redux + Redux Thunk
- **API Client:** React Query + Axios

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + DataDog
- **CDN:** CloudFront (optional)
- **Deployment:** Docker, Kubernetes-ready

## 📂 Project Structure

```
GrowAgentAI/
├── README.md                       # This file
├── QUICKSTART.md                   # 60-second start guide
├── ARCHITECTURE.md                 # System architecture
├── LICENSE                         # MIT License
├── CONTRIBUTING.md                 # Contributing guide
├── CODE_OF_CONDUCT.md              # Community guidelines
├── SECURITY.md                     # Security reporting
├── CHANGELOG.md                    # Version history
│
├── .github/
│  ├── workflows/
│  │  ├── ci.yml                   # Tests, lint, build
│  │  ├── security-scan.yml        # SAST, npm audit
│  │  └── docs.yml                 # Documentation build
│  ├── ISSUE_TEMPLATE/
│  │  ├── bug_report.md
│  │  ├── feature_request.md
│  │  └── security_report.md
│  └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                          # Complete documentation
│  ├── 00_START_HERE.md
│  ├── 01_INSTALLATION.md
│  ├── 02_QUICK_START.md
│  ├── 03_ARCHITECTURE.md
│  ├── 04_API_REFERENCE.md
│  ├── 05_FRONTEND.md
│  ├── 06_DATABASE.md
│  ├── 07_TESTING.md
│  ├── 08_DEPLOYMENT.md
│  ├── 09_SECURITY.md
│  ├── 10_COMPLIANCE.md
│  ├── 11_FAQ.md
│  ├── 12_TROUBLESHOOTING.md
│  └── 13_ROADMAP.md
│
├── legal/
│  ├── TERMS_OF_SERVICE.md
│  ├── PRIVACY_POLICY.md
│  ├── COOKIES_POLICY.md
│  └── COMPLIANCE.md
│
├── base_conocimientos/            # Coaching knowledge base
│  ├── es/                         # Spanish frameworks (10 files)
│  └── en/                         # English frameworks (10 files)
│
├── backend/
│  ├── SPECIFICATIONS.md           # Backend blueprint
│  ├── src/
│  │  ├── config/
│  │  ├── controllers/
│  │  ├── routes/
│  │  ├── services/
│  │  ├── middleware/
│  │  ├── utils/
│  │  └── server.ts
│  ├── prisma/
│  │  ├── schema.prisma.spec      # Database schema specification
│  │  └── migrations/
│  ├── tests/
│  ├── docker-compose.yml.template
│  └── package.json.template
│
├── frontend/
│  ├── SPECIFICATIONS.md           # Frontend blueprint
│  ├── DESIGN_SYSTEM.md
│  ├── web/
│  │  ├── src/
│  │  ├── components/
│  │  ├── pages/
│  │  └── package.json.template
│  ├── desktop/
│  │  └── electron-app/ (with package.json)
│  └── mobile/
│      └── react-native-app/
│
├── docker-compose.yml             # Local development
├── .env.example                   # Environment template
├── .gitignore
├── .dockerignore
└── ROADMAP.md                     # Long-term vision
```

## 🎓 Knowledge Base

GrowAgentAI includes a comprehensive **20-file coaching knowledge base** covering:

### Spanish (10 files)
- Marco de Agente Coach
- Banco de Preguntas (McPheat)
- Modelo C.O.A.C.H. (Ortiz & Webb)
- Preguntas ICF
- Preguntas de Liderazgo
- Preguntas Esenciales
- Y más...

### English (10 files)
- Coaching Agent Framework
- Question Bank (McPheat)
- C.O.A.C.H. Model (Ortiz & Webb)
- ICF Questions
- Leadership Questions
- Essential Questions
- And more...

**Access Knowledge Base:** [`base_conocimientos/`](base_conocimientos/)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to report bugs
- How to suggest features
- Development setup
- Code standards
- PR process

### Quick Contribution Flow
```bash
# 1. Fork & clone
git clone https://github.com/[usuario]/growagentai.git
cd growagentai

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes, test, commit
npm run test
npm run lint
git add .
git commit -m "feat(scope): description"

# 4. Push & create PR
git push origin feature/your-feature

# 5. Wait for review and merge!
```

## 🔐 Security

**Do NOT report security vulnerabilities in public issues.**

See [SECURITY.md](SECURITY.md) for:
- Responsible disclosure process
- How to report vulnerabilities
- Security guidelines
- Best practices

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

**You are free to:**
- Use commercially
- Modify the code
- Distribute copies
- Use privately

**You must:**
- Include the license & copyright notice
- Disclose source

## 🙋 Support & Community

- **Questions?** See [FAQ](docs/11_FAQ.md)
- **Issues?** Check [Troubleshooting](docs/12_TROUBLESHOOTING.md)
- **Discussions:** [GitHub Discussions](https://github.com/[usuario]/growagentai/discussions)
- **Discord:** [Join Community](https://discord.gg/growagentai)
- **Email:** support@growagentai.com (placeholder)

## 🛣️ Roadmap

See [ROADMAP.md](docs/13_ROADMAP.md) for:
- Q1 2026 features
- Q2-Q4 2026 vision
- Contribution opportunities
- Community voting

## 📊 Stats

- **20+ coaching frameworks** in 2 languages
- **400+ coaching questions** curated
- **7-stage GROW methodology** visual tracking
- **3 platform targets** (Web, Desktop, Mobile)
- **GDPR + CCPA ready**

## 👥 Credits

Built with ❤️ by the coaching community for personal & professional growth.

### Frameworks & Methodologies
- ICF (International Coach Federation)
- Ortiz & Webb (C.O.A.C.H. Model)
- Sean McPheat (400 Questions)
- James Posner (Leadership)
- Richard Paul & Linda Elder (Critical Thinking)

## ⭐ Support

If you find GrowAgentAI helpful, please:
- ⭐ Star this repository
- 📢 Share with others
- 💬 Join our Discord community
- 🐛 Report bugs
- 🎯 Suggest features

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Made with ❤️ for coaching and personal growth** | [License](LICENSE) | [Security](SECURITY.md) | [Contributing](CONTRIBUTING.md)
