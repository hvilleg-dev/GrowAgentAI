# Frequently Asked Questions (FAQ)

## Getting Started

### What is GrowAgentAI?
GrowAgentAI is an open-source AI coaching platform using the 7-stage GROW methodology. It provides conversational coaching powered by Claude AI with goal tracking and progress analytics.

### How do I get started?
1. [Install GrowAgentAI](01_INSTALLATION.md) (10 minutes)
2. Create an account
3. Set a goal
4. Start a coaching session
5. Track your progress

**Fastest way:** [60-second Quick Start](02_QUICK_START.md)

### What are the system requirements?
- **Development:** Docker + 4GB RAM
- **Production:** PostgreSQL/Oracle + Node.js 18+
- **Client:** Modern web browser or Electron desktop app

### Is it really free?
Yes! GrowAgentAI is open-source under MIT license. You can:
- Run it locally
- Deploy it yourself
- Modify the code
- Use it commercially

The only cost is your hosting/infrastructure.

## Features & Functionality

### What is the GROW methodology?
GROW is a coaching framework with 4 stages:
- **G**oal - Define what you want
- **R**eality - Assess current situation
- **O**ptions - Explore possible solutions
- **W**ay Forward - Commit to action

GrowAgentAI guides you through all 7 substages with AI coaching.

### Can I use GrowAgentAI offline?
The desktop and mobile apps support offline-first mode. You can:
- Write messages offline
- They sync when connection returns
- Web version requires online connection

### Does it support multiple languages?
Yes! Both Spanish and English are fully supported:
- 10 coaching frameworks in Spanish
- 10 coaching frameworks in English
- Toggle in settings

### Can I export my data?
Yes! You can:
1. Export all personal data as JSON
2. Download session transcripts
3. Export goals and progress reports
4. Request GDPR data portability anytime

See [Compliance Guide](10_COMPLIANCE.md) for details.

## Technical Questions

### What database should I use?
**For development:** PostgreSQL (default, free)
**For production:** 
- PostgreSQL (recommended, scalable)
- Oracle (enterprise)
- MySQL (supported)

All are supported equally through Prisma ORM.

### Can I use the Oracle free tier?
Yes! GrowAgentAI works perfectly with Oracle Cloud's always-free tier:
- 1 database (20GB storage)
- 2 compute VMs
- Cost: $0/month

See [Deployment Guide](08_DEPLOYMENT.md) for setup.

### How do I backup my data?
Automated daily backups included. Manual backup:

```bash
# PostgreSQL
pg_dump growagentai > backup.sql

# Docker
docker compose exec database pg_dump -U user growagentai > backup.sql
```

### Can I deploy to [cloud provider]?
Yes! We support:
- ✅ AWS (ECS, Elastic Beanstalk, EC2)
- ✅ Azure (ACI, App Service)
- ✅ Google Cloud (Cloud Run)
- ✅ DigitalOcean, Linode, Vultr (VPS)
- ✅ Self-hosted (any Linux/Docker)

See [Deployment Guide](08_DEPLOYMENT.md).

### What's the cost to run GrowAgentAI?
**Hosting:**
- Free tier: AWS free tier, GCP free tier
- Small deployment: ~$5-10/month (VPS)
- Medium: ~$20-50/month
- Enterprise: Custom pricing

**API Costs:**
- Claude API: ~$0.003 per 1K tokens
- OpenAI Embeddings: $0.02 per 1M tokens

**Typical user cost:** $0.01-0.05 per month

## Security & Privacy

### Is my data secure?
Yes! We use:
- TLS/SSL encryption (HTTPS)
- JWT authentication
- bcrypt password hashing
- PostgreSQL encryption at rest
- Secure API design

See [Security Guide](09_SECURITY.md).

### What data do you collect?
We only collect what's necessary:
- Account info (name, email)
- Goals and coaching sessions
- Coaching notes and conversations
- Usage analytics (anonymized)

**We do NOT:**
- Sell your data
- Share with advertisers
- Access your account without permission
- Retain data after deletion (30 days max)

See [Privacy Policy](../legal/PRIVACY_POLICY.md).

### How do you handle GDPR/CCPA?
We're fully compliant:
- ✅ GDPR (EU data protection)
- ✅ CCPA (California privacy law)
- ✅ Right to access your data
- ✅ Right to delete
- ✅ Data portability
- ✅ Opt-out of analytics

See [Compliance Guide](10_COMPLIANCE.md).

## Performance & Scaling

