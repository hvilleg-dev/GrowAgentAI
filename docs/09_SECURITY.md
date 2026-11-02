# Security Hardening Guide

Security best practices and hardening checklist.

## Security Overview

GrowAgentAI handles sensitive coaching conversations and personal goal data. Security is critical.

## Transport Security

### TLS/SSL Configuration

```nginx
# Nginx config: Full TLS security
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS header
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Certificate Management

```bash
# Use Let's Encrypt for free SSL
certbot certonly --webroot -w /var/www/html -d growagentai.com

# Auto-renewal (check monthly)
certbot renew --dry-run
```

## Authentication & Authorization

### JWT Security

```typescript
// backend/src/auth/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Must be 32+ chars
const JWT_EXPIRY = '1h';

export function generateToken(userId: string) {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
```

**Best Practices:**
- Store JWT_SECRET in environment variables (not in code)
- Use strong algorithms (HS256, RS256)
- Set short expiration times (1 hour)
- Implement refresh tokens (7 days)
- Validate on every request

### Password Security

```typescript
// backend/src/auth/password.ts
import bcrypt from 'bcrypt';

// Hash password before storage
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12); // 12 rounds
}

// Verify password during login
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
```

**Requirements:**
- Minimum 12 characters
- Mix: uppercase, lowercase, numbers, symbols
- Hash with bcrypt (12+ rounds)
- Never log passwords

### OAuth 2.0 Integration

```typescript
// Support OAuth for easier login (Google, GitHub)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Create/update user
}));
```

## Data Encryption

### At-Rest Encryption

```bash
# PostgreSQL: Enable encryption
# Database-level with pgcrypto extension

CREATE EXTENSION pgcrypto;

-- Encrypt sensitive columns
ALTER TABLE users ADD COLUMN bio_encrypted bytea;

-- Encrypt when writing
INSERT INTO users (bio_encrypted) 
  VALUES (pgp_sym_encrypt('sensitive data', 'password'));

-- Decrypt when reading
SELECT pgp_sym_decrypt(bio_encrypted, 'password')::text FROM users;
```

### In-Transit Encryption

- HTTPS/TLS for all requests (no HTTP)
- Secure WebSocket (WSS) for chat
- Encrypted headers (no sensitive info in URLs)

### Sensitive Field Encryption

```typescript
// Encrypt before storing
const encryptedGoal = await encryptData(goal.description);
await prisma.goal.update({
  where: { id: goalId },
  data: { description: encryptedGoal },
});
```

## API Security

### Input Validation

```typescript
// Validate all inputs
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  goal_id: z.string().uuid().optional(),
});

app.post('/goals', async (req, res) => {
  try {
    const data = createGoalSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

### SQL Injection Prevention

```typescript
// Use Prisma ORM (automatic prevention)
// Never use raw SQL
// ✅ Good:
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// ❌ Avoid:
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
});

app.post('/auth/login', authLimiter, ...);
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
// Sets headers:
// - Content-Security-Policy
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection
```

## Database Security

### Connection Security

```env
# .env - Never commit!
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require
```

### Access Control

```sql
-- Limit user privileges
CREATE ROLE app_user;
GRANT CONNECT ON DATABASE growagentai TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

### Backup Encryption

```bash
# Encrypt database backups
pg_dump growagentai | gpg --symmetric > backup.sql.gpg

# Restore
gpg backup.sql.gpg | psql growagentai
```

## Application Security

### Dependency Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# GitHub: Enable Dependabot for auto PRs
```

### Secrets Management

```bash
# Never commit secrets
# Use environment variables or secret managers

# Option 1: Environment variables
export ANTHROPIC_API_KEY="sk-ant-xxx"

# Option 2: AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id growagentai

# Option 3: HashiCorp Vault
vault kv get secret/growagentai
```

### Logging Best Practices

```typescript
// Log important events
logger.info('User login', { user_id: userId, timestamp: new Date() });

// Never log sensitive data
logger.debug('Goal created', { 
  goal_id: goal.id, 
  // ❌ Never: password, api_keys, sensitive_data
});

// Structured logging for analysis
logger.error('Database error', {
  error: err.message,
  trace_id: req.id,
  severity: 'high',
});
```

## User Data Protection

### GDPR Compliance

```typescript
// User data export
app.get('/users/export', async (req, res) => {
  const user = await getUserWithAllData(req.user.id);
  res.json(user);
});

// User deletion
app.delete('/users/:id', async (req, res) => {
  // Hard delete user and related data
  await deleteUserCompletely(req.params.id);
  res.json({ deleted: true });
});
```

### Data Retention

```typescript
// Archive old sessions after 1 year
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
await prisma.session.updateMany({
  where: { created_at: { lt: oneYearAgo } },
  data: { archived: true },
});
```

## Monitoring & Alerting

### Sentry Error Tracking

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Alerts on errors
```

### Security Audit Logging

```typescript
// Log all sensitive operations
await auditLog.create({
  user_id: userId,
  action: 'goal_deleted',
  resource: 'goal',
  resource_id: goalId,
  timestamp: new Date(),
  ip_address: req.ip,
});
```

## Security Checklist

- [ ] TLS 1.3+ enabled
- [ ] HSTS headers set
- [ ] JWT secrets strong (32+ chars)
- [ ] Passwords hashed with bcrypt
- [ ] SQL injection prevented (ORM)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers (Helmet)
- [ ] Input validation on all endpoints
- [ ] Dependencies up-to-date
- [ ] No secrets in code/logs
- [ ] Database encryption enabled
- [ ] Backups encrypted
- [ ] Error messages don't leak info
- [ ] Monitoring & alerts set up
- [ ] GDPR/CCPA compliant
- [ ] Audit logging enabled
- [ ] Access control enforced

## Incident Response

### If Compromised

1. **Immediate:**
   - Revoke all API keys
   - Reset admin passwords
   - Enable 2FA

2. **Short-term:**
   - Review audit logs
   - Identify affected data
   - Notify users

3. **Long-term:**
   - Security audit
   - Update procedures
   - Implement fixes

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Advisories](https://www.npmjs.com/advisories)

---

[Back to Docs](00_START_HERE.md) | [Compliance](10_COMPLIANCE.md)
