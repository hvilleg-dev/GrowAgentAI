# Vercel Deployment Guide - GrowAgentAI v2.0.0

**Status:** Ready for Deployment  
**Frontend:** React 18 + Vite  
**Backend:** Node.js Express (separate deployment)

---

## Pre-Deployment Checklist

### Local Testing
```bash
# Install dependencies
cd frontend && pnpm install

# Run tests
npm run test                    # All tests should pass
npm run test:coverage         # Coverage report

# Build production
pnpm build:web                # Should complete without errors

# Preview production build
pnpm preview:web              # Test at http://localhost:5173
```

### Verification
- ✅ All 19 tests passing
- ✅ Build completes without errors
- ✅ No console warnings in production build
- ✅ Environment variables configured
- ✅ .env.production.local NOT committed

---

## Vercel Setup Steps

### 1. Connect GitHub Repository

```bash
# In Vercel Dashboard:
1. Click "Add New..." → "Project"
2. Import GitHub repository
3. Select "GrowAgentAI" repository
4. Authorize Vercel access to GitHub
```

### 2. Configure Project Settings

**Framework:** Vite  
**Build Command:** `cd frontend/packages/web && npm run build`  
**Output Directory:** `frontend/packages/web/dist`  
**Install Command:** `npm install -g pnpm && pnpm install`  

**Root Directory:** (keep empty)

### 3. Set Environment Variables

In Vercel Project Settings → Environment Variables:

```env
VITE_API_URL=https://api.growagentai.com
VITE_SENTRY_DSN=https://your-sentry-key@sentry.io/project-id
VITE_APP_NAME=GrowAgentAI
VITE_APP_VERSION=2.0.0
```

For **Preview deployments** (optional):
```env
VITE_API_URL=https://staging-api.growagentai.com
```

### 4. Deploy

**Option A: Auto-Deploy on Push**
- Vercel automatically deploys on every push to main
- No additional action needed

**Option B: Manual Deploy**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to staging
vercel --prod=false

# Deploy to production
vercel --prod
```

---

## Deployment Configuration Files

### vercel.json
Pre-configured deployment settings including:
- Build command pointing to Vite build
- Output directory for static files
- Environment variable mapping
- Rewrites for SPA routing
- Cache control headers

### .env.production.local.example
Example production environment variables. Copy and configure with actual values:
```bash
cp frontend/packages/web/.env.production.local.example frontend/packages/web/.env.production.local
# Edit with your actual API URLs and Sentry DSN
```

---

## Post-Deployment Verification

### 1. Check Deployment Status
```bash
vercel logs --follow
```

### 2. Verify Health
```bash
# Test deployed application
curl https://growagentai.vercel.app/
curl https://growagentai.vercel.app/health

# Check for errors in browser console
# Visit app at https://growagentai.vercel.app
```

### 3. Verify API Connectivity
```bash
# Login should work without errors
# Chat should connect to backend API
# Navigation should be smooth
```

### 4. Performance Monitoring
- Check Vercel Analytics dashboard
- Verify Core Web Vitals:
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s
  - Cumulative Layout Shift < 0.1

### 5. Monitor Errors
- Check Sentry dashboard for any errors
- Review Vercel deployment logs
- Monitor error rate and performance

---

## Domain Configuration

### Connect Custom Domain
1. In Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., `app.growagentai.com`)
3. Configure DNS records:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel.app
   ```
4. Wait for DNS propagation (5-30 minutes)
5. Vercel will auto-provision SSL certificate

---

## GitHub Integration

### Automatic Deployments
- ✅ Push to main → Production deployment
- ✅ Push to develop → Preview deployment
- ✅ Pull requests → Preview URLs

### Deployment Notifications
- GitHub shows deployment status
- Click "View Deployment" to see production
- Check Vercel dashboard for logs

---

## Monitoring & Troubleshooting

### Common Issues

**Build Fails**
```
Error: Cannot find module '@/...'
→ Solution: Verify path aliases in vite.config.ts
```

**API Connection Error**
```
Error: Cannot connect to VITE_API_URL
→ Solution: Verify environment variables are set
→ Check backend API is running and accessible
```

**Deployment Takes Too Long**
```
Deployment > 10 minutes
→ Solution: Check Vercel build logs for bottlenecks
→ Consider caching node_modules
```

### Viewing Logs
```bash
# Real-time logs
vercel logs https://growagentai.vercel.app --follow

# Build logs
vercel logs https://growagentai.vercel.app/build
```

---

## Rollback Procedure

If deployment has issues:

**Option 1: Vercel Dashboard**
1. Go to Deployments tab
2. Find previous working deployment
3. Click menu → "Promote to Production"

**Option 2: Git**
```bash
git revert <problematic-commit>
git push origin main
# Vercel auto-deploys new commit
```

---

## Performance Optimization

### Already Configured
- ✅ Vite code splitting by route
- ✅ CSS minification (Tailwind)
- ✅ Tree-shaking unused code
- ✅ Asset optimization
- ✅ Gzip compression by Vercel

### Lighthouse Targets
- ✅ Performance: 90+
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+
- ✅ SEO: 100

---

## Cost Estimation

**Vercel Free Tier includes:**
- Unlimited deployments
- 100 GB bandwidth
- 0.5 GB serverless function memory
- Custom domains

**For GrowAgentAI v2.0:**
- Estimated traffic: < 10GB/month
- Serverless functions: None (static SPA)
- Cost: **FREE** on Vercel

---

## Next Steps After Deployment

1. ✅ Monitor analytics and performance
2. ✅ Set up error tracking (Sentry)
3. ✅ Enable GitHub auto-deploys
4. ✅ Configure custom domain
5. ✅ Setup environment-specific builds
6. ✅ Implement CI/CD for backend deployment

---

## Support & Troubleshooting

- **Vercel Docs:** https://vercel.com/docs
- **Build Errors:** Check `vercel logs`
- **Performance:** Use Lighthouse CI
- **Custom Domain Issues:** Check DNS settings

---

**Ready to deploy!** Once verified locally, push to GitHub and Vercel will auto-deploy.
