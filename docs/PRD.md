# Wish & Wonder PRD

Nov 15, 2026 · @Omotolani

## Overview

Wish & Wonder is a no-login, mobile-first web app where a family shares Christmas wish lists and buyers reveal gifts one at a time through numbered mystery boxes, then secretly claim one. Everyone gets something they asked for, nobody sees what is bought for them, and no two people buy the same thing.

**Tagline:** The gifts they want. The surprises they deserve.

### Problem

- Guessed gifts often miss, and plain wish lists remove all surprise.
- Family members buy the same item because nobody coordinates.
- Existing family wish list apps such as GiftList, Giftster and Olive Gifting already hide claims from the recipient. A quick search found none that hide items behind random numbers, but this needs a fuller check before launch.

### Solution

A shared group space opened from one WhatsApp link, for a family, friends or colleagues. Each member adds a wish list. Buyers pick a person, open numbered mystery boxes that each reveal one random available gift, and choose to claim it or try another number. Claims are enforced by the server and hidden from the recipient.

### Groups, not just families

A group can be a family, friends, colleagues or something else. The organiser picks the type when creating it, and all wording adapts (FR-1a). In the code and database the group is still called a `family`; users never see that word unless their group is a family.

### Goals

1. **Simple:** no registration or complicated setup.
2. **Surprising:** the recipient never sees what has been bought for them.
3. **Personal:** every present comes from the recipient's own wish list.
4. **Fair:** no two members can reserve the same gift, even at the same moment.
5. **Fun:** revealing numbered mystery gifts makes shopping playful.
6. **Easy for everyone:** grandparents and less technical relatives can use it from a phone.

### Non-goals for v1

- Payments, checkout or placing orders. Mark Purchased is for tracking only.
- Native iOS or Android apps. It is a responsive website.
- Email and password accounts.
- Everything under Future features.

## Users

Every member is both a wisher and a buyer; one member is also the organiser.

| Role | Who | What they need |
| --- | --- | --- |
| Organiser | The member who creates the family | Create the family, share the link, manage membership, approve joiners if enabled, help with lost access links |
| Wisher | Every member | Add and edit gifts with details such as size and colour, and never see what was claimed |
| Buyer | Every member | A fun way to find a gift, a way to claim it, and one private place to track what they still need to buy |
| Less technical member | Grandparents and others | Large, easy-to-tap buttons, works straight from a WhatsApp link, no passwords |

## User stories and core flows

### Setup flow

1. The organiser opens the site, taps **Start a group**, chooses who it's for (Family, Friends, Colleagues or Something else) and enters a name such as "The Williams Family Christmas 2026" or "Marketing Team Secret Santa".
2. The app creates the family, makes the organiser its first member and shows a shareable invite link (for example `wishandwonder.app/join/<code>`).
3. The organiser shares the invite link in the family WhatsApp group.
4. Each person opens the link, taps **Join Family** and enters their name.
5. The app gives them a private personal link that recognises them when they return, with no password.
6. They add gifts to **My Wishlist**.

### Gifting flow

&#91;embedded content: gifting flow · reveal, decide, claim\]

A buyer can loop through as many numbers as they like; the gift is only locked when the server confirms it is still free.

### User stories

| ID | As a | I want to | So that |
| --- | --- | --- | --- |
| US-1 | Organiser | create a group and get an invite link | I can bring everyone in with one message |
| US-1a | Organiser | say whether the group is for family, friends, colleagues or something else | the app talks to us in the right words |
| US-1b | Member | belong to several groups on one phone and switch between them | I can use it with my family and my work Secret Santa |
| US-2 | Family member | join from the invite link by entering my name | I do not need an account or password |
| US-3 | Family member | come back later and be recognised | I can edit my list and see my claims |
| US-3a | Family member | continue on another device, for example from my phone to a laptop | I can keep editing my list and see my claims anywhere |
| US-4 | Wisher | add, edit and remove gifts with details | buyers get exactly what I want |
| US-5 | Wisher | never see what has been claimed from my list | the surprise is protected |
| US-6 | Buyer | pick a person and open numbered mystery gifts | finding a gift feels like a game |
| US-7 | Buyer | reveal several gifts before deciding | I can choose one I'm happy to buy |
| US-8 | Buyer | secretly claim a revealed gift | nobody else buys the same thing |
| US-9 | Buyer | see all my claims in one place and mark them purchased | I can track my shopping |
| US-10 | Buyer | release a claim | the gift goes back for someone else |
| US-11 | Organiser | recover or replace a member's lost access link | nobody gets locked out |
| US-12 | Organiser | archive this year's event and start a new one | the family can reuse the app next Christmas |

