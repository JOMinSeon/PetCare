# Phase 1 Plan: Design System Alignment

**Created:** 2026-04-14  
**Phase:** 1 of N  
**Type:** Design modification (visual refinements, no new features)

---

## Overview

Align the VetClinic landing page with the reference design's characteristics:
- Modern, warm, pet-friendly aesthetic
- Soft pastel colors
- Rounded forms
- Pet imagery integration
- Service-focused sections
- Customer testimonials
- Visible contact options

This phase focuses on CSS/design token changes and component refactoring that doesn't alter functionality.

---

## Design Elements to Change

### 1. Color Palette — Softer Pastel Tones

**Current state:** Coral primary is vibrant/strong
**Target:** More muted, warm pastels

| Token | Current | Target |
|-------|---------|--------|
| `--color-primary-50` | `#FFF4F1` | `#FFF7F5` (warmer) |
| `--color-primary-100` | `#FFEBE6` | `#FFEEE9` |
| `--color-primary-400` | `#FF7A64` | `#E8A599` (softer coral) |
| `--color-primary-500` | `#E8604A` | `#D4847A` |
| `--color-primary-600` | `#CC4A35` | `#B87068` |
| `--color-secondary-400` | `#8FAF7A` | `#A8C098` (softer moss) |
| `--color-secondary-500` | `#6B9455` | `#8AAE7A` |
| `--color-accent-400` | `#F4A261` | `#E8C4A0` (softer amber) |
| `--color-accent-500` | `#E07B3A` | `#D4A88A` |

### 2. Border Radius — More Rounded

**Current:** `--radius-xl: 1.5rem`, `--radius-2xl: 2rem`  
**Target:** Increase to match reference's soft, pillowy feel

| Token | Current | Target |
|-------|---------|--------|
| `--radius-xl` | `1.5rem` | `2rem` |
| `--radius-2xl` | `2rem` | `2.5rem` |
| `--radius-full` | `9999px` | Keep full |

### 3. Shadows — Softer, Warmer

**Current:** Coral-tinted shadows  
**Target:** Neutral warm shadows

| Token | Current | Target |
|-------|---------|--------|
| `--shadow-sm` | `rgba(232,96,74,0.08)` | `rgba(180,140,120,0.08)` |
| `--shadow-md` | `rgba(232,96,74,0.12)` | `rgba(180,140,120,0.10)` |
| `--shadow-lg` | `rgba(232,96,74,0.18)` | `rgba(180,140,120,0.15)` |

### 4. Feature Cards — Add Pet Imagery & Soft Borders

**Changes:**
- Add placeholder image area to each feature card
- Use soft gradient borders instead of solid borders
- Add subtle inner glow effect

### 5. Landing Page Sections — Add Missing Reference Elements

**Add:**
- Pet photo gallery section (grid of happy pet images)
- Customer testimonials section with soft card design
- Make contact/phone CTA more prominent in header

**Modify:**
- Hero section: Replace decorative blobs with soft gradient overlays
- Use real pet placeholder images instead of emoji

---

## Files to Modify

### CSS/Design Tokens
| File | Changes |
|------|---------|
| `app/globals.css` | Update color palette, radius tokens, shadow tokens |

### Components
| File | Changes |
|------|---------|
| `app/(public)/landing/page.tsx` | Restructure sections, add testimonials/gallery |
| `app/(public)/landing/MobileMenu.tsx` | Soften button styles |
| `components/NavBar.tsx` | Make CTA more visible |

### New Components to Create
| File | Purpose |
|------|---------|
| `components/TestimonialCard.tsx` | Reusable testimonial card |
| `components/PetGallery.tsx` | Photo gallery grid |
| `components/ContactCTA.tsx` | Prominent contact button |

---

## Specific CSS/Component Changes

### globals.css — Token Updates

```css
/* Primary — Softer Coral */
--color-primary-50:  #FFF7F5;
--color-primary-100: #FFEEE9;
--color-primary-400: #E8A599;
--color-primary-500: #D4847A;
--color-primary-600: #B87068;

/* Secondary — Softer Moss Green */
--color-secondary-400: #A8C098;
--color-secondary-500: #8AAE7A;
--color-secondary-600: #6E8E60;

/* Accent — Softer Amber */
--color-accent-400: #E8C4A0;
--color-accent-500: #D4A88A;

/* Border Radius */
--radius-xl:   2rem;
--radius-2xl:  2.5rem;

/* Shadows — Neutral warm */
--shadow-sm:   0 1px 3px rgba(180,140,120,0.08), 0 1px 2px rgba(180,140,120,0.04);
--shadow-md:   0 4px 16px rgba(180,140,120,0.10), 0 2px 6px rgba(180,140,120,0.06);
--shadow-lg:   0 12px 40px rgba(180,140,120,0.15), 0 4px 12px rgba(180,140,120,0.08);
```

### Landing Page — Section Additions

**Add before CTA Section:**
```tsx
{/* ── Testimonials Section ── */}
<section className="py-24 sm:py-32" style={{ background: 'var(--color-surface-2)' }}>
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    {/* Section header */}
    <div className="text-center mb-16">
      <div className="section-badge mb-4">이용 후기</div>
      <h2>반려동물 부모들이 말해요</h2>
    </div>
    {/* Testimonial cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TestimonialCard {...} />
      <TestimonialCard {...} />
      <TestimonialCard {...} />
    </div>
  </div>
</section>

{/* ── Pet Gallery Section ── */}
<section className="py-24 sm:py-32" style={{ background: 'var(--color-bg)' }}>
  {/* Grid of happy pet photos */}
  <PetGallery />
</section>
```

**NavBar — Add Contact CTA:**
```tsx
{/* Desktop CTA */}
<div className="hidden lg:flex items-center gap-3">
  <Link
    href="tel:0507-1305-7196"
    className="flex items-center gap-2 text-sm font-semibold"
    style={{ color: 'var(--color-secondary-500)' }}
  >
    <Phone size={14} />
    0507-1305-7196
  </Link>
  <Link href="/auth/login">...</Link>
</div>
```

---

## Verification Steps

### 1. Visual Verification
- [ ] Landing page loads without errors
- [ ] Colors appear softer/more pastel
- [ ] All border radiuses are visibly softer
- [ ] Shadows appear warm-neutral (not coral-tinted)
- [ ] New sections (testimonials, gallery) render correctly

### 2. Responsive Verification
- [ ] Mobile view: hamburger menu works
- [ ] Mobile view: new sections stack properly
- [ ] Tablet view: 2-column layouts work
- [ ] Desktop view: full layouts render

### 3. Functional Verification
- [ ] All navigation links work
- [ ] Auth buttons navigate correctly
- [ ] Phone CTA is clickable on mobile
- [ ] Dark mode toggle works (if applicable)

### 4. Cross-Browser Verification
- [ ] Chrome latest
- [ ] Safari latest
- [ ] Firefox latest
- [ ] Edge latest

---

## Out of Scope for Phase 1

- Backend/API changes
- Database schema changes
- New feature functionality
- Authentication flow changes
- Mobile app changes

---

## Dependencies

None — Phase 1 is purely visual/CSS changes.

---

## Estimated Complexity

**Low** — Primarily CSS variable updates and component restructuring on landing page.
