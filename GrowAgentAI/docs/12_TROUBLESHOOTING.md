# Troubleshooting Guide

Common issues and solutions.

## Installation Issues

### Docker won't start

**Error:** `Cannot connect to Docker daemon`

**Solutions:**
```bash
# On Windows/Mac: Start Docker Desktop
open -a Docker

# On Linux: Start Docker service
sudo systemctl start docker

# Verify Docker is running
docker --version
docker ps
```

### Port already in use

**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Option 1: Change port in .env
PORT=3001
docker compose up -d

# Option 2: Kill existing process
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# Then restart
docker compose up -d
```

### Not enough disk space

**Error:** `No space left on device`

**Solutions:**
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old images
docker rmi $(docker images -q)

# Remove volumes
docker volume prune

# Free up space and retry
docker compose up -d
```

### Container exits immediately

**Check logs:**
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs database
```

**Common causes:**
1. Database not ready - wait 30 seconds
2. Environment variables missing - check `.env`
3. Port conflicts - see above
4. Memory issues - increase Docker resources

## Database Issues

### Database connection failed

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
```bash
# 1. Check database is running
docker compose ps database

# 2. Wait for database to initialize
sleep 30

# 3. Restart database
docker compose restart database

# 4. Check logs
docker compose logs database

# 5. Run migrations
docker compose exec backend npm run migrate
```

### "FATAL: role 'user' does not exist"

**Error:** Authentication failed

**Solutions:**
```bash
# 1. Check .env has correct credentials
grep DB_USER .env
grep DB_PASSWORD .env

# 2. Recreate database
docker compose down
docker compose up -d database
sleep 30
docker compose exec backend npm run migrate
```

### "Column does not exist"

**Error:** `column "field" does not exist`

**Solutions:**
```bash
# 1. Run migrations
docker compose exec backend npm run migrate

# 2. Reset database (development only!)
docker compose exec database dropdb -U postgres growagentai
docker compose exec backend npm run migrate
```

### Very slow database queries

**Performance tuning:**
```bash
# 1. Check indexes
docker compose exec database psql -U postgres -d growagentai -c "\d+ tablename"

# 2. Analyze queries
docker compose exec backend npm run analyze:queries

# 3. Enable query logging
export LOG_LEVEL=debug
docker compose up -d backend

# 4. Consider archiving old data
docker compose exec backend npm run archive-sessions
```

## API/Backend Issues

### Backend won't start

**Error:** `Cannot find module`

**Solutions:**
```bash
# 1. Reinstall dependencies
docker compose exec backend npm install

# 2. Clear node_modules
docker compose exec backend rm -rf node_modules
docker compose exec backend npm install

# 3. Rebuild containers
docker compose down
docker compose up -d --build backend
```

### API returns 500 errors

**Solutions:**
```bash
# 1. Check backend logs
docker compose logs -f backend

# 2. Check environment variables
docker compose exec backend env | grep -E "ANTHROPIC|DATABASE"

# 3. Test API health
curl http://localhost:3001/health

# 4. Check file permissions
docker compose exec backend ls -la /app
```

### Claude API authentication fails

**Error:** `401 Unauthorized`

**Solutions:**
```bash
# 1. Verify API key
echo $ANTHROPIC_API_KEY

# 2. Check in .env file
grep ANTHROPIC_API_KEY .env

# 3. Regenerate key at https://console.anthropic.com/
# Then update .env and restart:
docker compose restart backend
```

### "Rate limit exceeded"

**Error:** Too many API requests

**Solutions:**
```bash
# 1. Wait - rate limits reset hourly
sleep 3600

# 2. Check usage
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/usage

# 3. Add delays in code
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
await delay(1000); // Wait 1 second between requests

# 4. Upgrade to higher tier
# Go to console.anthropic.com for paid plans
```

## Frontend Issues

### Frontend blank page

**Solutions:**
```bash
# 1. Check frontend is running
docker compose ps frontend

# 2. View logs
docker compose logs -f frontend

# 3. Check browser console (F12)
# Look for JavaScript errors

# 4. Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# 5. Clear cache
docker compose restart frontend
```

### API connection errors

**Error:** `Failed to fetch from http://localhost:3001`

**Solutions:**
```bash
# 1. Check API is running
curl http://localhost:3001/health

# 2. Check CORS configuration
# In backend, verify origin is whitelisted

# 3. Check browser network tab (F12)
# Look for 401, 403, or connection errors

# 4. Verify .env has correct API URL
grep VITE_API_URL frontend/web/.env

# 5. Restart both services
docker compose restart backend frontend
```

### Styling looks broken

**Solutions:**
```bash
# 1. Clear TailwindCSS cache
docker compose exec frontend rm -rf node_modules/.vite

# 2. Rebuild frontend
docker compose restart frontend

# 3. Hard refresh browser
Ctrl+Shift+R

# 4. Check CSS generation
docker compose logs frontend | grep -i css
```

