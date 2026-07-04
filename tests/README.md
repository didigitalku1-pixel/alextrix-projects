# Tests

Comprehensive test suite to catch regressions before they reach production.

## What's covered

| Test file | Purpose | Catches |
|---|---|---|
| `tests/api/schema-validation.test.ts` | Verify SELECT clauses match Supabase table columns | **The original bug**: `column components.username does not exist` → silent 404 |
| `tests/api/item-detail.test.ts` | `/api/item/[type]/[id]` returns 200 for real slugs | Component detail page showing "Item not found" |
| `tests/api/items-listing.test.ts` | Search, filter, pagination, sort on `/api/items` | Search param `q=` being ignored |
| `tests/api/auxiliary.test.ts` | Sitemap, robots.txt, skill-thumb, image proxy, stats | Sitemap index broken, skill placeholder regressions |
| `tests/routing/routes.test.ts` | Page routes: homepage, learn, design-systems, redirects | `/detail/template/X` no longer redirecting to `/templates/<slug>` |
| `tests/unit/utils.test.ts` | Pure function tests (image URL fix, file naming, SELECT_MAP structure) | SELECT_MAP accidentally re-introducing forbidden columns |

## Running tests

```bash
# Run all tests (against production by default)
bun run test

# Run only unit tests (no network, fastest)
bun run vitest run tests/unit/

# Run only schema validation tests
bun run vitest run tests/api/schema-validation.test.ts

# Watch mode during development
bun run test:watch

# With coverage report
bun run test:coverage

# Visual UI
bun run test:ui
```

## Test against local dev server

By default, integration tests hit `https://web-library-coral.vercel.app`.
To test against local dev instead:

```bash
# Terminal 1: start dev server
bun run dev

# Terminal 2: run tests against local
TEST_TARGET=http://localhost:3000 bun run test
```

## CI integration

GitHub Actions workflow `.github/workflows/tests.yml` runs on every PR + push to `main`:
1. Unit tests (no network) — fast feedback
2. Schema validation tests — direct Supabase queries
3. Full integration test suite — against production URL

If a test fails, the PR check fails and merge is blocked.

## Adding new tests

When adding a new feature or fixing a bug:

1. **Add a regression test** in the appropriate test file
2. **Run the test locally** — it should pass with your fix
3. **Revert your fix** — verify the test fails (proves it catches the bug)
4. **Re-apply your fix** — commit both the fix and the test

This pattern ensures future developers can't accidentally reintroduce the bug.

## Test counts (current)

- 6 test files
- 128 tests
- 0 failures
- ~51s runtime (mostly integration tests against production)
