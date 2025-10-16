---
name: Bug Report
about: Report a bug or unexpected behavior
title: '[Bug]: '
labels: 'bug, needs-triage'
assignees: ''
---

## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
Steps to reproduce the behavior:
1. Import '...'
2. Call a function with '...'
3. See error

## Expected Behavior
What did you expect to happen?

## Actual Behavior
What actually happened?

## Code Sample
```typescript
import { formatNumber } from '@zerovoids/utils/number';

const result = formatNumber(123.456);
console.log(result); // Error occurs here
```

## Environment
- Package version: [e.g. 0.1.0]
- Module: [e.g. number/unit]
- Node version: [e.g. 20.x]
- Package manager: [e.g. pnpm 10.x]
- OS: [e.g. Windows 11]

## Additional Context
Add any other context about the problem here.

## Checklist
- [ ] I have searched for existing issues to avoid duplicates
- [ ] I have provided a minimal code sample to reproduce the issue
