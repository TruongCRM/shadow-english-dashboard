# 📋 SHADOW ENGLISH — STATE & DATA SCHEMAS

> All data structures used in the system. AI tools needing to understand or migrate data should read this first.

---

## 1. APP STATE (localStorage)

**Key:** `shadow-en-state-v3`
**Format:** JSON (stringified)
**Size:** typically < 500KB per user

```typescript
{
  schema: 3,                          // Version for migrations
  user: {
    name: "Dương",
    level: 1,                         // Starts at 1
    xp: 0,                            // Current XP (resets each level up)
    xpToNext: 100,                    // Multiplies × 1.5 per level
    streak: 0,                        // Consecutive days
    lastStudyDate: null | "ISO date", // Set when any session/review completes
    createdAt: "ISO date"             // First app open
  },
  topics: [
    {
      id: "L1-01",                    // Stable ID — used by Notion sync
      emoji: "🍔",
      name: "Ordering Food & Drinks",
      level: 1,                       // 1, 2, or 3
      reviewStage: "Day 0",           // Day 0, Day 1, Day 3, Day 7, Day 21, Day 60
      memoryStatus: "Fragile",        // Fragile, Weak, Building, Stable, Automatic
      lastReview: null | "ISO date",
      nextReview: null | "ISO date",
      masteryPct: 0,                  // 0-100
      confidence: 0,                  // Last review confidence 1-5
      sessions: 0,                    // Total review/session count
      // v10 additions:
      confidenceHistory: [            // Last 20 reviews
        {
          confidence: 4,
          at: "ISO date",
          stage: "Day 1",             // Stage when this review happened
          masteryBefore: 12           // Mastery before this review
        }
      ],
      lastWeakPoint: null | "ISO date" // When confidence dropped to ≤2 twice in row
    }
  ],
  sessionsLog: [
    {
      type: "session" | "review",
      topicId: "L1-01",
      confidence: 4,                  // Only on review type
      at: "ISO date"
    }
  ],
  missions: {
    date: "Mon May 26 2026",          // Resets daily
    items: [
      { task: "Dùng 1 cụm trong bữa ăn", done: false }
    ]
  },
  currentSession: null | {            // Set when user starts session
    topicId: "L1-01",
    startedAt: "ISO date",
    step: 1                           // 1-8
  }
}
```

### Initial seed (32 topics)

When state is fresh, app seeds 32 topics:
- L1-01 to L1-12 (Level 1 — Survival, 12 topics)
- L2-01 to L2-10 (Level 2 — Social, 10 topics)
- L3-01 to L3-10 (Level 3 — Advanced, 10 topics)

All start with: `reviewStage: 'Day 0'`, `memoryStatus: 'Fragile'`, `masteryPct: 0`, `sessions: 0`.

---

## 2. CONTENT SCHEMA (content.json)

**Source:** Notion (via GitHub Action sync) OR manual edit in repo
**Schema version:** `shadow-english-content-v1`

```typescript
{
  schema: "shadow-english-content-v1",
  generatedAt: "ISO date",
  source: "notion" | "manual",
  notionDbId?: "uuid",                // If synced from Notion
  topics: {
    "L1-01": {                        // Key = Topic ID
      why: "Ăn uống là tình huống...",
      scene: "Nhà hàng, quán ăn...",
      phrases: {
        before: [
          ["English phrase", "Vietnamese translation"]
        ],
        during: [["...", "..."]],
        after: [["...", "..."]]
      },
      dialogues: [
        {
          title: "Gọi món cơ bản",
          lines: [
            ["You", "Can we see the menu?"],
            ["Staff", "Of course, here you are."]
          ]
        }
      ],
      shadow_script: "Can we see the menu please. I'd like to order...",
      missions: [
        "Order 1 món bằng tiếng Anh tại quán"
      ],
      active_recall: [
        "How do you ask for the menu?",
        "How do you ask for the bill?"
      ],
      real_english: [
        "I would like → I'd like"
      ],
      sections: [                     // v9 — Custom Content Blocks
        // See BLOCKS_GUIDE.md for full block type schemas
        { "type": "youtube", "url": "...", "title": "..." },
        { "type": "callout", "icon": "💡", "color": "yellow", "text": "..." }
      ],
      _notion_page_id?: "uuid",       // Sync metadata
      _name_canonical?: "..."
    }
  }
}
```

---

## 3. LAYOUT CONFIG (layout.json + localStorage overrides)

### Base config: `layout.json`
```typescript
{
  schema: "shadow-english-layout-v1",
  version: "1.0",
  branding: {
    appName: "Shadow English",
    appIcon: "⚡",
    userName: "Dương",
    userTitle: "Shadow Apprentice",
    tagline: "Learning Operating System",
    footerQuote: "The more you review, the more natural...",
    footerAuthor: "Shadow today, speak naturally tomorrow."
  },
  theme: {
    preset: "dark-purple",            // Selected theme key
    customColors: null                // Reserved for v11 custom themes
  },
  themes: {
    "dark-purple": {                  // Theme key
      name: "Dark Purple (default)",
      bg: "#0d0b1f",
      card: "#1a1838",
      primary: "#7c5cff",
      accent: "#ec4899"
    },
    "dark-blue": {...},
    "dark-green": {...},
    "dark-orange": {...},
    "midnight": {...}
  },
  sections: [
    {
      id: "questions-5",
      title: "5 CÂU HỎI HÔM NAY",
      icon: "❓",
      enabled: true,
      order: 1,                       // 1-16, used for CSS `order` property
      span: 5                         // grid-column: span N
    }
    // ... 15 more sections
  ],
  features: {
    showFooterQuote: true,
    showInstallPWA: true,
    showCoach: true,
    showXPbar: true,
    showLevelBadge: true,
    compactMode: false
  }
}
```

