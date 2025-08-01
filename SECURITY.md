# Security Policy

## Supported Versions

Currently, we support the following versions of the 100 Days of Craft blog with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our blog application seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email your findings to: security@100daysofcraft.com
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if available)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your report within 48 hours
- **Initial Assessment**: Within 5 business days, we'll provide an initial assessment
- **Resolution Timeline**: We aim to resolve critical issues within 30 days
- **Communication**: We'll keep you informed throughout the process
- **Credit**: With your permission, we'll credit you for the discovery

### Security Measures

Our application implements the following security measures:

#### Authentication & Authorization

- Token-based preview authentication with HMAC signatures
- API key validation for protected endpoints
- Rate limiting on all API routes
- Secure session management

#### Data Protection

- Input validation and sanitization
- XSS prevention measures
- CSRF protection
- Secure cookie configuration

#### Infrastructure

- HTTPS enforcement in production
- Security headers (CSP, HSTS, etc.)
- Regular dependency updates
- Automated security scanning

### Security Best Practices for Contributors

When contributing to this project:

1. **Never commit sensitive data**:
   - API keys
   - Passwords
   - Personal information
   - Environment files

2. **Follow secure coding practices**:
   - Validate all user input
   - Use parameterized queries
   - Implement proper error handling
   - Avoid using `eval()` or similar functions

3. **Dependencies**:
   - Only add necessary dependencies
   - Check for known vulnerabilities before adding
   - Keep dependencies up to date

4. **Testing**:
   - Include security tests for new features
   - Test authorization boundaries
   - Verify input validation

### Security Checklist for Releases

Before each release, we ensure:

- [ ] All dependencies are up to date
- [ ] No high or critical vulnerabilities in `npm audit`
- [ ] Security headers are properly configured
- [ ] Environment variables are properly handled
- [ ] No sensitive data in logs or error messages
- [ ] Rate limiting is functional
- [ ] Authentication mechanisms are tested

### Responsible Disclosure

We believe in responsible disclosure and ask that you:

- Give us reasonable time to address issues before public disclosure
- Work with us to understand and resolve the issue
- Avoid privacy violations, data destruction, or service disruption
- Act in good faith to avoid harm to our users

### Recognition

We appreciate the security research community and will acknowledge researchers who:

- Follow responsible disclosure practices
- Provide clear, actionable reports
- Help us improve our security posture

### Contact

For security concerns, contact: security@100daysofcraft.com

For general questions, use our [GitHub Issues](https://github.com/yourusername/hundred-days/issues)

---

Last Updated: January 2025
Version: 1.0