## Functional requirements

All requirements below are in scope for v1 unless marked otherwise.

### Groups and membership

| ID | Requirement |
| --- | --- |
| FR-1 | Anyone can create a group. They first choose who it's for (**Family**, **Friends**, **Colleagues** or **Something else**), then enter a group name. The creator becomes the organiser. |
| FR-1a | Every user-facing label that names the group uses the wording for its type (see Group wording under Key copy). Before a group exists (landing page, Start and Join buttons) the wording is neutral: "group". |
| FR-1b | **Several groups on one device:** a device remembers a separate sign-in for each group it has created or joined. Creating, joining, or opening a personal or device link adds that group and never signs the device out of another. A group switcher at the top of the dashboard lists the device's groups, with **Start or join another group**. A member can remove a group from this device without leaving it. The landing page offers "Continue to <group name>" for each remembered group. Each group's name, wish list and claims stay completely separate. |
| FR-2 | The app creates a private family space and a shareable invite link with an unguessable code. |
| FR-3 | Opening the invite link shows a Christmas-themed page with the family name and a **Join Family** button. Joining asks for the member's name, which must be unique within the family. The page also tells returning members: "Already in this family? Open your personal link on this device, or use **Use on another device** from a device you're already signed in on." |
| FR-4 | Each member receives a private personal access link, separate from the invite link, which recognises them when they return without a password. The link is shown once, after joining. The app can't show it again, because only a hash of it is stored. |
| FR-4a | **Use on another device:** a signed-in member can create a one-time device link, shown as a link and a QR code. Opening it on another device signs that device in as the same member. Each device keeps its own session, so signing in on a laptop never signs the phone out. A device link works once and expires 15 minutes after it's created. |
| FR-5 | The family homepage shows all participating members, and every name is clickable. It also shows a countdown to Christmas Day. |
| FR-6 | The organiser can manage family membership. Removing a member deletes their wish list and their reservations: gifts they had reserved return to the pool, and anyone who had reserved one of their gifts sees a notice in My Secret Gifts. Any member can also add a person without a phone, such as a young child, and manage that person's wish list. |

### Wish lists

| ID | Requirement |
| --- | --- |
| FR-10 | A member can add unlimited gifts. Each has a name and description. Optional: image (upload or add a photo), estimated price, shop or product link, preferences such as colour, size or model, and a priority such as "Really want this". |
| FR-11 | A member can always see, edit and remove their own gifts. |
| FR-12 | The wish list screen never shows whether an item has been claimed or purchased, and claim details are never sent to the owner's browser. |
| FR-13 | When a claimed gift is edited, the buyer's reservation keeps the details they originally reserved, so later edits do not silently change their purchase plan. If the owner deletes a claimed gift, the reservation is deleted and the buyer sees a notice in My Secret Gifts. |

### Mystery picker

| ID | Requirement |
| --- | --- |
| FR-20 | The family dashboard lists every member with a **Pick a Gift** button, except the current member. |
| FR-21 | The picker shows one numbered box per gift on that recipient's list. Claimed gifts stay in the grid as opened "Taken" boxes. A Taken box shows no gift details or buyer and cannot be claimed. |
| FR-22 | Numbers are randomly assigned to gifts for each shopper, rather than one fixed numbered list for the whole family. The numbers reshuffle on every visit. |
| FR-23 | Opening a box plays a short reveal animation and shows the gift's details. Proposed: the server sends only the revealed gift, never the whole list. |
| FR-24 | Revealing a gift does not reserve it. The buyer can reveal as many boxes, and claim as many gifts, as they want. There is no limit per recipient. Boxes the buyer has already opened this visit show as "Peeked" and can be opened again. |
| FR-25 | After a reveal the buyer chooses **I'll Buy This** or **Try Another Number**. |
| FR-26 | A claim is accepted only if the gift is still available, checked by the server in one transaction. |
| FR-27 | If the gift was claimed by someone else in the meantime, the buyer sees "Already picked, try another number" and the box turns into a Taken box. |
| FR-28 | When all gifts are claimed, the picker says there are currently no gifts left to choose. |
| FR-29 | A member cannot open their own picker or claim their own gifts. The server enforces this. |

### My Secret Gifts

