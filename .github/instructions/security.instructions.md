---
applyTo: '**/*.ts,**/*.tsx,**/*.js'
---

# Security Review Standards

Guidelines for security in the Quran.com frontend.

## Credentials & Secrets

- Flag ANY hardcoded credentials, API keys, or secrets
- Ensure all sensitive values use environment variables
- Flag commits that may contain secrets

```typescript
// Good
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// Bad - NEVER do this
const apiKey = 'sk-1234567890abcdef';
```

## Environment Variables

- Document new environment variables in PR description
- Use `NEXT_PUBLIC_` prefix only for client-side variables
- Flag sensitive data exposed to client

## Input Validation

- Require validation for all user inputs
- Flag direct usage of user input without sanitization
- Ensure proper encoding for dynamic content

```typescript
// Good
const sanitizedInput = DOMPurify.sanitize(userInput);

// Bad - XSS vulnerability
dangerouslySetInnerHTML={{ __html: userInput }}
```

## Authentication

- Flag protected routes without auth checks
- Ensure proper session validation
- Flag sensitive operations without authentication
