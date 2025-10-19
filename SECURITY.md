# Security Policy

## API Security Measures

This document outlines the security measures implemented for the Goddess Oracle application.

### 1. Rate Limiting

**Implementation:**
- **IP-based rate limiting**: 20 requests per hour per IP address
- **Fingerprint-based rate limiting**: Optional client fingerprint tracking for additional protection
- **Progressive penalties**: 3 violations result in a 24-hour ban
- **Automatic reset**: Limits reset every hour

**Configuration:**
```typescript
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 20;
const MAX_VIOLATIONS = 3;
const BAN_DURATION = 86400000; // 24 hours
```

### 2. Input Validation & Sanitization

**Card Data Validation:**
- Type validation (string types only)
- Length limits:
  - Name: max 100 characters
  - Description: max 500 characters
  - Message: max 1000 characters
- Malicious pattern detection (XSS prevention):
  - Blocks `<script`, `javascript:`, `onerror=`, `onclick=`
- Array length validation (1 or 3 cards only)
- Mode consistency check (single = 1 card, three = 3 cards)

### 3. CORS & Origin Validation

**Allowed Origins:**
- Production: `https://goddess-oracle.vercel.app`
- Preview: Vercel preview URLs
- Development: `localhost:5173`, `localhost:4173`

**CSRF Protection:**
- Origin header verification for all POST requests
- Credentials support for allowed origins only
- Strict origin checking in production

### 4. Security Headers

The API returns the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### 5. Error Handling

**Client-facing errors:**
- Generic error messages only
- No stack traces or internal details exposed
- No API key or configuration information leaked

**Server-side logging:**
- Detailed error logs with timestamps
- Structured logging format
- Error categorization with `[API ERROR]` prefix

### 6. API Key Protection

**Environment Variables:**
- `GOOGLE_API_KEY`: Required for Google Generative AI access
- Never exposed to client
- Validated before each request
- Generic error returned if missing

### 7. Best Practices

**For Production Deployment:**

1. **Set Production URLs:**
   Update `ALLOWED_ORIGINS` in `api/generate-message.ts`:
   ```typescript
   const ALLOWED_ORIGINS = [
     'https://your-production-domain.com',
     // ... other allowed origins
   ];
   ```

2. **Environment Variables:**
   Ensure `GOOGLE_API_KEY` is set in Vercel environment variables

3. **Monitor Rate Limits:**
   Consider upgrading to Redis/Upstash for distributed rate limiting:
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

4. **Enable Logging:**
   Consider integrating error tracking (e.g., Sentry):
   ```bash
   npm install @sentry/node
   ```

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to: [your-email@example.com]
3. Include detailed steps to reproduce
4. Allow reasonable time for response before public disclosure

## Security Checklist

- [x] Rate limiting (IP + fingerprint)
- [x] Input validation and sanitization
- [x] CORS and origin validation
- [x] Security headers
- [x] Error message sanitization
- [x] API key protection
- [ ] HTTPS enforcement (Vercel default)
- [ ] DDoS protection (Consider Cloudflare)
- [ ] Database encryption (if implemented)
- [ ] Authentication/Authorization (for paid tiers)

## Regular Security Audits

Recommended schedule:
- **Monthly**: Review rate limit effectiveness
- **Quarterly**: Dependency vulnerability scanning
- **Annually**: Third-party security audit

## Dependencies Security

Keep dependencies updated:
```bash
npm audit
npm audit fix
```

For critical vulnerabilities, update immediately.

## Version History

### v1.1.0 (2025-10-19)
- Implemented enhanced rate limiting
- Added input validation and sanitization
- Implemented origin validation
- Added security headers
- Improved error handling

### v1.0.0 (Initial Release)
- Basic rate limiting
- CORS configuration
- API key environment variable
