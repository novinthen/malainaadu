

## Selangor Flipbook Page

Create a new `/selangor` page that displays the uploaded 15-page PDF newsletter as an interactive, mobile-friendly flipbook with Selangor flag colors.

### Approach

Since we can't run a PDF-to-flipbook library that depends on `pdfjs-dist` and canvas rendering reliably in this environment, the most robust approach is to **convert the PDF pages into images** and use a lightweight page-flip library to create the book effect.

We will:
1. Copy each of the 15 full-page screenshots (already extracted from the PDF) into the project
2. Use the `react-pageflip` library for the book-turning animation (lightweight, mobile-friendly, supports touch/swipe)
3. Build a themed page with Selangor flag colors

### Color Theme

| Color | HEX | Usage |
|-------|-----|-------|
| Red | #DA251D | Header bar, accents, navigation buttons |
| White | #FFFFFF | Page background, text on red |
| Yellow | #FCD116 | Highlights, page counter, decorative borders |

### Files to Create/Modify

**1. Copy 15 page images to `public/selangor/`**
- `page_1.jpg` through `page_15.jpg` from the parsed PDF screenshots

**2. Install dependency**
- `react-pageflip` - lightweight flipbook component with touch support

**3. New file: `src/pages/SelangorPage.tsx`**
- Full-screen flipbook viewer themed with Selangor colors
- Header with Selangor branding and red background
- Flipbook component showing all 15 pages as images
- Navigation controls: Previous / Next buttons + page indicator
- Touch/swipe support for mobile (built into react-pageflip)
- Responsive sizing: fills viewport width on mobile, constrained max-width on desktop
- Fullscreen toggle button

**4. Modify: `src/App.tsx`**
- Add route: `<Route path="/selangor" element={<SelangorPage />} />`

### Mobile-First Design

- Pages scale to fill the screen width on mobile (single-page mode)
- On desktop, shows two-page spread (book mode)
- Swipe left/right to turn pages on touch devices
- Large, easy-to-tap navigation buttons at the bottom
- Page counter shows current position (e.g., "3 / 15")
- Pinch-to-zoom not included in react-pageflip, but pages are rendered at high resolution for readability

### Technical Details

- `react-pageflip` uses `StPageFlip` engine internally with CSS 3D transforms for realistic page turns
- Images are served from `public/selangor/` for fast loading
- The component uses `useRef` to control the flipbook instance programmatically
- Single-page mode on screens under 768px, double-page mode on larger screens
- The page does NOT use MainLayout (no site header/footer) to maximize reading space, but includes a back-to-home link

