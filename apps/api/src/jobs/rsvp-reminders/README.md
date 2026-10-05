# RSVP reminders

Reserved for the daily Vercel Cron entry point. No route, timer, or reminder logic is
mounted during scaffolding. Future implementation must authenticate CRON_SECRET,
process bounded Resend batches, and record delivery attempts through the email module.
Do not introduce a queue, Redis, or a persistent background worker.