### User overrides: `localStorage["shadow-en-layout-overrides"]`
**Same shape as layout.json but only changed fields.** Merged on load.

---

## 4. NOTION DATABASE SCHEMA (Topics DB)

**Database ID:** `37aafd9415a940e4a9c054794fcd0ec5`
**Data source URL:** `collection://b8c8cbce-2a07-4587-924f-a79dc9d85743`

| Property | Type | Used by sync | Notes |
|---|---|---|---|
| Topic Name | Title | ✓ | Display name |
| Topic ID | Rich text | ✓ | Stable key (L1-01, L2-05, etc.) |
| Level | Select | (state seeded) | 🔵 Level 1 / 🟢 Level 2 / 🟣 Level 3 |
| Status | Select | — | ⬜ Not Started / 🟡 In Progress / ✅ Completed |
| Memory Status | Select | (state computed) | 🟥/🟧/🟨/🟩/🟦 |
| Review Stage | Select | (state computed) | Day 0/1/3/7/21/60 |
| Last Review | Date | — | (state tracks this) |
| Next Review | Date | — | (state tracks this) |
| Progress | Number (%) | — | (state.masteryPct) |
| Confidence Score | Number | — | (state.confidence) |
| Shadowing Count | Number | — | (state.sessions) |
| Why | Rich text | ✓ | Lý do học topic này |
| Scene | Rich text | ✓ | Bối cảnh |
| Phrases Before | Rich text | ✓ | Mỗi dòng: `English — Vietnamese` |
| Phrases During | Rich text | ✓ | Same format |
| Phrases After | Rich text | ✓ | Same format |
| Dialogues | Rich text | ✓ | First line = title, then `Speaker: line`. Blank line separates dialogues |
| Shadow Script | Rich text | ✓ | Free text |
| Real Life Missions | Rich text | ✓ | One per line |
| Active Recall | Rich text | ✓ | One question per line |
| Real English | Rich text | ✓ | Native shortcuts |
| Custom Blocks | Rich text | ✓ | JSON array OR plain-text fallback format |
| Category | Rich text | — | (Reserved) |

---

## 5. BLOCK TYPE SCHEMAS (v9 Custom Content Blocks)

See `BLOCKS_GUIDE.md` for full reference. Quick schema:

```typescript
type Block =
  | { type: "youtube" | "vimeo", url: string, title?: string, caption?: string }
  | { type: "image", src: string, caption?: string, alt?: string, title?: string }
  | { type: "audio", src: string, title?: string, caption?: string }
  | { type: "pdf", src: string, title?: string }
  | { type: "quote", text: string, author?: string }
  | { type: "callout", text: string, icon?: string, color?: "purple"|"blue"|"green"|"yellow"|"orange"|"red"|"pink", title?: string }
  | { type: "tips", items: string[], title?: string }
  | { type: "ai-prompt", prompt: string, title?: string, tools?: Array<{name:string,url:string}> }
  | { type: "note", text: string, title?: string }
  | { type: "checklist", items: string[], title?: string }
  | { type: "exercise", question: string, answer: string, title?: string, options?: string[] }
  | { type: "embed", url: string, title?: string, height?: number }
  | { type: "link", url: string, title: string, description?: string, image?: string }
  | { type: "heading", text: string, level?: 2|3 }
  | { type: "divider" }
  | { type: "spacer", height?: number }
  | { type: "html", html: string };

// All blocks support: { visible?: boolean } — false to hide without delete
```

---

## 6. OTHER LOCALSTORAGE KEYS

| Key | Purpose |
|---|---|
| `shadow-en-state-v3` | Main app state |
| `shadow-en-layout-overrides` | UI customizations |
| `shadow-en-checks-{topicId}-{blockIndex}` | Per-block checklist state |
| `shadow-en-celebrated-first-auto` | Flag — first Automatic celebration |
| `shadow-en-state-vN` (future) | Versioned state for migrations |

---

## 7. MIGRATIONS

### v3 → v10 (current)
- Topics added `confidenceHistory: []` field — initialized lazily in `applyReview()`
- Topics added `lastWeakPoint: null | ISO` — set conditionally

### Future migration pattern
```js
function migrate(oldState) {
  if (!oldState.schema || oldState.schema < 3) return seedState(); // Fresh start
  if (oldState.schema === 3) {
    oldState.topics.forEach(t => {
      if (!t.confidenceHistory) t.confidenceHistory = [];
    });
    oldState.schema = 4;
  }
  return oldState;
}
```

---

*Last update: 2026-05-26 (v10)*