| ID | Requirement |
| --- | --- |
| FR-30 | Shows every gift the member currently has claimed, with the recipient and a status of Reserved or Purchased. Released gifts disappear from the list. |
| FR-31 | For each gift the member can view the product information, open the shop link, mark it Purchased, or release it. |
| FR-32 | Releasing a gift returns it to the available pool for others to claim. |
| FR-33 | Marking a gift Purchased only tracks shopping. It does not place an order or take payment. |
| FR-34 | Only the claimer can see or change a reservation. Not the recipient, other members or the organiser. |

### Organiser settings

| ID | Requirement |
| --- | --- |
| FR-40 | Edit the group name and type, and copy the invite link. Changing the type changes only the wording. |
| FR-41 | Recover or replace a member's lost access link through an organiser-controlled process. Replacing it signs that member out on every device and gives them one new personal link. |
| FR-42 | Optional join approval: the organiser approves new members before they join. |
| FR-43 | Create a new Christmas event. |
| FR-44 | Close or archive an old event. |
| FR-45 | The organiser does not automatically get access to anyone's secret purchases. |

## Privacy, identity and security

Surprise protection is enforced on the server: the recipient's browser never receives claim data, so hiding it is not left to the UI.

### Who can see what

| Data | Recipient | Other buyers | Claimer | Organiser |
| --- | --- | --- | --- | --- |
| Recipient's gift details | Yes (own list) | Only gifts they reveal | Snapshot of claimed gift | Only gifts they reveal |
| Whether a gift is claimed | No | Sees which numbers are Taken, not what or by whom | Yes, for own claims | No |
| Who claimed a gift | No | No | Yes, themselves | No |
| Purchased status | No | No | Yes | No |
| Member names | Yes | Yes | Yes | Yes |

### Identity without logins

- **Invite link:** shared with the family, used only to join.
- **Personal link:** private, one per member, identifies them and gives access to their own wish list and reservations.
- Personal links must be unguessable. Anyone holding one may access that member's account, so it must be treated as private.
- **Device link:** one-time and short-lived, created by a signed-in member to sign in another device (FR-4a).
- A member can be signed in on a phone and a laptop at the same time, using their personal link on both or a device link on the second. Signing in on one device never signs out another.
- A lost personal link is recovered or replaced through the organiser (FR-41). Replacing it signs the member out everywhere, which also covers a link that has leaked.
- For extra protection the organiser can turn on join approval (FR-42).

**Proposed implementation notes (not in the original brief):** store only a hash of each link's token; keep the token in a secure, httpOnly cookie after the first visit; send `Referrer-Policy: no-referrer` so the token never leaks to shop sites.

### Security rules

- Members can edit only their own wish list.
- Members can manage only their own reservations.
- Every reservation is checked by the server, not just marked in the browser, so two shoppers cannot reserve the same gift at once.
- Claim details are never sent to the recipient's browser, even hidden from the screen.
- Proposed: every request is scoped to the member's family, and reveals are rate limited to stop someone scripting their way through a whole list.

### Known limitation

Because claimed gifts show as Taken boxes, buyers can see how many gifts on a list are claimed, and a buyer who revealed a gift earlier may later deduce that it was picked. The app protects who claimed it and prevents duplicates, but cannot stop buyers inferring that something was picked. The recipient never sees this.

## Data model and technical approach

A responsive Next.js site on Vercel, backed by Supabase Postgres, with all claim logic in server routes and a database constraint as the last line of defence against duplicates.

### Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js and React |
| Styling | Tailwind CSS |
| Database | Supabase Postgres |
| Server logic | Proposed: Next.js server routes, with the Supabase service key used only on the server |
| Hosting | Vercel |
| Identity | Secure, passwordless, member-specific access links |

### Tables

The entities come from the brief; the columns are a proposal.

