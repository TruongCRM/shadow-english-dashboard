# 📋 TEMPLATE — Version Entry

> Copy the section below and paste it at the TOP of `CHANGELOG.md` (above the previous `## v...` heading).
> Fill every section. Empty sections must contain `—` not be deleted.
> See `README.md` §3 for the full workflow.

---

## How to use this template

1. **Decide version label** per `README.md` §3 Step 1.
2. **Copy from `## v...` line below all the way down to the `---` separator** at the end of this file.
3. **Paste at top of CHANGELOG.md**, immediately under the metadata header and above the previous most-recent entry.
4. **Fill in** every section, even if the value is "None" or "—".
5. **Update sibling docs** per `README.md` §3 Step 4 (ARCHITECTURE / STATE_SCHEMA / ROADMAP / TECHNICAL_NOTES / AI_HANDOFF).

---

## Example filled-in entry

A real example from `CHANGELOG.md` (the v11.1 entry) is a complete reference. Or look at v10.0, v11.1.6 for shorter/longer examples respectively.

---

## TEMPLATE BLOCK (copy from this line down)

````markdown
## v{N.M.K} — {SHORT TITLE} ({YYYY-MM-DD})

> Phase: {STABILIZE | BUILD | OBSERVE | REFACTOR | HOTFIX}

### Goal
{1–3 sentences. What is this version trying to accomplish? What problem does it solve? What does success look like?}

### Built
- `path/file.ext` — {what it does}
- `path/file2.ext` — {what it does}
- {feature without a single file home} — {description}

### Problems
- **{Symptom}:** {what the user/system observed}
  - **Root cause:** {what was actually wrong}
- **{Symptom 2}:** {…}
  - **Root cause:** {…}

(If no problems hit: write "None encountered — clean build")

### Fixes
- {How problem 1 was resolved} — verified by {evidence}
- {How problem 2 was resolved} — verified by {evidence}

### Architecture change
{One of:}
- **None** — purely additive, no existing module changed
- **{Layer name} added** — {what it does, how it integrates}
- **{Layer name} altered** — {what changed, what callers need to know}
- **{Layer A ↔ Layer B coupling changed}** — {direction, why}

### Completed features
- [x] {Feature 1} — visible at {where}
- [x] {Feature 2} — visible at {where}
- [x] {Feature 3} — backend only, callable via {API surface}

### Pending → v{NEXT}
| # | Item | Why deferred |
|---|------|--------------|
| 1 | {item} | {reason — scope / risk / dependency / awaiting observation} |
| 2 | {item} | {reason} |

(If nothing pending: write a single row "—")

### Lessons learned
1. {Insight — what would you tell your past self?}
2. {Insight — what pattern emerged?}
3. **🔥 New gotcha (G-N candidate):** {if a new gotcha worth adding to TECHNICAL_NOTES}

### Touched files
| File | Change | Notes |
|------|--------|-------|
| `path/file.js` | NEW \| EDITED \| DELETED \| RENAMED | {brief — line count delta, what changed} |
| `index.html` | EDITED | {…} |

### Deploy commits
- `abc1234` — {commit message summary}
- `def5678` — {commit message summary} (cache-bust pair, if applicable)

### Test results
{How was this verified?}
- ✅ {Test 1} — {method, outcome}
- ✅ {Test 2} — {method, outcome}
- ⚠️ {Test 3 — partial / deferred} — {reason}
- ❌ {Test 4 — failed} — {why, next step}

(For UI changes: include 1+ visual evidence — describe the screenshot or link the file.)

### State/schema changes
{One of:}
- **None** — schema unchanged
- **{key} added:** `{path.to.field}` = {type}, default {value}. See STATE_SCHEMA §X.
- **{key} migrated:** old shape `{...}` → new shape `{...}`. Migration handled in {file/function}.

### Tech debt
- **TD-N opened:** {description, severity, target version to address}
- **TD-M closed:** {how resolved}
- **TD-K still open:** unchanged from previous version

### Screenshots / flow diagrams
{Reference visual evidence — file path, commit, or description}
- {Path to screenshot, OR ASCII diagram, OR "none — no UI change"}

### Sources
- {Link to live URL with debug param if relevant}
- {Link to deploy commit}
- {Link to issue/discussion if any}

---

````

(end of template block)

---

## Quality bar — what makes a great entry

A new AI reading this entry 6 months from now should be able to:

1. **Understand WHY** this version exists in 30 seconds (Goal section)
2. **Predict what's still broken** because you wrote it in Pending (saves them from re-discovering)
3. **Avoid the same trap** because you wrote it in Problems + Lessons learned
4. **Find the code** because you listed Touched files
5. **Verify nothing regressed** because you listed Test results
6. **Decide next steps** because you listed Tech debt + linked to ROADMAP

If your entry leaves any of those blank, the engineering memory has a hole.

---

## Common mistakes to avoid

- ❌ "Fixed some bugs" — vague. **List each one + root cause + fix.**
- ❌ "Added a feature" — no traceability. **Name file, lines, integration point.**
- ❌ "No problems" — usually false. **At minimum: what surprised you?**
- ❌ Skipping the "Pending" section — **always say what was deferred and why**
- ❌ Empty Lessons learned — **if you learned nothing, the entry is too small to ship**
- ❌ Forgetting commit hashes — **future AI needs them to grep history**

---

## When to NOT use this template

This template is for **shipped versions**. Don't use it for:

- **Spike experiments** — write a `EXPERIMENT_*.md` instead
- **Failed iterations that didn't ship** — note in current version's Problems, or write `FAILURE_*.md` post-mortem
- **Pure exploration / research** — write `RESEARCH_*.md`

But if the experiment becomes the foundation for a real version, COPY its key findings into the version entry's Lessons learned.

---

*Last updated: 2026-05-26. This template itself follows the discipline: shipped without it, the memory degrades.*
