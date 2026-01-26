# Product Roadmap Instructions

## Version
- Version: 1.2
- Last Updated: 2026-01-26

---

## 0. Work Principles

### Prohibited
- No speculation, assumptions, or generic advice
- No phrases like "usually~", "generally~", "typically~"
- No priority suggestions without evidence

### Required
- Base decisions on codebase and existing documents
- Provide rationale when changing roadmap
- Work token-efficiently (minimize unnecessary explanations)

### When Uncertain
1. Stop work
2. Specify what information is needed
3. Ask the user
4. Proceed after receiving answer

---

## 1. Roadmap Structure

| Section | Definition | Timeframe |
|---------|------------|-----------|
| **Done** | Completed features | - |
| **Now** | Currently in progress | This quarter |
| **Next** | Up next | Next quarter |
| **Later** | Someday | TBD |
| **Not Doing** | Intentionally not doing | - |

### Not Doing vs Later
- **Not Doing**: Doesn't align with product direction (ex: detailed weather analysis - not competing with weather apps)
- **Later**: Low priority now but may do later (ex: user authentication)

---

## 2. Priority Criteria

Evaluate new features/ideas with these criteria:

### Priority Score (10 points max)

| Criteria | Points | Description |
|----------|--------|-------------|
| **User Value** | 3 | How much does it solve user problems? |
| **SEO Impact** | 3 | Does it contribute to traffic/keyword expansion? |
| **Implementation Difficulty** | 2 | Lower = higher score (Easy=2, Medium=1, Hard=0) |
| **Cost** | 2 | Can stay on free tier? (Yes=2, No=0) |

### Placement
- 7+ points → Consider for Now/Next
- 4-6 points → Later
- 3 or below → Consider Not Doing

---

## 3. Feature Evaluation Template

Use this format when evaluating new features:

```markdown
### [Feature Name]

**Description**: One-line description

**Evaluation**:
| Criteria | Score | Rationale |
|----------|-------|-----------|
| User Value | /3 | |
| SEO Impact | /3 | |
| Implementation Difficulty | /2 | |
| Cost | /2 | |
| **Total** | /10 | |

**Decision**: Now / Next / Later / Not Doing
**Rationale**:
```

---

## 4. Section Movement Criteria

### Now → Done
- Feature deployed
- Basic validation complete (no errors)

### Next → Now
- Current Now items 70%+ complete
- Resources available

### Later → Next
- Related metrics need improvement
- User requests accumulating
- Timing/season alignment

### Not Doing → Later
- Product direction changes
- New opportunities discovered

---

## 5. Success/Failure Criteria

### Define Success Criteria Per Feature
All Now/Next features must specify success criteria:

```markdown
**Success Criteria**:
- Metric: [What to measure]
- Target: [Specific number]
- Period: [Measurement period]
```

### Success/Failure Judgment
| Result | Criteria | Action |
|--------|----------|--------|
| Success | Target achieved | Move to Done, consider follow-up features |
| Partial Success | 50-99% of target | Improve and re-measure, or Done |
| Failure | Below 50% of target | Analyze cause → pivot or discard |

### Required Recording on Failure
- Why it failed (hypothesis error? implementation issue?)
- What was learned
- What to do next

---

## 6. Update Principles

### Update Triggers
- Feature completion
- Quarter start (review Now/Next)
- Major decisions made

### Recording Rules
- All changes recorded in Change History
- Version update (feature add: minor, structure change: major)

---

## 7. Project-Specific Context

### Current Phase
- MVP complete → Growth stage
- SEO-focused traffic acquisition is top priority

### Seasonality
- Transitional seasons (Mar-Apr, Sep-Oct): Expected traffic peak
- Travel seasons (Lunar New Year, summer vacation): Travel feature related

### Cost Principles
- Current: Free tier (zero cost)
- Change condition: Re-evaluate if traffic growth requires paid tier
- Record cost-related decisions in roadmap when changed

### Other Principles
- Keep it simple (strengthen core features over complex additions)
- SEO-friendly expansion (more pages = more keywords)

---

## Change History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2026-01-26 | Converted to English, renamed file |
| 1.1 | 2026-01-26 | Added work principles, success/failure criteria, flexible cost policy |
| 1.0 | 2026-01-26 | Initial instruction |
