# Task 13: GitHub Actions CI/CD Pipeline

## Priority: High

## Description
Set up comprehensive GitHub Actions workflows for continuous integration and deployment, including testing, security scanning, and automated deployments.

## Dependencies
- Task 06: Testing Setup (tests must be configured)
- Task 11: Vercel Deployment (deployment targets ready)

## Implementation Steps

### 1. **Main CI/CD Workflow**
   - Create `.github/workflows/ci-cd.yml`:
   ```yaml
   name: CI/CD Pipeline
   
   on:
     push:
       branches: [main, staging]
     pull_request:
       branches: [main, staging]
   
   env:
     NODE_VERSION: '20.x'
   
   jobs:
     # Dependency Installation and Caching
     install:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Cache dependencies
           uses: actions/cache@v4
           id: cache
           with:
             path: node_modules
             key: deps-node-modules-${{ hashFiles('package-lock.json') }}
         
         - name: Install dependencies
           if: steps.cache.outputs.cache-hit != 'true'
           run: npm ci
     
     # Linting and Type Checking
     lint:
       needs: install
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Restore dependencies
           uses: actions/cache@v4
           with:
             path: node_modules
             key: deps-node-modules-${{ hashFiles('package-lock.json') }}
         
         - name: Run ESLint
           run: npm run lint
         
         - name: Run TypeScript check
           run: npm run type-check
     
     # Unit Tests
     test-unit:
       needs: install
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Restore dependencies
           uses: actions/cache@v4
           with:
             path: node_modules
             key: deps-node-modules-${{ hashFiles('package-lock.json') }}
         
         - name: Run unit tests
           run: npm run test:coverage
         
         - name: Upload coverage
           uses: codecov/codecov-action@v4
           with:
             token: ${{ secrets.CODECOV_TOKEN }}
             files: ./coverage/lcov.info
     
     # E2E Tests
     test-e2e:
       needs: install
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Restore dependencies
           uses: actions/cache@v4
           with:
             path: node_modules
             key: deps-node-modules-${{ hashFiles('package-lock.json') }}
         
         - name: Install Playwright
           run: npx playwright install --with-deps
         
         - name: Run E2E tests
           run: npm run test:e2e
           env:
             PRISMIC_REPOSITORY_NAME: ${{ secrets.PRISMIC_REPOSITORY_NAME }}
             PRISMIC_ACCESS_TOKEN: ${{ secrets.PRISMIC_ACCESS_TOKEN }}
         
         - name: Upload test results
           if: always()
           uses: actions/upload-artifact@v4
           with:
             name: playwright-report
             path: playwright-report/
     
     # Security Scanning
     security:
       needs: install
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Run npm audit
           run: npm audit --production --audit-level=high
         
         - name: Run security scan
           uses: aquasecurity/trivy-action@master
           with:
             scan-type: 'fs'
             scan-ref: '.'
             severity: 'CRITICAL,HIGH'
     
     # Build Check
     build:
       needs: [lint, test-unit]
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Restore dependencies
           uses: actions/cache@v4
           with:
             path: node_modules
             key: deps-node-modules-${{ hashFiles('package-lock.json') }}
         
         - name: Build application
           run: npm run build
           env:
             PRISMIC_REPOSITORY_NAME: ${{ secrets.PRISMIC_REPOSITORY_NAME }}
             PRISMIC_ACCESS_TOKEN: ${{ secrets.PRISMIC_ACCESS_TOKEN }}
         
         - name: Check bundle size
           run: |
             npm run analyze
             # Add bundle size checks here
   ```

### 2. **Deploy Preview Workflow**
   - Create `.github/workflows/deploy-preview.yml`:
   ```yaml
   name: Deploy Preview
   
   on:
     pull_request:
       types: [opened, synchronize]
   
   jobs:
     deploy-preview:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v25
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
             scope: ${{ secrets.VERCEL_SCOPE }}
         
         - name: Comment PR
           uses: actions/github-script@v7
           with:
             script: |
               github.rest.issues.createComment({
                 issue_number: context.issue.number,
                 owner: context.repo.owner,
                 repo: context.repo.repo,
                 body: `Preview deployment ready! 🚀\n\n[View Preview](${process.env.VERCEL_URL})`
               })
   ```

### 3. **Lighthouse CI Workflow**
   - Create `.github/workflows/lighthouse.yml`:
   ```yaml
   name: Lighthouse CI
   
   on:
     pull_request:
       types: [opened, synchronize]
   
   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Run Lighthouse CI
           uses: treosh/lighthouse-ci-action@v11
           with:
             urls: |
               ${{ env.PREVIEW_URL }}
               ${{ env.PREVIEW_URL }}/blog
             uploadArtifacts: true
             temporaryPublicStorage: true
   ```

### 4. **Dependency Update Workflow**
   - Create `.github/workflows/dependencies.yml`:
   ```yaml
   name: Dependency Updates
   
   on:
     schedule:
       - cron: '0 0 * * MON' # Weekly on Monday
     workflow_dispatch:
   
   jobs:
     update-dependencies:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Update dependencies
           run: |
             npm update
             npm audit fix
         
         - name: Create Pull Request
           uses: peter-evans/create-pull-request@v6
           with:
             token: ${{ secrets.GITHUB_TOKEN }}
             commit-message: 'chore: update dependencies'
             title: 'Weekly Dependency Updates'
             body: |
               ## Dependency Updates
               
               This PR contains automatic dependency updates.
               
               Please review and merge if all tests pass.
             branch: deps/weekly-update
   ```

### 5. **Release Workflow**
   - Create `.github/workflows/release.yml`:
   ```yaml
   name: Release
   
   on:
     push:
       tags:
         - 'v*'
   
   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Create Release
           uses: softprops/action-gh-release@v2
           with:
             generate_release_notes: true
             draft: false
             prerelease: false
   ```

### 6. **Add Status Badges**
   Update `README.md`:
   ```markdown
   # 100 Days of Craft
   
   [![CI/CD](https://github.com/yourusername/hundred-days/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/hundred-days/actions/workflows/ci-cd.yml)
   [![Coverage](https://codecov.io/gh/yourusername/hundred-days/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/hundred-days)
   [![Security](https://snyk.io/test/github/yourusername/hundred-days/badge.svg)](https://snyk.io/test/github/yourusername/hundred-days)
   ```

### 7. **GitHub Settings Configuration**
   Configure branch protection rules:
   ```
   Settings > Branches > Add rule
   
   Branch name pattern: main
   - Require pull request reviews (1)
   - Dismiss stale PR approvals
   - Require status checks:
     - lint
     - test-unit
     - test-e2e
     - security
     - build
   - Require branches to be up to date
   - Include administrators
   ```

## Secrets Configuration

Add to GitHub Secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_SCOPE
PRISMIC_REPOSITORY_NAME
PRISMIC_ACCESS_TOKEN
CODECOV_TOKEN
```

## Success Criteria
- All workflows run successfully
- Tests pass in CI
- Security scanning active
- Automated deployments work
- Preview deployments for PRs
- Dependency updates automated
- Branch protection configured
- Status badges display correctly