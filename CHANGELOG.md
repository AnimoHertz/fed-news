# Changelog

All notable changes to ralph-news, tracked by the Ralph loop.

## Format

```
## [Iteration N] - YYYY-MM-DD

### Added/Changed/Fixed
- Description of change

### Technical
- Implementation details

### Next
- Suggested next task
```

---

## [Iteration 0] - 2026-01-22

### Added
- Initial ralph-news site created
- Home page with hero section and live distribution stats
- Commits page with category filtering (Website, Research, Ops, Twitter, Docs)
- Documentation browser pulling from ralph repo's /docs folder
- About page with full README content
- Government-style dark theme (navy, gold accents, serif headings)

### Technical
- Next.js 16.1.4 with App Router
- React 19.2.3
- Tailwind CSS v4
- ISR with 60-second revalidation for commits
- GitHub API integration for commits and docs

### Components Created
- Header, Footer (layout)
- HeroSection (home)
- CommitCard, CommitFeed, CommitFilters (commits)
- CategoryBadge, StatusBadge, Card (ui)

### Next
- Add search functionality to commits page