## Chat & Coaching Issues

### No response from Claude

**Solutions:**
```bash
# 1. Check API key and quota
docker compose logs backend | grep -i anthropic

# 2. Check message is being sent
# Browser F12 -> Network -> Look for POST to /sessions/*/messages

# 3. Check response streaming
# Response should start within 2-5 seconds

# 4. Review API limits
# Rate limiting? Size limit?
```

### Incomplete responses

**Solutions:**
```bash
# 1. Check API token limits
# Claude has max tokens per request (100K)

# 2. Check request body size
# Messages shouldn't exceed 10MB

# 3. Increase timeout in frontend
// In axios config: timeout: 30000 (30 seconds)

# 4. Check for network issues
# Slow connection? Try again
```

### Messages not saving to database

**Solutions:**
```bash
# 1. Check database connection
docker compose exec backend npm run test:db

# 2. View database logs
docker compose logs database

# 3. Check Prisma is working
docker compose exec backend npm run prisma:studio

# 4. Verify permissions
docker compose exec backend npm run validate:permissions
```

## Performance Issues

### Slow page load

**Solutions:**
```bash
# 1. Check network tab in browser (F12)
# Identify slow requests

# 2. Check backend response times
docker compose logs backend | grep "response time"

# 3. Clear browser cache
Ctrl+Shift+Delete

# 4. Check for large data transfers
# Limit list sizes with pagination

# 5. Enable compression
# Verify gzip is enabled in Nginx
```

### High CPU/Memory usage

**Solutions:**
```bash
# 1. Check resource usage
docker stats

# 2. Increase Docker resources
# Docker Desktop Settings -> Resources
# Increase CPU & Memory

# 3. Check for memory leaks
docker compose logs backend | grep -i "memory\|heap"

# 4. Optimize queries
# Add indexes to frequently queried fields
```

### Slow API responses

**Solutions:**
```bash
# 1. Profile endpoint
npm run profile:endpoint -- POST /sessions/:id/messages

# 2. Check database indexes
docker compose exec database psql -U postgres -d growagentai -c "\d+ messages"

# 3. Add missing indexes
docker compose exec backend npm run add:missing-indexes

# 4. Cache frequently accessed data
# Use Redis for caching
```

## Authentication Issues

### "Invalid token" error

**Error:** `401 Unauthorized`

**Solutions:**
```bash
# 1. Try logging in again
# Token may have expired

# 2. Clear localStorage
# Browser F12 -> Application -> Clear Storage

# 3. Check token in .env is correct
echo $JWT_SECRET

# 4. Verify token algorithm
# Ensure HS256 is used
```

### Can't login

**Error:** `Invalid credentials`

**Solutions:**
```bash
# 1. Check user exists in database
docker compose exec backend npm run test:user:exists -- demo@growagentai.com

# 2. Reset password
docker compose exec backend npm run reset:password -- demo@growagentai.com

# 3. Check password hash
# Passwords should be hashed with bcrypt

# 4. Try OAuth login (Google/GitHub)
```

## Email/Notification Issues

### Not receiving emails

**Error:** Emails not arriving

**Solutions:**
```bash
# 1. Check SMTP configuration
docker compose logs backend | grep -i "smtp\|mail"

# 2. Verify credentials in .env
grep SMTP .env

# 3. Check spam folder

# 4. Verify sender email is configured
grep SMTP_FROM .env

# 5. Test manually
docker compose exec backend npm run test:email -- test@example.com
```

## Logging & Debugging

### Enable debug logs

```bash
# 1. Set environment variable
export LOG_LEVEL=debug

# 2. Restart services
docker compose up -d

# 3. View logs
docker compose logs -f backend

# 4. Search for errors
docker compose logs backend | grep ERROR
```

### View detailed request logs

```bash
# Enable Morgan HTTP logger
export HTTP_LOG_FORMAT=combined

# Restart backend
docker compose restart backend

# View logs
docker compose logs backend
```

### Database query logs

```bash
# Enable Prisma query logging
export LOG_QUERIES=true

# Restart backend
docker compose restart backend

# View logs
docker compose logs backend | grep Query
```

## Getting More Help

1. **Search** [FAQ](11_FAQ.md)
2. **Check** [Full Documentation](00_START_HERE.md)
3. **Search GitHub** [Issues](https://github.com/[usuario]/growagentai/issues)
4. **Ask in** [GitHub Discussions](https://github.com/[usuario]/growagentai/discussions)
5. **Join** [Discord Community](https://discord.gg/growagentai)
6. **Report bug** on [GitHub](https://github.com/[usuario]/growagentai/issues/new)

---

[Back to Docs](00_START_HERE.md) | [FAQ](11_FAQ.md)
