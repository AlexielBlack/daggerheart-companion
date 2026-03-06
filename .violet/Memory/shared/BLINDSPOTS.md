# BLINDSPOTS — Daggerheart Companion

Append-only log of recurring cognitive patterns, systemic risks, and areas requiring vigilance.

---

## 2026-03-06 12:00 — Violet (initialized from project history)

### Data Fabrication Tendency
**Pattern:** AI agents tend to generate plausible-looking game data rather than admitting uncertainty
**Risk:** High — incorrect SRD data destroys user trust
**Mitigation:** Mandatory PDF verification. Data agent has explicit "never invent" guardrail.

### Over-Confidence in Generated Code
**Pattern:** Code is assumed correct after writing, without systematic verification
**Risk:** Moderate — subtle bugs in store logic or computed properties
**Mitigation:** Testing agent runs targeted tests after every implementation

### French/English Context Switching
**Pattern:** Mixing languages can cause glossary mismatches and inconsistent naming
**Risk:** Low-Moderate — glossary false positives, confusing variable names
**Mitigation:** Clear convention: French for content/comments, English for code identifiers

### Homebrew Schema Drift
**Pattern:** New homebrew categories may not follow established `FIELD_TYPES` patterns
**Risk:** Moderate — inconsistent editor/preview behavior across categories
**Mitigation:** Data agent validates all new schemas against factory pattern

### PWA Cache Staleness
**Pattern:** Service Worker updates may not propagate to all cached resources
**Risk:** Moderate — users see outdated content after deployment
**Mitigation:** DevOps agent verifies cache versioning on each deploy
