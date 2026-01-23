# Ralph News Backlog

Tasks for the Ralph loop to work through. Ordered by priority.

## Legend
- `[ ]` - Not started
- `[~]` - In progress
- `[x]` - Complete
- `[!]` - Blocked (see notes)

---

## High Priority

### Core Features
- [ ] Add search functionality to commits page (filter by keyword)
- [ ] Add pagination to commits page (load more button or infinite scroll)
- [ ] Add "last updated" timestamp showing when data was fetched
- [ ] Create a stats dashboard page showing distribution trends
- [ ] Add RSS feed for non-stats commits (`/feed.xml`)

### Data & Content
- [ ] Fetch and display repo stargazers count
- [ ] Show commit frequency chart (commits per day/week)
- [ ] Add "QE Progress" indicator from README stats
- [ ] Display holder tier information from docs

---

## Medium Priority

### UI/UX Improvements
- [ ] Add loading skeletons while data fetches
- [ ] Add smooth scroll-to-top button
- [ ] Improve mobile navigation (hamburger menu)
- [ ] Add keyboard shortcuts (j/k to navigate commits)
- [ ] Add toast notifications for actions
- [ ] Animate commit cards on load (stagger effect)

### Design Polish
- [ ] Add subtle background pattern/texture
- [ ] Improve typography hierarchy
- [ ] Add hover states to all interactive elements
- [ ] Create custom 404 page
- [ ] Add favicon and apple-touch-icon
- [ ] Create Open Graph image for social sharing

### SEO & Performance
- [ ] Add structured data (JSON-LD) for commits
- [ ] Optimize images with next/image
- [ ] Add sitemap.xml generation
- [ ] Improve meta descriptions per page

---

## Low Priority

### Nice to Have
- [ ] Dark/light mode toggle
- [ ] Add copy-to-clipboard for commit SHAs
- [ ] Bookmark/favorite commits (localStorage)
- [ ] Compare two commits side by side
- [ ] Add email notification signup (placeholder UI)
- [ ] Twitter embed for @fed_USD1 feed
- [ ] Add confetti animation for milestone commits

### Developer Experience
- [ ] Add ESLint rules for consistency
- [ ] Set up Prettier config
- [ ] Add basic component tests
- [ ] Create Storybook for components
- [ ] Add GitHub Actions for CI/CD

---

## Completed

_Tasks move here when done_

- [x] Initial site setup with Next.js 16
- [x] Create commit feed with category filtering
- [x] Add documentation browser
- [x] Implement government-style design theme
- [x] Create about page with README content
- [x] Hide stats commits by default

---

## Ideas / Future

_Ideas to consider later_

- [ ] WebSocket for real-time commit updates
- [ ] Integration with Solana for live on-chain stats
- [ ] Community contribution system
- [ ] Leaderboard of top contributors
- [ ] AI-generated commit summaries
