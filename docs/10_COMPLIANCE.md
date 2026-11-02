# Compliance & Legal Guide

GDPR, CCPA, and data privacy compliance.

## Overview

GrowAgentAI handles personal coaching data. Compliance is mandatory.

## GDPR Compliance (EU)

### Data Processing Agreement

```markdown
# Data Processing Agreement (DPA)

## Parties
- Data Controller: [Usuario/Empresa]
- Data Processor: GrowAgentAI

## Data Categories
- Personal data: name, email, IP address
- Special data: coaching notes, goals, personal reflections

## Processing Activities
1. User authentication
2. Goal tracking
3. Session management
4. Analytics

## Data Retention
- Active users: While account exists
- Deleted users: Deleted within 30 days
- Backups: 90-day retention

## Your Rights
- Access data: Request via /users/export
- Correct data: Edit profile
- Delete data: Request deletion
- Portability: Download as JSON
```

### User Rights Implementation

```typescript
// 1. Right to Access (Data Export)
app.get('/api/users/export', authRequired, async (req, res) => {
  const user = await getUserWithAllData(req.user.id);
  const data = {
    personal: user,
    goals: user.goals,
    sessions: user.sessions,
    messages: user.sessions.flatMap(s => s.messages),
  };
  res.download(`export-${user.id}.json`, data);
});

// 2. Right to Rectification
app.put('/api/users/profile', async (req, res) => {
  const user = await updateUser(req.user.id, req.body);
  res.json(user);
});

// 3. Right to Erasure (Right to be Forgotten)
app.delete('/api/users/:id', async (req, res) => {
  // Soft delete option
  await softDeleteUser(req.params.id);
  // Or hard delete
  await hardDeleteUser(req.params.id);
  res.json({ deleted: true, date: new Date() });
});

// 4. Right to Data Portability
app.get('/api/users/data-portability', authRequired, async (req, res) => {
  const data = await getUserData(req.user.id);
  res.json(data); // Machine-readable format
});

// 5. Right to Restrict Processing
app.post('/api/users/restrict-processing', async (req, res) => {
  await restrictUserProcessing(req.user.id);
  res.json({ restricted: true });
});
```

### Consent Management

```typescript
// Track explicit consent
interface UserConsent {
  id: string;
  user_id: string;
  consent_type: 'marketing' | 'analytics' | 'cookies';
  given: boolean;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
}

// Before any processing
const consent = await getConsent(userId, 'analytics');
if (!consent?.given) {
  // Don't process
  return;
}

// Cookie banner
app.get('/api/consent/banner', (req, res) => {
  res.json({
    required: ['essential'], // Must have
    optional: ['analytics', 'marketing'],
    privacyPolicyUrl: '/legal/privacy-policy',
    cookiePolicyUrl: '/legal/cookies-policy',
  });
});
```

### Legitimate Interests Assessment

```markdown
# LIA: Analytics Processing

## Purpose
Improve user experience and identify bugs

## Necessity
Required to maintain and improve platform

## Balancing Test
- Benefits to users outweigh privacy intrusion
- Users expect usage analytics
- Processing is minimized (no personal conversation content)

## Safeguards
- Anonymized data where possible
- Limited retention
- Access restricted
- Regular audits
```

## CCPA Compliance (California)

### Consumer Rights (4 main rights)

```typescript
// 1. Right to Know
app.get('/api/ccpa/what-we-collect', (req, res) => {
  res.json({
    categories: [
      'Identifiers',
      'Personal information',
      'Commercial information',
      'Usage data',
    ],
    sources: ['User input', 'Cookies', 'Server logs'],
  });
});

// 2. Right to Delete
app.post('/api/ccpa/delete', authRequired, async (req, res) => {
  await deleteUserPersonalInfo(req.user.id);
  res.json({ deleted: true });
});

// 3. Right to Opt-Out of Sale
app.post('/api/ccpa/opt-out-sale', async (req, res) => {
  await optOutOfSale(req.user.id);
  res.json({ opted_out: true });
});

// 4. Right to Non-Discrimination
// Ensure no discrimination for exercising rights
```

### CCPA Privacy Notice

```markdown
# Privacy Notice (CCPA)

## Information We Collect
- **Identifiers:** name, email, IP address, cookies
- **Personal info:** phone, address (optional)
- **Commercial info:** purchase history
- **Usage data:** pages visited, time spent

## Sources of Information
- Directly from users (forms, accounts)
- Automatically (cookies, analytics)
- Third parties: payment processors

## How We Use Data
- Provide coaching services
- Improve platform
- Communicate with users
- Legal compliance

## Data Retention
- Active users: Throughout service
- Deleted users: 30-90 days
- Backups: 90 days

## Your Rights
1. Know what we collect
2. Delete your data
3. Opt-out of sales
4. No discrimination for exercising rights

## Contact
privacy@growagentai.com
```

## Data Privacy by Design

### Privacy Principles

1. **Data Minimization**
   ```typescript
   // Only collect what's needed
   // ✅ Collect: name, email, goals
   // ❌ Avoid: browser history, location unless needed
   ```

