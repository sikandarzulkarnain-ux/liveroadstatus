# LiveRoadStatus — MASTER PROJECT RULE

## MULTI-AGENT ARCHITECTURE

This project uses four specialist agents coordinated by the Main Agent.
Before starting any task, read `workflows/orchestrate.md` to determine
which agent(s) to activate and in what order.

| Agent | Domain |
|---|---|
| `frontend-agent` | Homepage, navigation, pass browser, pass detail, maps, UI, CSS |
| `data-agent` | DOT APIs, weather APIs, pass data, status engine, source monitoring |
| `seo-agent` | Sitemap, metadata, schema, internal linking, indexability |
| `qa-agent` | Browser testing, mobile testing, broken links, API failures, regression |

---

## PASS DATA STANDARDS

Every pass must include:
- official source
- webcams
- alerts
- historical information
- FAQs

---

## PERFORMANCE

Prioritize:
- Core Web Vitals
- fast loading
- optimized images
- caching
- minimal JavaScript
- responsive design
- CDN
- efficient API requests

---

## ACCESSIBILITY

Use:
- semantic HTML
- keyboard navigation
- accessible labels
- visible focus states
- good contrast
- descriptive alt text

Never communicate status using color alone.

Always use labels alongside colors:

```
OPEN
CAUTION
CLOSED
UNKNOWN
```

---

## DEVELOPMENT

Before modifying code:
1. Inspect the existing implementation.
2. Reuse existing components.
3. Avoid unnecessary rewrites.
4. Identify affected files.
5. Create an implementation plan.
6. Activate the correct agent skill(s) from `workflows/orchestrate.md`.

After modifying code:
1. Run lint.
2. Run tests.
3. Run build.
4. Start the application.
5. Test in browser (activate `qa-agent`).
6. Test desktop.
7. Test mobile.
8. Check console errors.
9. Check network/API errors.
10. Check SEO impact.
11. Fix problems.
12. Review git diff.

Never claim something works without actually testing it.
