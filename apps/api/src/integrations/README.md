# Integration boundaries

Each provider exports a configuration getter that validates required values when called.
Blank integration settings do not prevent local API startup. Getters make no network
requests and never include credential values in configuration errors.

- R2: compressed main images and thumbnails; MongoDB holds metadata/object keys only.
  Add S3 client/presigning dependencies with the actual upload implementation.
- Resend: bounded email batches backed by the email module's delivery records.
  The email module implements one bounded membership email per request via native fetch, with provider idempotency keys and persisted outcomes. No SDK is required.
- Google Places: server-side discovery via native fetch; persist only wedding selections.

Upload signing and vendor search remain pending. Membership email sending is implemented; real delivery currently requires resolving the configured sender's domain-verification failure. Provider secrets remain backend-only and are validated when used.
