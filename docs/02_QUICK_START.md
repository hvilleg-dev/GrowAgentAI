# Quick Start - 60 Seconds

Get GrowAgentAI running in under a minute.

## 3 Commands

```bash
# 1. Clone
git clone https://github.com/[usuario]/growagentai.git && cd growagentai

# 2. Setup environment (add your Anthropic API key)
cp .env.example .env && nano .env

# 3. Run
docker compose up -d
```

## Check Status

```bash
# Wait for services to start (30 seconds)
docker compose ps

# Should show all services with status "running" or "up"
```

## Access Application

- **Web:** http://localhost:3000
- **API:** http://localhost:3001

**Login:**
- Email: demo@growagentai.com
- Password: demo123456

## Next?

✅ See [Installation](01_INSTALLATION.md) for detailed setup
✅ Read [Architecture](03_ARCHITECTURE.md) to understand the system
✅ Check [FAQ](11_FAQ.md) for common questions

## Issues?

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Troubleshoot
# See [Troubleshooting](12_TROUBLESHOOTING.md)
```

---

[Back to README](../README.md) | [Full Installation](01_INSTALLATION.md)
