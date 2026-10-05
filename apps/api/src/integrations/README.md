# Integration boundaries

Each provider exports a configuration getter that validates required values when called.
Blank integration settings do not prevent local API startup. Getters make no network
requests and never include credential values in configuration errors.

- R2: compressed main images and thumbnails; MongoDB holds metadata/object keys only.
  Add S3 client/presigning dependencies with the actual upload implementation.
- Resend: bounded email batches backed by the email module's delivery records.
  Add the Resend SDK with delivery implementation.
- Google Places: server-side discovery via native fetch; persist only wedding selections.

No provider operation, upload signing, email sending, or vendor search is implemented.
