# MAKE—BLR / Early-list operations

## Why collect this data?

We need to learn who is interested **and in what**. Do not optimize for vanity list size. Ask for email and primary motivation, plus an optional sentence about their project. Explicit updates consent is mandatory.

## Signup response (automated)

Subject: You're on the MAKE-BLR early list ↗

Hey builder,

You're on the MAKE-BLR early list.

We're just getting started. Our first goal is to meet Bengaluru's makers and understand what would help them build more things.

Here's what to expect: occasional progress updates, first notice if we run small meetups or build sessions, and opportunities to help shape what MAKE-BLR becomes.

No facility or event dates are being promised yet. Your interest helps us decide what to build first.

Keep making things.  
— MAKE-BLR

Questions or want your details removed? Reply to this email.

(Implemented in `lib/waitlist-email.ts`; this copy is for editorial review.)

## First month after opening the list

- **Each day:** Check new signups, technical failures, and emails marked `failed`; avoid sending mass emails to test accounts.
- **Each week:** Sort interest categories; summarize recurring pain points; personally invite a handful of people with relevant projects for 15-minute calls.
- **At an actual milestone:** Share a short update explaining what was learned and what experiment comes next. Send only when something has changed.
- **Before promising dates:** Secure host, safety, capacity, registration logistics, and a clear cancellation process.

## Quality metrics

- Signups by interest category
- Visitors → form attempts → valid signups
- Number of people willing to participate in a pilot
- Qualitative needs that repeatedly appear in project answers
- Actual attendance and willingness to pay, once there is a real pilot

## Prelaunch blockers

1. Database + sender credentials must be installed and tested.
2. Mailbox must accept and be staffed for replies and deletion requests.
3. Clear public privacy notice, retention expectations, and a tested data deletion/unsubscribe process are required before broad public promotion.
4. Prove that a submission results in a stored row and provider-accepted email. Make no claims of guaranteed inbox delivery.
5. Start with a few genuine test users before sharing a public URL.

## Delete a verified signup (manual operator flow)

First verify that the requester controls the signup email (e.g., reply received from their address and a confirmation back to the same address). Then execute the following in the protected Supabase SQL editor, substituting the requested email:

```sql
delete from public.waitlist where email = lower('person@example.com');
```

This is a manual interim step, not a substitute for a production-grade self-service unsubscribe and removal mechanism.
