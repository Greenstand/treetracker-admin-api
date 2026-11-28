# Domain BDD acceptance specifications

The source of truth for cross-view/use-case Gherkin is the admin client: [features/domain](https://github.com/SebastianGaertnersAI/treetracker-admin-client/tree/feat/domain-admin-views/features/domain), included in Greenstand/treetracker-admin-client#1315.

The catalogue and manifest map each view/workflow to the API sources and existing checks. Stable `UC-...` IDs identify scenarios. `implemented` describes behavior, `legacy_contract` describes retained upstream contracts, and `pending` documents unfinished integration or policy. All new specifications are acceptance-only/manual until actual step definitions are wired. They are not claimed as newly passing end-to-end tests.

API coverage includes organization isolation, authentication/capability boundaries, exact-version conflicts, atomic rollback, request replay, real audit actors, project/grower/session relations, species/local-name scopes, capture approval/tag ownership, billing identity and quotas, directory errors, and schema provenance. The separate PHP webhook is covered without running it against a live endpoint.

Run `npm run bdd:check` in the client repository for offline parser/metadata validation. Existing API Jest suites remain independently executable; they provide partial evidence for the scenarios and are not a complete Gherkin step runner. Domain mutations in future automation require disposable non-production fixtures, verified environment guards and cleanup; live Stripe and shared dev Keycloak must not be modified by a default test run.

Pending behavior is intentionally visible: matching outbox publication, mobile initial project allocation, complete NDM capture export/global-tag migration, quota enforcement, agreement of proposed entitlements, richer account metadata and new contract/media workflows. The BDD suite must not turn these into false implementation claims.
