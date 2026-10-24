# LiveRoadStatus — MULTI-AGENT ORCHESTRATION

This workflow defines how the Main Agent coordinates the four specialist agents.
Read this when you receive any task for LiveRoadStatus to determine which agent(s)
to activate and in what order.

---

## THE TEAM

```
         YOU (MAIN AGENT)
               │
     ┌─────────┼─────────┐
     │         │         │
 FRONTEND    DATA       SEO
  AGENT      AGENT     AGENT
     │         │         │
     └─────────┼─────────┘
               │
              QA
             AGENT
```

---

## DISPATCH RULES

### → FRONTEND AGENT
Activate for:
- Homepage changes (layout, sections, hero, search)
- Navigation changes (Header, Footer, routing)
- Pass browser UI (PassesPage, filters, cards)
- Pass detail page layout
- Map rendering issues (Leaflet, MapComponent, MapPage)
- HierarchicalPage UI / navigation
- CSS issues (layout, overflow, responsive, mobile)
- Broken images in the UI layer
- Any React component change

Skill: `frontend-agent`

---

### → DATA AGENT
Activate for:
- Pass status updates (OPEN / CAUTION / CLOSED / UNKNOWN)
- New pass data entry
- Weather data changes
- Official source URL updates or corrections
- API integration (DOT, weather APIs)
- Data normalization
- `src/data/` or `src/services/` changes
- Data integrity audit
- Stale data handling

Skill: `data-agent`

---

### → SEO AGENT
Activate for:
- Title or meta description changes
- Canonical URL fixes
- Sitemap updates
- Schema / structured data
- robots.txt changes
- Internal link audits
- Breadcrumb schema
- Open Graph / Twitter Card changes
- Page indexability questions

Skill: `seo-agent`

---

### → QA AGENT
Activate for:
- Any time a feature is declared complete
- Full site regression test
- User journey testing (navigation flows)
- Mobile layout verification
- Console error audit
- Broken image audit
- Horizontal overflow check
- API failure testing
- After every fix — retest affected area

Skill: `qa-agent`

---

## STANDARD PIPELINE

For most feature requests, run this pipeline:

```
1. DATA AGENT    → ensure data is correct for the feature
2. FRONTEND AGENT → implement the UI / component change
3. SEO AGENT     → check metadata and schema impact
4. QA AGENT      → verify everything works end-to-end
```

For data-only changes:
```
1. DATA AGENT → make the change
2. QA AGENT   → verify display is correct in browser
```

For SEO-only changes:
```
1. SEO AGENT → make the change
2. QA AGENT  → verify no regressions
```

For UI-only fixes (CSS, layout, overflow):
```
1. FRONTEND AGENT → fix
2. QA AGENT       → verify desktop + mobile
```

---

## ESCALATION RULES

- If QA finds a CRITICAL issue: stop, escalate to the owning agent, fix, re-run QA.
- If DATA AGENT finds conflicting sources: set `UNKNOWN`, flag to user, do not fabricate.
- If FRONTEND AGENT discovers a missing data field: escalate to DATA AGENT first.
- If SEO AGENT needs a new route: escalate to FRONTEND AGENT first.
- Never declare a task DONE without QA sign-off.

---

## WHAT NEVER TO DO

- Never fabricate pass status, closures, weather, or road data.
- Never add App Store / Google Play / phone mockups.
- Never use color alone to communicate status (always include OPEN / CAUTION / CLOSED text).
- Never re-initialize a Leaflet map on an existing DOM node.
- Never produce thin AI content pages.
- Never claim something works without browser testing it.
