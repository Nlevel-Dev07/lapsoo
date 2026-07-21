# Lapsoo Mobile App — Plan & Roadmap

Two audiences, one Expo monorepo, phased MVP-first rollout.

## 1. Scope

Two separate apps sharing code, not one app with a role switch — the customer and staff
workflows have nothing in common UI-wise and you don't want consumers accidentally landing
on a technician screen:

- **Lapsoo Customer App** — browse/buy laptops, submit & track repair jobsheets, sell/exchange
  a laptop, manage account. Public app store listing.
- **Lapsoo Staff App** — for technicians and team members (`TeamMember` / `Role` models).
  Update jobsheet status, view assigned repairs, see leads. Internal distribution
  (TestFlight / internal Play track, or Expo's internal distribution) — not on public stores.

## 2. Tech stack

- **Expo (React Native) + TypeScript**, Expo Router for file-based navigation (mirrors your
  existing file-based `/api` routing mentally).
- **Monorepo**: add `apps/mobile-customer` and `apps/mobile-staff` alongside the existing web
  app, with a `packages/shared` workspace for:
  - TypeScript types mirrored from `prisma/schema.prisma` (or generated via `prisma-client` +
    a type-only export) — `Product`, `RepairRequest`, `SellExchangeLead`, etc.
  - API client (thin fetch wrapper) and zod schemas reused from the web app's validation.
  - Use pnpm/yarn workspaces or Turborepo; low overhead since both are TS-first already.
- **State/data**: TanStack Query (already used on web) — same mental model, React Query has a
  first-class RN story.
- **Forms**: react-hook-form + zod (already used on web) — carries over directly.
- **Navigation**: Expo Router (stack + tabs).
- **Push notifications**: Expo Notifications + Expo Push service (no need for raw
  FCM/APNs wiring initially).
- **Media**: `expo-image-picker` + Cloudinary direct upload, reusing the signed-upload pattern
  from `api/upload/sign.ts` / `lead-media-sign.ts`.
- **Auth storage**: `expo-secure-store` for tokens.

## 3. Backend changes required (before any mobile screen is built)

This is the part most likely to be underestimated — the current backend assumes a browser:

1. **Auth: cookie sessions → bearer tokens for mobile.**
   `api/_lib/auth.ts` and `api/_lib/customerAuth.ts` currently issue JWTs as httpOnly cookies
   (`lapsoo_admin_session`, customer session cookie). Mobile clients can't rely on cookie jars
   the same way. Add a parallel token-issuing path:
   - On login, also return `{ accessToken, refreshToken }` in the JSON body when a
     `X-Client: mobile` header (or a dedicated `/api/mobile/auth/*` route) is present.
   - Add a refresh-token endpoint + short-lived access tokens (e.g. 15 min access /
     30 day refresh) since mobile sessions live much longer than web sessions.
   - Keep existing cookie flow untouched for web — don't risk regressing the admin panel.
2. **API versioning.** No `/v1` today. Introduce `/api/mobile/v1/*` (or a shared `/api/v1/*`)
   for anything mobile-specific (push token registration, device-specific payload shapes) so
   the web app's existing flat `/api/*` routes aren't disturbed.
3. **Push token registration endpoint** — `POST /api/mobile/push-token` storing Expo push
   tokens against `Customer` / `TeamMember` for repair-status and jobsheet-assignment
   notifications.
4. **Jobsheet status webhook/notification hook** — when `RepairRequest.status` changes
   (technician updates it from the staff app), trigger a push to the customer. Likely a small
   addition inside the existing `admin/jobsheets` / `repair-requests` handlers.
5. **Staff-app-scoped endpoints** — the staff app needs "my assigned jobsheets" filtered by
   `TeamMember` id, which may not exist yet as a discrete endpoint (currently jobsheets are
   likely listed/filtered admin-side). Add `GET /api/mobile/staff/jobsheets/mine`.
6. **Turnstile captcha** on mobile — Cloudflare Turnstile is a web widget; it doesn't work
   in-app. Plan to skip captcha for authenticated mobile flows and rely on rate limiting, or use
   Turnstile's invisible/managed mode via a WebView only for unauthenticated public forms
   (sell/exchange lead, enquiry) if abuse becomes a problem.

## 4. Feature roadmap (phased)

### Phase 0 — Foundations (~1–2 weeks)
- Scaffold Expo monorepo, shared package, CI (EAS Build), app icons/splash, design tokens
  pulled from the existing Tailwind theme for visual consistency with the web brand.
- Implement mobile token auth (backend item #1) end-to-end: signup, login, logout, session
  restore on app launch.
- Basic navigation shell (tabs) for both apps.

### Phase 1 — Customer MVP (~3–4 weeks)
Highest value, lowest complexity, ship first:
- Product catalog browse + filter + detail (reuse `products`, `brands` endpoints and
  `ProductImage` cycling logic from `ProductDetail.tsx`/`ProductCard.tsx` as a UX reference).
- Repair request: submit new jobsheet (device info, serial, accessories, media upload) and
  **track by code** (`repair-requests/track`) — this is the single most "mobile-native" feature
  (a customer photographing their broken laptop and checking status on the go) and should
  anchor the v1 release.
- "My repairs" list for logged-in customers (`repair-requests/mine`).
- Account: signup/login/email verification/password reset (reuse existing
  `auth/customer-*` endpoints as-is).
- Push notification on jobsheet status change.

### Phase 2 — Staff MVP (~2–3 weeks, parallel-able with Phase 1)
- Staff login (team/admin JWT, token variant).
- "My assigned jobsheets" list + detail + status update (BOOKED → ... → DELIVERED) with photo
  upload for completed work.
- Push notification when a new jobsheet is assigned to a technician.
- Read-only view of leads (enquiries/corporate/sell-exchange) if staff need mobile visibility.

### Phase 3 — Customer feature parity (~3–4 weeks)
- Sell/exchange lead submission with media upload.
- Corporate enquiry / general enquiry forms.
- Blog reading.
- Full purchase/checkout flow if the web app supports one (confirm — exploration didn't
  surface a cart/checkout API; if purchasing today is offline/lead-based rather than a real
  cart, mobile should mirror that, not invent a cart).

### Phase 4 — Polish & launch
- Deep linking (e.g. push notification → specific jobsheet screen).
- Offline-friendly caching for product browsing (TanStack Query persisted cache).
- App store assets, privacy policy/data-safety forms (required for both stores — flag early,
  it can gate submission for days).
- Analytics (screen views, funnel from browse → enquiry/repair-request).
- Staged rollout via EAS/TestFlight beta group before public release.

## 5. Open questions to confirm before Phase 1 starts

- **Checkout**: is there an actual purchase/payment flow on the web today, or is buying a
  laptop lead-gen (enquiry → call/WhatsApp)? This changes whether Phase 3 needs a payment
  gateway (Razorpay/Stripe) at all.
- **Push notification provider**: Expo's push service is fine for MVP; if you outgrow it,
  swap to raw FCM/APNs later — no need to decide now.
- **App store accounts**: need an Apple Developer account ($99/yr) and Google Play Console
  ($25 one-time) set up before Phase 4 — good to start that paperwork early since Apple review
  can take days.

## 6. Rough timeline

| Phase | Duration | Can run in parallel with |
|---|---|---|
| 0 — Foundations | 1–2 wks | — |
| 1 — Customer MVP | 3–4 wks | Phase 2 |
| 2 — Staff MVP | 2–3 wks | Phase 1 |
| 3 — Customer parity | 3–4 wks | — |
| 4 — Polish & launch | 1–2 wks | — |

**Total: ~10–15 weeks** to a public customer app + internal staff app, assuming one mobile
developer working through backend changes alongside; faster with a dedicated backend dev on
the Phase 0 auth/token work while mobile UI is scaffolded in parallel.