2. **Storage Limitation**
   ```typescript
   // Delete data after retention period
   const RETENTION_PERIOD = 365 * 24 * 60 * 60 * 1000; // 1 year
   
   const oldSessions = await prisma.session.deleteMany({
     where: {
       created_at: {
         lt: new Date(Date.now() - RETENTION_PERIOD),
       },
     },
   });
   ```

3. **Integrity & Confidentiality**
   ```typescript
   // Encrypt data
   const encrypted = await encryptData(sensitiveData);
   
   // Verify integrity (checksums)
   const checksum = crypto.createHash('sha256')
     .update(data).digest('hex');
   ```

4. **Accountability**
   ```typescript
   // Document all processing
   await auditLog.create({
     user_id: userId,
     action: 'data_accessed',
     purpose: 'coaching_session',
     timestamp: new Date(),
   });
   ```

## Cookies & Tracking

### Cookie Policy

```typescript
// Types of cookies we use
const COOKIES = {
  essential: {
    session_id: { purpose: 'Authentication', retention: 'Session' },
  },
  analytics: {
    _ga: { purpose: 'Google Analytics', retention: '2 years' },
  },
  marketing: {
    _fbp: { purpose: 'Facebook Pixel', retention: '3 months' },
  },
};

// Cookie banner implementation
const showCookieBanner = () => {
  if (!getCookieConsent()) {
    return <CookieBanner onAccept={setConsent} />;
  }
};
```

## Data Transfer & Adequacy

### SCHREMS II Compliance

For data transfers outside EU:
```typescript
// Use Standard Contractual Clauses (SCCs)
const transferAgreement = {
  jurisdiction: 'EU',
  transferee: 'US (with SCCs)',
  mechanismId: 'standard-contractual-clauses-v2010',
  supplementaryMeasures: [
    'Encryption of personal data',
    'Minimized data access',
    'Sub-processor agreements',
  ],
};
```

## Regular Audits & Impact Assessments

### Data Protection Impact Assessment (DPIA)

```markdown
# DPIA Template

## Processing Activity
Coaching AI conversations with Claude API

## Necessity & Proportionality
- Necessary for core service
- Proportional to coaching goals

## Risk Assessment
- **Risk:** Claude API has access to conversation data
- **Mitigation:** Standard Contract Clauses, end-to-end encryption option

## Measures
- Data minimization
- Encryption
- Access controls
- Regular audits

## Conclusion
Processing is compliant with appropriate safeguards
```

### Annual Compliance Review

```bash
#!/bin/bash
# Annual checklist

echo "=== GDPR Compliance Check ==="
echo "- User rights functionality working? ✓"
echo "- Data retention policies enforced? ✓"
echo "- Consent records up-to-date? ✓"

echo "\n=== CCPA Compliance Check ==="
echo "- Consumer rights implemented? ✓"
echo "- Opt-out mechanisms working? ✓"
echo "- Privacy notice current? ✓"

echo "\n=== Data Security ==="
echo "- Encryption enabled? ✓"
echo "- Access controls tested? ✓"
echo "- Audit logs reviewed? ✓"
```

## Privacy Documentation

### Documentation Checklist

- [ ] Privacy Policy (updated annually)
- [ ] Cookie Policy
- [ ] Data Processing Agreement (DPA)
- [ ] Data Retention Schedule
- [ ] Vendor Data Processing Agreements
- [ ] Data Breach Response Plan
- [ ] DPIA (if high risk)
- [ ] Records of Processing Activities (ROPA)

## Templates Included

- [PRIVACY_POLICY.md](../legal/PRIVACY_POLICY.md)
- [COOKIES_POLICY.md](../legal/COOKIES_POLICY.md)
- [TERMS_OF_SERVICE.md](../legal/TERMS_OF_SERVICE.md)

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB375)
- [Data Protection Authority](https://edpb.ec.europa.eu/)
- [IAPP Resources](https://iapp.org/)

## Contact & Breach Notification

### Data Breach Response

```typescript
// Step 1: Identify breach
async function identifyBreach(breachData: BreachData) {
  const severity = assessSeverity(breachData);
  const affectedUsers = getAffectedUsers(breachData);
  return { severity, affectedUsers };
}

// Step 2: Notify supervisory authority (72 hours)
async function notifySupervisory() {
  const notification = {
    authority: 'data-protection-authority@eu',
    breachDescription: 'See impact assessment',
    affectedPersonsCount: 1000,
    timelineOfEvents: '...',
  };
  await email.send(notification);
}

// Step 3: Notify affected users
async function notifyUsers(users: User[]) {
  for (const user of users) {
    await email.send({
      to: user.email,
      subject: 'Important: Security Incident Notification',
      body: 'We have discovered a security incident...',
    });
  }
}
```

## Legal Contact

- **Privacy Officer:** privacy@growagentai.com (placeholder)
- **Legal Contact:** legal@growagentai.com (placeholder)
- **Data Protection Authority:** See PRIVACY_POLICY.md

---

[Back to Docs](00_START_HERE.md) | [Security](09_SECURITY.md)