| Table | Key columns |
| --- | --- |
| `families` | id, name, group\_type (family, friends, colleagues, other; existing rows default to family), invite\_code, organiser\_member\_id, requires\_approval, created\_at. Called "group" in the UI. |
| `events` | id, family\_id, name (for example "Christmas 2026"), status (active, archived), created\_at |
| `members` | id, family\_id, display\_name (unique per family), managed\_by\_member\_id (for people without a phone), status (pending, active), created\_at |
| `member_sessions` | id, member\_id, token\_hash, created\_at, revoked\_at (one row per signed-in device) |
| `device_links` | id, member\_id, token\_hash, expires\_at, used\_at (one-time links for FR-4a) |
| `gifts` | id, event\_id, owner\_member\_id, name, description, image\_url, price\_pence, shop\_url, preferences, priority, updated\_at |
| `claims` | id, gift\_id, claimer\_member\_id, status (reserved, purchased, released), gift\_snapshot, claimed\_at, updated\_at |
| `notices` | id, member\_id, message, created\_at, dismissed\_at (in-app notices for FR-6 and FR-13) |
| `picker_visits` | id, buyer\_member\_id, recipient\_member\_id, seed, peeked\_gift\_ids (boxes peeked during this visit), created\_at (keeps one visit's number shuffle on the server, so a Peeked number shows the same gift) |

### Duplicate protection

A partial unique index allows only one active claim per gift:

```sql
create unique index one_active_claim_per_gift
  on claims (gift_id)
  where status in ('reserved', 'purchased');
```

The claim route checks the claimer is not the owner, inserts the claim in a transaction, and maps a unique violation to the "Already picked" response.

### API

Proposed endpoints, not in the original brief:

| Method and path | Purpose |
| --- | --- |
| `POST /api/families` | Create a family, its first event and the organiser |
| `POST /api/join/:inviteCode` | Join with a name, returns the personal link |
| `GET /api/me` | Current member, family and event |
| `POST /api/me/device-link` | Create a one-time device link for FR-4a |
| `GET /device/:token` | Use a device link: create a new session for this device, then go to the dashboard |
| `GET/POST/PATCH/DELETE /api/gifts` | Manage own gifts; never returns claim fields |
| `GET /api/picker/:memberId` | Number of mystery boxes for a recipient |
| `POST /api/picker/:memberId/reveal` | Reveal one random available gift |
| `POST /api/claims` | Claim a gift |
| `GET /api/claims/mine` | My Secret Gifts |
| `PATCH /api/claims/:id` | Mark purchased or release |
| `POST /api/managed-members` | Add a person without a phone and manage their list |
| `POST/PATCH/DELETE /api/managed-members/:id/gifts` | Add, edit or remove gifts on a managed list |
| `DELETE /api/notices/:id` | Dismiss an in-app notice |
| `PATCH /api/organiser/family` | Rename the family or change join approval |
| `POST /api/organiser/members/:id/approve` | Approve a waiting member |
| `DELETE /api/organiser/members/:id` | Remove or decline a member |
| `POST /api/organiser/members/:id/reissue-link` | Replace a personal link and sign that member out everywhere |
| `POST /api/organiser/events` | Start the next Christmas event |
| `POST /api/organiser/events/:id/archive` | Archive the active event |

Row level security is still enabled on every table as a backstop, with no direct client access to `claims`.

## Pages and design

Six pages, designed mobile first for a link opened from WhatsApp, warm and festive but simple enough for grandparents.

### Pages

| Page | Purpose | Key elements |
| --- | --- | --- |
| Welcome | Explain the idea and start | The three main actions (create your wishlist, reveal mystery gifts, surprise your loved ones), **Start a group**, **Join a group** |
| Dashboard | Home screen | Group switcher, group name, Christmas countdown, family members with **Pick a Gift**, add or invite members, My Wishlist, My Secret Gifts, the invite button (wording by group type) |
| My Wishlist | Manage own gifts | Add, edit, remove; product URL, photo, estimated price, preferences or notes. No claim status. |
| Mystery Gift Picker | The signature page | Recipient's name, numbered mystery gifts, opening animation, gift details, **I'll Buy This**, **Try Another Number**, clear unavailable messages |
| My Secret Gifts | Track claims | Everything the member has claimed with status, product information, shop link, **Mark Purchased**, **Release** |
| Use on Another Device | Sign in a second device | One-time link and QR code, a 15-minute countdown, **Copy link**, and a note that it works once |
| Group Settings | Organiser only | Edit group name and type, copy invite link, manage membership, approve members if enabled, create a new event, close or archive an old one |

### Design requirements

- **Feel:** warm, magical, modern and premium without being complicated; a wrapped Christmas present meets a simple shopping app.
- **Palette:** deep forest green (primary), festive red (buttons and seasonal details), warm ivory (backgrounds), soft gold (highlights and celebration effects), white (cards and content).
- **Shapes:** Christmas gift box icons, rounded cards and buttons.
- **Motion:** a short animation when revealing a gift, subtle confetti when claiming, gentle snowfall or sparkle.
- **Mobile:** clean mobile-first layout, large easy-to-tap mystery numbers, works well from a WhatsApp invitation opened on a phone.
- **Proposed additions:** respect reduced-motion settings, meet WCAG 2.1 AA contrast, and label every box and button for screen readers.

### Key copy

- Claim confirmation: "This gift is secretly reserved for you! Sarah won't know a thing."
- Conflict: a friendly "Already picked" message.
- Empty picker: a message that there are currently no gifts left to choose.

### Group wording

| Where it shows | Family | Friends | Colleagues | Something else |
| --- | --- | --- | --- | --- |
| Group word | family | friends | team | group |
| Invite button | Invite your family | Invite your friends | Invite your team | Invite people |
| Empty dashboard | Share the link so everyone in the family can add their wishes | Share the link so all your friends can add their wishes | Share the link so everyone on the team can add their wishes | Share the link so everyone can add their wishes |
| Join page | You're invited to join the family | You're invited by your friends | You're invited to join the team | You're invited to join |
| Name example | e.g. Williams Family Christmas | e.g. Uni Friends Christmas | e.g. Marketing Team Secret Santa | e.g. Book Club Christmas |

## Edge cases

| Case | Expected behaviour |
| --- | --- |
| Two buyers claim the same gift at once | The database accepts one; the other sees "Already picked" and the box becomes Taken (FR-26, FR-27). |
| Owner edits a claimed gift | The buyer keeps the details they reserved (FR-13). |
| Owner deletes a claimed gift | The reservation is deleted and the buyer sees a notice (FR-13). |
| Buyer changes their mind | They release the gift; it returns to the pool and disappears from My Secret Gifts (FR-30, FR-32). |
| Every gift for a recipient is claimed | All boxes show Taken and the picker says there are no gifts left (FR-28). |
| Organiser removes a member | Their list and reservations are deleted; affected buyers see a notice (FR-6). |
| Member loses their personal link | The organiser recovers or replaces it, which signs them out on every device (FR-41). |
| Member moves from phone to laptop | They open **Use on another device** on the phone and open the link or QR code on the laptop. Both stay signed in (FR-4a). |
| A returning member opens the invite link | The join page points them to their personal link or a device link instead of joining twice (FR-3). |
| Someone creates or joins a second group on the same phone | It's added to the group switcher. They stay signed in to their first group (FR-1b). |
| A device link is used twice or after 15 minutes | It shows "This link no longer works" and nothing changes (FR-4a). |

## Success metrics

The brief sets no targets. These are proposed measures; targets are still to agree.

| Metric | Target |
| --- | --- |
| Members who add gifts to their list | To agree |
| Recipients with at least one claimed gift | To agree |
| Duplicate active claims on one gift | 0 |
| Claim data reaching a recipient's browser | 0, verified by test |

## Future features

Only after the core Christmas experience works reliably: gift budgets, "Most Wanted / Would Love / Nice to Have" preferences, gift history, birthday mode, other occasions (weddings, baby showers, anniversaries), holiday themes and shopping reminders.

## Decisions and open questions

| Question | Decision |
| --- | --- |
| Claimed gifts in the grid | Stay as opened "Taken" boxes (FR-21) |
| Christmas countdown | In v1, on the dashboard (FR-5) |
| Owner deletes a claimed gift | Reservation deleted, buyer notified (FR-13) |
| How buyers are notified | In-app notice in My Secret Gifts only; no email or messaging |
| Unique member names | Yes, within a family (FR-3) |
| Organiser removes a member | Their wish list and reservations are deleted (FR-6) |
| Lists for people without a phone | Yes, any member can add and manage one (FR-6) |
| Limit on claims per recipient | No limit (FR-24) |
| Number-to-gift mapping | Reshuffles on every visit (FR-22) |
| Released claims | Disappear from My Secret Gifts (FR-30) |
| Group types | Family, Friends, Colleagues, Something else; chosen at creation, changeable by the organiser (FR-1, FR-40) |
| Several groups on one device | Yes, with a group switcher (FR-1b) |
| Internal naming | Code and database keep `family`; users see their group's wording (FR-1a) |
| Same member on several devices | One-time device links; each device has its own session (FR-4a) |
| Replacing a lost link | Signs the member out on every device (FR-41) |

Still open:

- [ ] Can the person managing a child's list still buy gifts from it?

## Milestones

Proposed build order; the brief sets no timeline.

1. **Foundations:** schema, personal links, create and join.
2. **Wish lists:** My Wishlist with gift details and reserved-details snapshots.
3. **Mystery picker:** reveal, grid, animation, claim with conflict handling.
4. **My Secret Gifts and Family Settings.**
5. **Polish and test:** festive design, privacy checks on what the browser receives, concurrent claim tests.
6. **Family pilot:** one real family uses it before Christmas.
