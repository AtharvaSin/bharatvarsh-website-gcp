# Bharatvarsh Marketing Strategy & User Journeys

## 1. Core Philosophy
The platform is not just a "website" but a living "World Context." Marketing is not aggressive selling, but **deepening immersion**.
**The Goal:** Move users from *Passive Observers* to *Active Citizens* of Bharatvarsh.

## 2. User Personas (The Audience)

### A. The Drifter (Top of Funnel)
-   **Behavior**: Lands on a blog post, map, or character page via social/search. Skims content.
-   **Goal**: Quick entertainment or curiosity.
-   **System Goal**: Capture email (Lead Magnet).

### B. The Seeker (Middle of Funnel)
-   **Behavior**: Reads chapters, explores the map, clicks on "Hidden Lore."
-   **Goal**: Wants to understand the deeper story/world.
-   **System Goal**: Deepen engagement (AI Chats, Gamification).

### C. The Devotee (Bottom of Funnel)
-   **Behavior**: Returns frequently, asks "Narad" complex questions, shares content.
-   **Goal**: Wants *more* (Books, Merch, Community).
-   **System Goal**: Conversion (Sales).

---

## 3. Key Marketing Funnels

### Funnel 1: The "Secret Lore" Acquisition (Lead Capture)
**Strategy:** Use the "Novel World" context as a hook.
**Trigger:** User tries to access "Classified" (S2) lore or "Locked" map regions.
**Action:**
1.  **Popup/Inline**: "This record is designated S2 (Classified). Consult Bhoomi to unlock."
2.  **Gate**: "Sign in to access Classified Context."
3.  **Result**: User registers. Architecture logs `signup_source: 'lore_gate'`.

### Funnel 2: The "Bhoomi" Nurture Loop (Engagement)
**Strategy:** Use the AI Copilot to build habit.
**Trigger:** User registers but hasn't returned in 3 days.
**Action:**
1.  **Email (Automated)**: "Bhoomi has a message. A new record regarding 'The Era of the Mesh' has been declassified."
2.  **Content**: Link to a specific Timeline Phase or Character Profile.
3.  **Result**: User clicks back. Architecture logs `event: 're_engagement_click'`.

### Funnel 3: The "Grand Reveal" (Conversion)
**Strategy:** Identify "Hot Leads" based on activity score.
**Trigger:** User Lead Score > 80 (Calculated by: +10 per chapter read, +5 per AI chat).
**Action:**
1.  **Email**: "You are among the few who truly know Bharatvarsh. The First Edition Book is available for early access."
2.  **Offer**: Exclusive link for high-score users.
3.  **Result**: Sale. Architecture logs `conversion: 'book_sale'`.

### Funnel 4: The "Halo" Effect (Referral)
**Strategy:** Gamify the experience.
**Trigger:** User unlocks a rare achievement (e.g., "Scholar of the Vedas" via AI Quiz).
**Action:**
1.  **UI**: "You discovered a hidden truth! Share this badge to unlock the next chapter early."
2.  **Mechanism**: Unique referral link.
3.  **Result**: New users (Drifters) enter the funnel.

---

## 4. Architecture Alignment (How Code Serves Strategy)

| Strategic Element | Technical Enabler (The Code) | GCP Service |
| :--- | :--- | :--- |
| **Tracking User Interest** | **Event Bus**: Captures `page_view`, `scroll_depth`, `click`. | Cloud Run / Cloud SQL |
| **Lead Scoring** | **Worker**: Async job calculates score every night. | Cloud Tasks / Cloud SQL |
| **"Bhoomi" AI Persona** | **RAG Pipeline**: Retrieves lore to answer in character. | Vertex AI / pgvector |
| **Triggering Emails** | **Workflow Engine**: Listens for Score > 80 or `signup`. | Cloud Run / Resend API |

## 5. Metrics & KPIs
1.  **Lead Velocity**: How fast does a Drifter become a Seeker? (Time to Signup).
2.  **Bhoomi Retention**: % of users who chat with AI > 3 times.
3.  **Lore Consumption**: Avg. chapters read per user.
