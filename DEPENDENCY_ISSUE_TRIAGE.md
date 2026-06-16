# Dependency Issue Triage

Source: GitHub security advisory emails received in Gmail on 2026-06-01 and 2026-06-08.

## Reported Issues

| Severity | Dependency | Advisory | Affected file |
| --- | --- | --- | --- |
| Critical | `vitest` | CVE-2026-47429 / GHSA-5xrq-8626-4rwp | `package-lock.json` |

## What Needs To Be Done

- Review the Dependabot alert for `vitest`.
- Update `vitest` or the dependency chain that brings it in.
- Regenerate `package-lock.json` with the package manager already used by this repo.
- Run the repo's existing install, test, lint, and build checks before merging.

## Suggestions

- Treat this as priority work because the advisory is critical.
- If Vitest UI is not needed, verify scripts do not expose it in development or CI.
- Use `npm audit` after the update to confirm the advisory is cleared.
