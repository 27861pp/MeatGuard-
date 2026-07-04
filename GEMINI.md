# GEMINI.md

# MEAT GUARD Development Rules

## Objective

Your mission is to make the website fully functional while preserving the existing design.

The current UI/UX has already been approved.

DO NOT redesign, simplify, modernize, or replace the interface.

Your task is to improve functionality only.

---

# Highest Priority Rules

## NEVER change

- Overall Layout
- UI Design
- UX Flow
- Color Palette
- Typography
- Button Position
- Card Position
- Component Size
- Margin
- Padding
- Spacing
- Border Radius
- Shadow
- Animation Timing
- Responsive Breakpoints
- Existing Icons
- Existing Images
- Existing Navigation
- Existing Page Structure

If something already exists visually,
keep it exactly the same.

---

## ONLY Improve

Allowed:

- Fix bugs
- Complete unfinished code
- Connect backend
- Connect database
- Authentication
- API Integration
- Firebase
- Supabase
- Google Login
- Error handling
- Loading state
- Performance optimization
- Accessibility
- Security
- SEO
- State management
- Caching
- Data validation
- Image optimization
- Lazy loading
- Routing
- Database queries

---

# UI Preservation Policy

Before editing any file:

1. Understand existing UI
2. Preserve every component
3. Preserve styling
4. Preserve spacing
5. Preserve interaction
6. Preserve animation
7. Preserve responsiveness

If functionality requires changes,

implement them internally,

NOT visually.

---

# Forbidden Actions

Never:

- Rewrite pages
- Replace layouts
- Replace framework
- Remove components
- Simplify UI
- Create a new design
- Replace CSS with another design
- Change Tailwind classes for appearance
- Change fonts
- Change colors
- Change border radius
- Change animation style
- Move buttons
- Resize cards
- Rearrange sections
- Rename pages unnecessarily

---

# Functional Development

You should complete all missing features.

Including:

✔ Authentication

- Google Login
- Session
- Logout
- Protected Routes

✔ Database

- CRUD
- Validation
- Security Rules

✔ Dashboard

- Dynamic Data
- Statistics
- Loading
- Empty States

✔ API

- Proper Error Handling
- Retry
- Timeout
- Secure Requests

✔ Forms

- Validation
- Error Messages
- Success Messages

✔ AI Features

- Working API Calls
- Proper Responses
- Loading Indicator

✔ Image Upload

- Compression
- Validation
- Preview

✔ Monitoring

- Real-time Updates
- Auto Refresh
- Proper State Sync

---

# Code Quality

Write production-ready code.

Requirements:

- Clean Architecture
- SOLID
- DRY
- KISS
- Type Safety
- Reusable Components
- Proper Folder Structure
- Error Boundaries
- Logging
- Comments only when necessary

---

# Performance

Always optimize.

Target:

- Lighthouse 95+
- Fast Initial Load
- Lazy Loading
- Code Splitting
- Memoization
- Tree Shaking
- Optimized Images

---

# Security

Implement:

- XSS Protection
- CSRF Protection
- Input Validation
- Authentication Guards
- Authorization
- Environment Variables
- Secret Management
- Rate Limiting
- Secure Headers

Never expose secrets.

---

# Accessibility

Follow WCAG AA.

Implement:

- Keyboard Navigation
- Focus States
- Screen Reader Labels
- Semantic HTML
- Proper Contrast

Without changing appearance.

---

# Mobile

The website must work perfectly on:

- Desktop
- Laptop
- Tablet
- Mobile

Do NOT redesign responsive layouts.

Only fix broken responsiveness.

---

# Existing Components

Every existing component must remain.

Improve only:

- Logic
- Performance
- Stability
- Reliability

---

# Before Every Edit

Ask yourself:

Will this change alter the UI?

If YES:

Do NOT implement it.

Find another solution.

---

# Final Validation

Before completing:

- All pages work
- No console errors
- No TypeScript errors
- No build errors
- No broken links
- No runtime errors
- Authentication works
- Database works
- APIs work
- Responsive works
- UI unchanged
- UX unchanged

---

# Definition of Success

Success means:

The website looks IDENTICAL to the current version,

but every feature works correctly,

is production-ready,

secure,

fast,

maintainable,

and scalable.

If forced to choose between

"better functionality"

or

"changing the design",

ALWAYS preserve the design.

UI consistency has higher priority than redesign.

End of instructions.