### How many users can it handle?
GrowAgentAI scales from 1 user to millions:
- **1-1,000 users:** Single server ($5-20/month)
- **1,000-100K users:** Load balancer + 3+ servers
- **100K+ users:** Kubernetes + auto-scaling

See [Architecture Guide](03_ARCHITECTURE.md#scalability-plan).

### What's the AI response time?
Typical: **2-5 seconds** for Claude to generate a response
- Depends on message length
- Network latency
- Claude API load

Users see responses streaming in real-time.

### Can I use a different AI model?
The architecture is modular. You can:
- ✅ Keep Claude (recommended)
- ✅ Switch to OpenAI GPT-4
- ✅ Use Anthropic Claude via API
- ✅ Implement LLaMA locally
- Custom implementations

See [Backend Specifications](../backend/SPECIFICATIONS.md).

## Development & Contributing

### How do I contribute?
1. Read [Contributing Guide](../CONTRIBUTING.md)
2. Check [Issues](https://github.com/[usuario]/growagentai/issues)
3. Fork repository
4. Make changes
5. Submit PR with tests
6. Wait for review

Contribution guidelines:
- TypeScript for all code
- 80%+ test coverage
- Follow ESLint rules
- Atomic commits

### How long does development take?
Typical timelines:
- Simple bug fix: 30 min - 1 hour
- Feature: 4-8 hours
- Large feature: 1-2 weeks
- Full implementation: 3 months

See [Roadmap](13_ROADMAP.md).

### Can I fork and run my own version?
Absolutely! You can:
1. Fork the repo
2. Make changes
3. Deploy your version
4. Modify anything

You must:
- Keep the MIT license
- Give credit to original project
- Share improvements (optional but appreciated)

### Is there a API?
Yes! Complete REST API with endpoints for:
- Authentication
- Goals CRUD
- Sessions CRUD
- Message streaming
- Analytics
- Knowledge base search

See [API Reference](04_API_REFERENCE.md).

### Can I build a mobile app?
Yes! There are multiple ways:
1. **React Native** - Share code with web
2. **Flutter** - Cross-platform
3. **Native** - Swift/Kotlin for iOS/Android
4. **Web wrapper** - Use web version in app

See [Frontend Guide](05_FRONTEND.md).

## Troubleshooting

### Docker won't start
```bash
# Check Docker is running
docker --version

# Check port conflicts
lsof -i :3000

# Rebuild containers
docker compose down
docker compose up -d --build
```

See [Troubleshooting Guide](12_TROUBLESHOOTING.md).

### Database connection failed
1. Check database is running: `docker compose logs database`
2. Wait 30 seconds for initialization
3. Verify credentials in `.env`
4. Run migrations: `docker compose exec backend npm run migrate`

### Claude API returns errors
1. Check API key is valid
2. Monitor token usage
3. Check API status at console.anthropic.com
4. Rate limiting? Add delays

See [Troubleshooting Guide](12_TROUBLESHOOTING.md).

## Roadmap & Future

### What's coming next?
**Q1 2026:**
- Video coaching (Zoom integration)
- Advanced analytics dashboard
- Progress visualization

**Q2 2026:**
- Team coaching features
- Organizational dashboard
- Integration marketplace

See full [Roadmap](13_ROADMAP.md).

### Can I request features?
Yes! Open a [Feature Request](https://github.com/[usuario]/growagentai/issues/new?template=feature_request.md) on GitHub.

Top requests are prioritized!

## Support & Community

### Where can I get help?
1. **Documentation:** [Start Here](00_START_HERE.md)
2. **Troubleshooting:** [Common Issues](12_TROUBLESHOOTING.md)
3. **Discord:** [Join Community](https://discord.gg/growagentai)
4. **GitHub Issues:** [Report Bug](https://github.com/[usuario]/growagentai/issues)
5. **Email:** support@growagentai.com (placeholder)

### How do I report security issues?
**Important:** Do NOT use GitHub Issues for security!

See [Security Policy](../SECURITY.md) for:
- How to report vulnerabilities
- Email address
- Responsible disclosure

### Is there a company behind this?
GrowAgentAI is a community-driven open-source project. There's no company, just passionate contributors!

### How can I support the project?
- ⭐ Star on GitHub
- 🐛 Report bugs
- 💬 Join Discord
- 💻 Contribute code
- 📢 Spread the word
- 💰 Sponsor development (coming soon)

---

[Back to Docs](00_START_HERE.md) | [Troubleshooting](12_TROUBLESHOOTING.md)
