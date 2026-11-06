# GrowAgentAI - Quick Start (60 seconds)

Get GrowAgentAI running in under a minute.

## Prerequisites Check

```bash
docker --version       # Must show v20.10+
docker compose version # Must show v2.0+
```

If missing, [install Docker](https://docs.docker.com/get-docker/).

## Start (3 commands)

```bash
# 1. Clone
git clone https://github.com/[usuario]/growagentai.git
cd growagentai

# 2. Setup
cp .env.example .env
nano .env  # Add your Anthropic API key to ANTHROPIC_API_KEY

# 3. Run
docker compose up -d
```

## Access (30 seconds)

Wait for initialization:
```bash
# Check if services are ready
docker compose logs -f

# Ready when you see:
# [+] Running 5/5
# web-1  | Server running on http://localhost:3000
```

Open browser: **http://localhost:3000**

Login with demo credentials (if enabled):
- Email: demo@growagentai.com
- Password: demo123456

## Next Steps

- [Full Installation Guide](docs/01_INSTALLATION.md)
- [Architecture Overview](docs/03_ARCHITECTURE.md)
- [API Reference](docs/04_API_REFERENCE.md)

## Troubleshooting

**Port already in use?**
```bash
# Change in .env
PORT=3001
docker compose up -d
```

**Database not connecting?**
```bash
# Check logs
docker compose logs database
```

**More help?** See [Troubleshooting](docs/12_TROUBLESHOOTING.md)

---

[Back to README](README.md) | [Full Docs](docs/)
