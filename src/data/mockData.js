/**
 * AccessAble Central Mock Data Store
 * 
 * NOTICE:
 * This data is realistic DEMONSTRATION MOCK DATA engineered for testing and
 * UI/UX evaluation independent of a live scanning backend.
 * No real website was crawled or altered during this demonstration.
 */

export const MOCK_SCAN_METADATA = {
  isDemonstrationMockData: true,
  disclaimer: "Demonstration audit data for testing UI/UX and remediation workflows. Connect your API in services/api.js for live production audits.",
  scanId: "scan-2026-0492-acc",
  timestamp: "2026-11-05T03:30:00Z",
  targetUrl: "https://shopflow-demo.store",
  repoUrl: "https://github.com/shopflow-org/storefront",
  standard: "WCAG 2.2 Level AA",
  auditEngine: "AccessAble Core v2.4 (Simulated Engine)",
  pagesScanned: 16,
  domNodesAudited: 4280,
  durationSeconds: 14.2,
};

// Complete list of 25 realistic WCAG 2.2 violations for ShopFlow Storefront:
// 4 Critical + 7 Serious + 9 Moderate + 5 Minor = 25 Total
export const MOCK_VIOLATIONS = [
  // --- CRITICAL (4) ---
  {
    id: "VIOL-001",
    title: "Interactive touch target size below 24x24px threshold",
    severity: "critical",
    wcagCriterion: "2.5.8 Target Size (Minimum)",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Target Size (2.2)",
    pageUrl: "https://shopflow-demo.store/cart",
    elementSelector: "button.cart-item-remove",
    affectedHtml: `<button class="cart-item-remove" style="width: 14px; height: 14px; padding: 0;">
  <svg class="icon-trash" width="12" height="12">...</svg>
</button>`,
    proposedFixHtml: `<button class="cart-item-remove min-w-[24px] min-h-[24px] p-2 flex items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-blue-600" aria-label="Remove organic cotton t-shirt from shopping cart">
  <svg class="icon-trash" width="16" height="16" aria-hidden="true">...</svg>
</button>`,
    explanation: "WCAG 2.2 Success Criterion 2.5.8 requires pointer targets to be at least 24 by 24 CSS pixels, unless an inline link or sufficient spacing is provided. Targets smaller than this cause frequent miss-taps for users with motor tremors or mobile touchscreen users.",
    recommendedSolution: "Expand the clickable bounding box to at least 24x24px using padding or CSS min-width/min-height properties, and attach an accessible aria-label identifying the item being removed.",
    impactScore: 10,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-002",
    title: "Primary checkout submit button missing accessible name",
    severity: "critical",
    wcagCriterion: "1.1.1 Non-text Content",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Forms & Controls",
    pageUrl: "https://shopflow-demo.store/checkout",
    elementSelector: "form#checkout-form > button.btn-pay",
    affectedHtml: `<button class="btn-pay">
  <svg class="lock-shield-icon">...</svg>
</button>`,
    proposedFixHtml: `<button type="submit" class="btn-pay flex items-center gap-2" aria-label="Pay $89.00 and complete order">
  <svg class="lock-shield-icon" aria-hidden="true" focusable="false">...</svg>
  <span>Complete Order ($89.00)</span>
</button>`,
    explanation: "Screen readers announce this critical transactional element as simply 'Button' with no label or intent. Users who are blind or use text-to-speech cannot determine what action this button triggers.",
    recommendedSolution: "Add descriptive visible text or an aria-label attribute specifying the monetary amount and transaction intent, and hide the decorative SVG from the accessibility tree.",
    impactScore: 12,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-003",
    title: "Modal dialog creates keyboard focus trap without ESC release",
    severity: "critical",
    wcagCriterion: "2.1.2 No Keyboard Trap",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Keyboard & Focus",
    pageUrl: "https://shopflow-demo.store/products/12",
    elementSelector: "div#newsletter-discount-modal",
    affectedHtml: `<div id="newsletter-discount-modal" class="modal-backdrop">
  <div class="modal-box">
    <h3>Get 15% Off</h3>
    <input type="email" placeholder="Your email" />
    <button>Subscribe</button>
  </div>
</div>`,
    proposedFixHtml: `<div id="newsletter-discount-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" class="modal-backdrop">
  <div class="modal-box">
    <h3 id="modal-heading">Get 15% Off</h3>
    <label for="newsletter-email" class="sr-only">Email address</label>
    <input id="newsletter-email" type="email" placeholder="Your email" />
    <button type="submit">Subscribe</button>
    <button type="button" aria-label="Close newsletter offer" onClick="closeModal()">Close</button>
  </div>
</div>`,
    explanation: "When this marketing overlay appears, keyboard focus is not bound properly and users cannot escape or return focus to the underlying page, trapping them indefinitely.",
    recommendedSolution: "Add role='dialog', aria-modal='true', trap focus within modal elements, and support the standard Escape key dismiss handler with focus restoration.",
    impactScore: 12,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-004",
    title: "Text contrast ratio (2.9:1) fails minimum 4.5:1 requirement",
    severity: "critical",
    wcagCriterion: "1.4.3 Contrast (Minimum)",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Color & Contrast",
    pageUrl: "https://shopflow-demo.store/pricing",
    elementSelector: "span.text-muted-plan-disclaimer",
    affectedHtml: `<span class="text-muted-plan-disclaimer" style="color: #94A3B8; background: #FFFFFF;">
  * Billed annually. Taxes may apply based on region.
</span>`,
    proposedFixHtml: `<span class="text-muted-plan-disclaimer" style="color: #475569; background: #FFFFFF;">
  * Billed annually. Taxes may apply based on region.
</span>`,
    explanation: "Color #94A3B8 against pure white (#FFFFFF) yields a contrast ratio of only 2.92:1, significantly below the WCAG AA minimum requirement of 4.5:1 for normal body text. Users with low contrast sensitivity will struggle to read these billing terms.",
    recommendedSolution: "Darken the foreground color to at least #475569 or #334155 to achieve a 5.6:1 contrast ratio that comfortably satisfies WCAG AA.",
    impactScore: 9,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },

  // --- SERIOUS (7) ---
  {
    id: "VIOL-005",
    title: "Drag-and-drop file upload lacks single-pointer alternative",
    severity: "serious",
    wcagCriterion: "2.5.7 Dragging Movements",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Forms & Controls",
    pageUrl: "https://shopflow-demo.store/account/returns",
    elementSelector: "div.receipt-dropzone",
    affectedHtml: `<div class="receipt-dropzone" ondrop="handleDrop(event)">
  <p>Drag and drop receipt image here to upload</p>
</div>`,
    proposedFixHtml: `<div class="receipt-dropzone">
  <p>Drag and drop receipt image here, or</p>
  <label for="receipt-file-input" class="inline-block px-3 py-1.5 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
    Browse Files
  </label>
  <input id="receipt-file-input" type="file" accept="image/*,.pdf" class="sr-only" onChange="handleFile(event)" />
</div>`,
    explanation: "WCAG 2.2 Success Criterion 2.5.7 specifies that any function requiring a dragging movement must have an alternative achieved with a single pointer tap or click without dragging.",
    recommendedSolution: "Provide an accessible file browser button alongside the drag area that can be activated with a simple single click or keypress.",
    impactScore: 8,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-006",
    title: "Checkout form requires redundant re-entry of shipping data",
    severity: "serious",
    wcagCriterion: "3.3.7 Redundant Entry",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Understandable",
    category: "Forms & Controls",
    pageUrl: "https://shopflow-demo.store/checkout/billing",
    elementSelector: "fieldset#billing-address-fields",
    affectedHtml: `<fieldset id="billing-address-fields">
  <legend>Billing Address</legend>
  <input name="bill_street" placeholder="Street Address" />
  <input name="bill_city" placeholder="City" />
</fieldset>`,
    proposedFixHtml: `<fieldset id="billing-address-fields">
  <legend>Billing Address</legend>
  <div class="mb-3">
    <input type="checkbox" id="same-as-shipping" checked onChange="copyShippingAddress(event)" />
    <label for="same-as-shipping" class="ml-2 font-medium">Same as shipping address</label>
  </div>
  <input id="bill_street" name="bill_street" autocomplete="billing address-line1" />
  <input id="bill_city" name="bill_city" autocomplete="billing address-level2" />
</fieldset>`,
    explanation: "WCAG 2.2 Success Criterion 3.3.7 requires that information previously entered by or provided to the user in the same session is either auto-populated or available for the user to select, reducing cognitive friction.",
    recommendedSolution: "Add a 'Same as shipping address' checkbox that auto-populates the billing address fields, and include standard autocomplete attributes.",
    impactScore: 7,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-007",
    title: "Custom navigation buttons lack visible focus indicators",
    severity: "serious",
    wcagCriterion: "2.4.7 Focus Visible",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Keyboard & Focus",
    pageUrl: "https://shopflow-demo.store/",
    elementSelector: "nav.main-nav button.tab-item",
    affectedHtml: `<button class="tab-item" style="outline: none;">
  Collections
</button>`,
    proposedFixHtml: `<button class="tab-item focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
  Collections
</button>`,
    explanation: "Focus outlines were removed via 'outline: none' without supplying an alternative visual indicator. Sighted keyboard navigators lose track of where their cursor is positioned on the page.",
    recommendedSolution: "Use CSS :focus-visible to provide a high-contrast focus ring with outline-offset for keyboard users while keeping mouse clicks clean.",
    impactScore: 8,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-008",
    title: "Help contact link not consistently located across pages",
    severity: "serious",
    wcagCriterion: "3.2.6 Consistent Help",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Understandable",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/catalog",
    elementSelector: "footer.site-footer",
    affectedHtml: `<footer class="site-footer">
  <p>&copy; 2026 ShopFlow Inc.</p>
</footer>`,
    proposedFixHtml: `<footer class="site-footer">
  <div class="support-channel" role="region" aria-label="Customer Support">
    <a href="/help" class="text-blue-600 underline">Contact Support &amp; FAQ</a>
    <span>Live chat available 9am-6pm EST</span>
  </div>
  <p>&copy; 2026 ShopFlow Inc.</p>
</footer>`,
    explanation: "WCAG 2.2 Success Criterion 3.2.6 states that if a help mechanism (human contact, contact form, or self-help) is provided on multiple pages, it must be located in the same relative order across pages.",
    recommendedSolution: "Standardize the support and contact widget inside the persistent shared footer layout across all application routes.",
    impactScore: 6,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-009",
    title: "Form input missing associated programmatic label element",
    severity: "serious",
    wcagCriterion: "3.3.2 Labels or Instructions",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Understandable",
    category: "Forms & Controls",
    pageUrl: "https://shopflow-demo.store/newsletter",
    elementSelector: "input#subscriber-email-hero",
    affectedHtml: `<input id="subscriber-email-hero" type="email" placeholder="Enter your email address" />`,
    proposedFixHtml: `<label for="subscriber-email-hero" class="block text-sm font-medium mb-1">
  Email Address <span aria-hidden="true">*</span>
</label>
<input id="subscriber-email-hero" type="email" required autocomplete="email" placeholder="alex@company.com" aria-required="true" />`,
    explanation: "Placeholders disappear once users begin typing and do not fulfill the requirement for persistent programmatic labels. Screen reader virtual cursor navigation can fail to announce the prompt.",
    recommendedSolution: "Add a visible <label> bound via the 'for' attribute, and use placeholder only for formatting hints.",
    impactScore: 7,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-010",
    title: "Status messages and error toasts not announced to screen readers",
    severity: "serious",
    wcagCriterion: "4.1.3 Status Messages",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Robust",
    category: "Forms & Controls",
    pageUrl: "https://shopflow-demo.store/cart",
    elementSelector: "div#cart-notification-toast",
    affectedHtml: `<div id="cart-notification-toast" class="toast">
  <span>Item added to your cart</span>
</div>`,
    proposedFixHtml: `<div id="cart-notification-toast" role="status" aria-live="polite" class="toast">
  <span>Item added to your cart</span>
</div>`,
    explanation: "When an item is added to the cart, the visual toast appears but blind users receive no audio notification because the container lacks role='status' or aria-live='polite'.",
    recommendedSolution: "Attach role='status' or aria-live='polite' to dynamic feedback toasts so assistive technology announces the confirmation without taking keyboard focus.",
    impactScore: 7,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-011",
    title: "Color alone used to communicate out-of-stock product variant status",
    severity: "serious",
    wcagCriterion: "1.4.1 Use of Color",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Color & Contrast",
    pageUrl: "https://shopflow-demo.store/products/sneaker",
    elementSelector: "div.variant-picker button.color-swatch-red",
    affectedHtml: `<button class="color-swatch-red disabled" style="opacity: 0.4;">
  Red
</button>`,
    proposedFixHtml: `<button class="color-swatch-red disabled" disabled aria-disabled="true">
  <span>Red</span>
  <span class="sr-only"> (Out of stock)</span>
  <span aria-hidden="true" class="badge-tag">Sold Out</span>
</button>`,
    explanation: "Faded color opacity was used as the sole visual indicator that a product option is out of stock. Color-blind users cannot differentiate available from unavailable variants.",
    recommendedSolution: "Provide explicit text labels such as '(Out of stock)' or strikethrough icons alongside the color swatch.",
    impactScore: 6,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },

  // --- MODERATE (9) ---
  {
    id: "VIOL-012",
    title: "Page lacks bypass block skip navigation link for main content",
    severity: "moderate",
    wcagCriterion: "2.4.1 Bypass Blocks",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Keyboard & Focus",
    pageUrl: "https://shopflow-demo.store/",
    elementSelector: "body > header",
    affectedHtml: `<body>
  <header>
    <nav>...</nav>
  </header>
  <main id="main-content">...`,
    proposedFixHtml: `<body>
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded">
    Skip to main content
  </a>
  <header>...`,
    explanation: "Keyboard-only visitors must tab through dozens of repetitive top navigation links on every page refresh before reaching unique article or product content.",
    recommendedSolution: "Inject a visually hidden skip link at the top of <body> that becomes visible on focus and directs keyboard focus directly to #main-content.",
    impactScore: 5,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-013",
    title: "Heading level skipped from H1 directly to H4 in product card",
    severity: "moderate",
    wcagCriterion: "1.3.1 Info and Relationships",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/catalog",
    elementSelector: "div.product-grid h4.item-title",
    affectedHtml: `<h1>All Products</h1>
<div class="product-grid">
  <div class="card">
    <h4>Ceramic Mug</h4>
  </div>
</div>`,
    proposedFixHtml: `<h1>All Products</h1>
<div class="product-grid">
  <div class="card">
    <h2 class="text-base font-semibold">Ceramic Mug</h2>
  </div>
</div>`,
    explanation: "Skipping heading levels confuses screen reader users who navigate by headings (H-key) to build a mental map of document outline and section nesting.",
    recommendedSolution: "Use sequential heading levels (H1 followed by H2, then H3), and use CSS classes rather than heading tags for font size styling.",
    impactScore: 4,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-014",
    title: "Tab order jumps erratically when opening faceted filter drawer",
    severity: "moderate",
    wcagCriterion: "2.4.3 Focus Order",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Keyboard & Focus",
    pageUrl: "https://shopflow-demo.store/catalog",
    elementSelector: "aside#filter-drawer",
    affectedHtml: `<aside id="filter-drawer" class="drawer-open">
  <!-- Focus stays on open button behind the drawer overlay -->
  <button id="apply-filters">Apply</button>
</aside>`,
    proposedFixHtml: `<aside id="filter-drawer" role="region" aria-label="Product Filters" class="drawer-open">
  <button id="close-drawer-btn" autofocus>Close Filters</button>
  <button id="apply-filters">Apply</button>
</aside>`,
    explanation: "When the filter slide-out opens, keyboard focus is not moved into the drawer, forcing users to tab through hidden background page elements first.",
    recommendedSolution: "Move focus programmatically to the first interactive element inside the drawer upon opening and restore focus to trigger button upon close.",
    impactScore: 5,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-015",
    title: "Text content clips or overlaps when custom text spacing is applied",
    severity: "moderate",
    wcagCriterion: "1.4.12 Text Spacing",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Color & Contrast",
    pageUrl: "https://shopflow-demo.store/about",
    elementSelector: "div.hero-stats-banner p.metric-caption",
    affectedHtml: `<div style="height: 40px; overflow: hidden;">
  <p class="metric-caption">Over 10,000 satisfied enterprise clients worldwide</p>
</div>`,
    proposedFixHtml: `<div class="min-h-[40px] overflow-visible">
  <p class="metric-caption leading-relaxed">Over 10,000 satisfied enterprise clients worldwide</p>
</div>`,
    explanation: "Hardcoded container heights with overflow:hidden truncate text when users override line height to 1.5x or letter spacing to 0.12x for dyslexia readability.",
    recommendedSolution: "Use min-height rather than fixed height and avoid overflow:hidden on text containers.",
    impactScore: 4,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-016",
    title: "Missing HTML autocomplete token on credit card expiration input",
    severity: "moderate",
    wcagCriterion: "1.3.5 Identify Input Purpose",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Understandable",
    category: "Forms & Controls",
    pageUrl: "https://shopflow-demo.store/checkout",
    elementSelector: "input#cc-exp",
    affectedHtml: `<input id="cc-exp" type="text" placeholder="MM/YY" />`,
    proposedFixHtml: `<input id="cc-exp" type="text" autocomplete="cc-exp" placeholder="MM/YY" aria-label="Credit Card Expiration Date" />`,
    explanation: "Without autocomplete='cc-exp', password managers and assistive autofill tools cannot recognize the payment input purpose.",
    recommendedSolution: "Add standard autocomplete='cc-exp' to support browser auto-population.",
    impactScore: 4,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-017",
    title: "Vague link anchor text 'Click here' provides no context",
    severity: "moderate",
    wcagCriterion: "2.4.4 Link Purpose (In Context)",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/terms",
    elementSelector: "p.privacy-link a",
    affectedHtml: `<p>To read our data privacy policy, <a href="/privacy">Click here</a>.</p>`,
    proposedFixHtml: `<p>Review our <a href="/privacy" class="text-blue-600 underline">Privacy and Data Protection Policy</a>.</p>`,
    explanation: "Screen reader users browse links out of context in a links dialog. A list containing multiple 'Click here' links provides no clue where each link leads.",
    recommendedSolution: "Rephrase anchor text to describe the destination resource directly.",
    impactScore: 4,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-018",
    title: "Custom sorting dropdown menu lacks aria-expanded state toggle",
    severity: "moderate",
    wcagCriterion: "4.1.2 Name, Role, Value",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Robust",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/catalog",
    elementSelector: "div.sort-dropdown button.dropdown-toggle",
    affectedHtml: `<button class="dropdown-toggle">
  Sort: Price Low to High
</button>`,
    proposedFixHtml: `<button class="dropdown-toggle" aria-haspopup="listbox" aria-expanded="false" aria-controls="sort-options-list">
  Sort: Price Low to High
</button>`,
    explanation: "Assistive technology cannot announce whether the sort popup is currently expanded or collapsed.",
    recommendedSolution: "Add aria-haspopup='listbox' and dynamically toggle aria-expanded='true|false'.",
    impactScore: 4,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-019",
    title: "Embedded promotional video lacks synchronized closed captions",
    severity: "moderate",
    wcagCriterion: "1.2.2 Captions (Prerecorded)",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Color & Contrast",
    pageUrl: "https://shopflow-demo.store/about",
    elementSelector: "video#brand-story-video",
    affectedHtml: `<video id="brand-story-video" src="/media/story.mp4" controls></video>`,
    proposedFixHtml: `<video id="brand-story-video" src="/media/story.mp4" controls>
  <track kind="captions" src="/media/story_en.vtt" srclang="en" label="English Captions" default />
</video>`,
    explanation: "Spoken dialogue and sound effects are inaccessible to deaf and hard-of-hearing viewers.",
    recommendedSolution: "Provide a WebVTT closed captions track file via a <track> element.",
    impactScore: 5,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-020",
    title: "Tooltip content dismissable only by moving pointer cursor away",
    severity: "moderate",
    wcagCriterion: "1.4.13 Content on Hover or Focus",
    wcagLevel: "AA",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Keyboard & Focus",
    pageUrl: "https://shopflow-demo.store/checkout",
    elementSelector: "span.cvv-tooltip-trigger",
    affectedHtml: `<span class="cvv-tooltip-trigger" onmouseover="showTip()">
  What is this?
</span>`,
    proposedFixHtml: `<span class="cvv-tooltip-trigger" tabIndex="0" aria-describedby="cvv-tip-text">
  What is this?
</span>
<!-- JS: Add Escape key listener to dismiss tooltip without moving cursor -->`,
    explanation: "WCAG 2.2 SC 1.4.13 requires that content appearing on hover or focus must be dismissable using the Escape key without having to move the mouse cursor.",
    recommendedSolution: "Support the standard Escape key press to dismiss the active tooltip.",
    impactScore: 4,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },

  // --- MINOR (5) ---
  {
    id: "VIOL-021",
    title: "Pagination controls lack aria-current state indicator",
    severity: "minor",
    wcagCriterion: "4.1.2 Name, Role, Value",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Robust",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/catalog?page=2",
    elementSelector: "nav.pagination-nav a.active",
    affectedHtml: `<nav class="pagination-nav">
  <a href="/catalog?page=1">1</a>
  <a href="/catalog?page=2" class="active">2</a>
  <a href="/catalog?page=3">3</a>
</nav>`,
    proposedFixHtml: `<nav class="pagination-nav" aria-label="Catalog pages">
  <a href="/catalog?page=1">1</a>
  <a href="/catalog?page=2" class="active" aria-current="page">2</a>
  <a href="/catalog?page=3">3</a>
</nav>`,
    explanation: "The visual highlight on page '2' conveys state solely through color/styling. Non-sighted users hear only 'Link 2' without indication that it is the active page.",
    recommendedSolution: "Add aria-current='page' to the active pagination link and label the enclosing <nav> landmark with aria-label.",
    impactScore: 3,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-022",
    title: "Payment partner iframe embed missing descriptive title attribute",
    severity: "minor",
    wcagCriterion: "4.1.2 Name, Role, Value",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Robust",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/checkout",
    elementSelector: "iframe#stripe-elements-frame",
    affectedHtml: `<iframe id="stripe-elements-frame" src="https://js.stripe.com/v3/"></iframe>`,
    proposedFixHtml: `<iframe id="stripe-elements-frame" title="Secure Payment Processing Gateway" src="https://js.stripe.com/v3/"></iframe>`,
    explanation: "Screen readers announce untitled iframes as 'frame' or read the raw URL, making it difficult for users to know what content is embedded.",
    recommendedSolution: "Provide title='Secure Payment Processing Gateway' on the <iframe> element.",
    impactScore: 3,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-023",
    title: "Document <title> element does not include current category name",
    severity: "minor",
    wcagCriterion: "2.4.2 Page Titled",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Operable",
    category: "Structure & Semantics",
    pageUrl: "https://shopflow-demo.store/catalog?category=footwear",
    elementSelector: "head > title",
    affectedHtml: `<title>Catalog | ShopFlow</title>`,
    proposedFixHtml: `<title>Footwear - Men's & Women's Shoes | ShopFlow Storefront</title>`,
    explanation: "Generic document titles hinder users switching between multiple open browser tabs using tab cyclers or screen reader window switchers.",
    recommendedSolution: "Update <title> dynamically to reflect the current filtered category.",
    impactScore: 2,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-024",
    title: "Purely decorative icon missing aria-hidden='true'",
    severity: "minor",
    wcagCriterion: "1.1.1 Non-text Content",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Target Size (2.2)",
    pageUrl: "https://shopflow-demo.store/faq",
    elementSelector: "span.accordion-arrow > svg",
    affectedHtml: `<span class="accordion-arrow">
  <svg class="chevron-icon">...</svg>
</span>`,
    proposedFixHtml: `<span class="accordion-arrow" aria-hidden="true">
  <svg class="chevron-icon" focusable="false">...</svg>
</span>`,
    explanation: "Assistive technology may attempt to read out decorative vector path data or announce empty graphic nodes.",
    recommendedSolution: "Add aria-hidden='true' to decorative icons next to text labels.",
    impactScore: 2,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
  {
    id: "VIOL-025",
    title: "Ambiguous image filename used as fallback alt attribute",
    severity: "minor",
    wcagCriterion: "1.1.1 Non-text Content",
    wcagLevel: "A",
    wcagVersion: "2.2",
    principle: "Perceivable",
    category: "Color & Contrast",
    pageUrl: "https://shopflow-demo.store/blog/sustainable-fashion",
    elementSelector: "img.author-avatar",
    affectedHtml: `<img class="author-avatar" src="/authors/avatar-04.jpg" alt="IMG_2026_avatar.jpg" />`,
    proposedFixHtml: `<img class="author-avatar" src="/authors/avatar-04.jpg" alt="Portrait photo of Dr. Elena Rostova, Lead Sustainability Analyst" />`,
    explanation: "Raw filenames like 'IMG_2026_avatar.jpg' in alt attributes create noise for screen reader listeners.",
    recommendedSolution: "Replace filename placeholders with meaningful descriptive alt text describing the person or object.",
    impactScore: 2,
    isApplied: true,
    suggestedBy: "AccessAble Core Rule Engine",
  },
];

export const MOCK_SUMMARY = {
  currentScore: 68,
  projectedScore: 94,
  scoreRating: "Needs Improvement",
  totalViolations: 25,
  severityBreakdown: {
    critical: 4,
    serious: 7,
    moderate: 9,
    minor: 5,
  },
  wcagCompliance: {
    levelA: { percentage: 82, passed: 27, total: 33 },
    levelAA: { percentage: 64, passed: 18, total: 28 },
    levelAAA: { percentage: 38, passed: 9, total: 24 },
  },
  principlesBreakdown: [
    { name: "Perceivable", score: 72, violations: 8, maxScore: 100, passRate: 78 },
    { name: "Operable", score: 58, violations: 11, maxScore: 100, passRate: 61 },
    { name: "Understandable", score: 75, violations: 4, maxScore: 100, passRate: 84 },
    { name: "Robust", score: 80, violations: 2, maxScore: 100, passRate: 89 },
  ],
  categoryBreakdown: [
    { category: "Color & Contrast", count: 6, critical: 1, serious: 3, moderate: 2, minor: 0 },
    { category: "Keyboard & Focus", count: 7, critical: 2, serious: 2, moderate: 2, minor: 1 },
    { category: "Forms & Controls", count: 5, critical: 0, serious: 2, moderate: 2, minor: 1 },
    { category: "Target Size (2.2)", count: 4, critical: 1, serious: 0, moderate: 2, minor: 1 },
    { category: "Structure & Semantics", count: 3, critical: 0, serious: 0, moderate: 1, minor: 2 },
  ],
};

export const MOCK_FIX_COMPARISON = {
  scanId: "scan-2026-0492-acc",
  targetUrl: "https://shopflow-demo.store",
  before: {
    score: 68,
    totalViolations: 25,
    critical: 4,
    serious: 7,
    moderate: 9,
    minor: 5,
    wcagAAPassRate: 64,
  },
  after: {
    score: 94,
    totalViolations: 2,
    critical: 0,
    serious: 0,
    moderate: 1,
    minor: 1,
    wcagAAPassRate: 96,
  },
  improvementPercentage: 38.2,
  violationsResolved: 23,
  remainingViolations: 2,
  severityComparison: [
    { severity: "Critical", before: 4, after: 0 },
    { severity: "Serious", before: 7, after: 0 },
    { severity: "Moderate", before: 9, after: 1 },
    { severity: "Minor", before: 5, after: 1 },
  ],
  principlesComparison: [
    { principle: "Perceivable", before: 72, after: 96 },
    { principle: "Operable", before: 58, after: 92 },
    { principle: "Understandable", before: 75, after: 95 },
    { principle: "Robust", before: 80, after: 94 },
  ],
};

export const MOCK_RECENT_SCANS = [
  {
    id: "scan-2026-0492-acc",
    url: "https://shopflow-demo.store",
    repo: "shopflow-org/storefront",
    score: 68,
    violationsCount: 25,
    criticalCount: 4,
    status: "Completed",
    date: "2026-11-05 03:30",
    standard: "WCAG 2.2 AA",
  },
  {
    id: "scan-2026-0488-acc",
    url: "https://acme-health-portal.org",
    repo: "acme-corp/patient-portal",
    score: 84,
    violationsCount: 9,
    criticalCount: 1,
    status: "Completed",
    date: "2026-11-04 18:15",
    standard: "WCAG 2.2 AA",
  },
  {
    id: "scan-2026-0481-acc",
    url: "https://fintech-loan-dashboard.io",
    repo: "fintech-labs/borrower-ui",
    score: 52,
    violationsCount: 38,
    criticalCount: 8,
    status: "Completed",
    date: "2026-11-03 11:40",
    standard: "WCAG 2.2 AA",
  },
  {
    id: "scan-2026-0475-acc",
    url: "https://city-library-catalog.gov",
    repo: "civic-open/library-search",
    score: 91,
    violationsCount: 4,
    criticalCount: 0,
    status: "Completed",
    date: "2026-11-01 09:20",
    standard: "WCAG 2.2 AAA",
  },
  {
    id: "scan-2026-0460-acc",
    url: "https://devdocs-markdown.dev",
    repo: "oss-docs/reader-web",
    score: 79,
    violationsCount: 14,
    criticalCount: 2,
    status: "Completed",
    date: "2026-10-29 14:05",
    standard: "WCAG 2.2 AA",
  },
];

// ============================================================================
// MULTI-SCAN DATABASE FOR HISTORICAL DRILL-DOWN
// ============================================================================

export const MOCK_SCANS_DB = {
  // 1. ShopFlow Storefront (Default)
  "scan-2026-0492-acc": {
    metadata: MOCK_SCAN_METADATA,
    summary: MOCK_SUMMARY,
    violations: MOCK_VIOLATIONS,
    fixComparison: MOCK_FIX_COMPARISON,
  },

  // 2. Acme Health Portal (Score 84, 9 violations)
  "scan-2026-0488-acc": {
    metadata: {
      isDemonstrationMockData: true,
      disclaimer: "Demonstration audit data for testing UI/UX and remediation workflows.",
      scanId: "scan-2026-0488-acc",
      timestamp: "2026-11-04T18:15:00Z",
      targetUrl: "https://acme-health-portal.org",
      repoUrl: "https://github.com/acme-corp/patient-portal",
      standard: "WCAG 2.2 Level AA",
      auditEngine: "AccessAble Core v2.4",
      pagesScanned: 12,
      domNodesAudited: 3120,
      durationSeconds: 11.4,
    },
    summary: {
      currentScore: 84,
      projectedScore: 98,
      scoreRating: "Good",
      totalViolations: 9,
      severityBreakdown: {
        critical: 1,
        serious: 2,
        moderate: 4,
        minor: 2,
      },
      wcagCompliance: {
        levelA: { percentage: 94, passed: 31, total: 33 },
        levelAA: { percentage: 86, passed: 24, total: 28 },
        levelAAA: { percentage: 62, passed: 15, total: 24 },
      },
      principlesBreakdown: [
        { name: "Perceivable", score: 88, violations: 2, maxScore: 100, passRate: 91 },
        { name: "Operable", score: 79, violations: 4, maxScore: 100, passRate: 83 },
        { name: "Understandable", score: 89, violations: 2, maxScore: 100, passRate: 92 },
        { name: "Robust", score: 92, violations: 1, maxScore: 100, passRate: 95 },
      ],
      categoryBreakdown: [
        { category: "Color & Contrast", count: 2, critical: 0, serious: 1, moderate: 1, minor: 0 },
        { category: "Forms & Controls", count: 3, critical: 1, serious: 1, moderate: 1, minor: 0 },
        { category: "Keyboard & Focus", count: 2, critical: 0, serious: 0, moderate: 2, minor: 0 },
        { category: "Structure & Semantics", count: 2, critical: 0, serious: 0, moderate: 0, minor: 2 },
      ],
    },
    violations: [
      {
        id: "ACME-001",
        title: "Prescription refill confirmation button missing accessible label",
        severity: "critical",
        wcagCriterion: "1.1.1 Non-text Content",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Forms & Controls",
        pageUrl: "https://acme-health-portal.org/prescriptions",
        elementSelector: "button#refill-submit-icon",
        affectedHtml: `<button id="refill-submit-icon"><svg class="pill-bottle">...</svg></button>`,
        proposedFixHtml: `<button id="refill-submit-icon" type="submit" aria-label="Confirm prescription refill request"><svg class="pill-bottle" aria-hidden="true">...</svg> Refill Medication</button>`,
        explanation: "Critical patient medication action lacks an accessible name, making it impossible for screen reader users to confirm refill submissions.",
        recommendedSolution: "Add descriptive visible text or an aria-label explaining the medical action.",
        impactScore: 12,
        isApplied: true,
      },
      {
        id: "ACME-002",
        title: "Appointment date picker lacks keyboard arrow key navigation",
        severity: "serious",
        wcagCriterion: "2.1.1 Keyboard",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Keyboard & Focus",
        pageUrl: "https://acme-health-portal.org/appointments",
        elementSelector: "div.calendar-grid",
        affectedHtml: `<div class="calendar-grid" onclick="pickDate(event)">...</div>`,
        proposedFixHtml: `<div class="calendar-grid" role="grid" aria-label="Appointment dates" onkeydown="handleCalendarKey(event)">...</div>`,
        explanation: "Keyboard users cannot navigate calendar days using standard arrow keys (Left/Right/Up/Down).",
        recommendedSolution: "Implement standard WAI-ARIA grid pattern with arrow key listeners and roving tabindex.",
        impactScore: 8,
        isApplied: true,
      },
      {
        id: "ACME-003",
        title: "Medical alert banner contrast ratio 3.4:1 below 4.5:1",
        severity: "serious",
        wcagCriterion: "1.4.3 Contrast (Minimum)",
        wcagLevel: "AA",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Color & Contrast",
        pageUrl: "https://acme-health-portal.org/dashboard",
        elementSelector: "div.alert-warning-banner",
        affectedHtml: `<div class="alert-warning-banner" style="color: #D97706; background: #FEF3C7;">Fasting required 8 hours before lab test.</div>`,
        proposedFixHtml: `<div class="alert-warning-banner" style="color: #92400E; background: #FEF3C7; font-weight: 600;">Fasting required 8 hours before lab test.</div>`,
        explanation: "Amber text on light yellow background provides only 3.41:1 contrast, below the 4.5:1 requirement.",
        recommendedSolution: "Darken warning text to #92400E to attain 5.8:1 contrast.",
        impactScore: 7,
        isApplied: true,
      },
      {
        id: "ACME-004",
        title: "Lab results PDF download link lacks file type announcement",
        severity: "moderate",
        wcagCriterion: "2.4.4 Link Purpose",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Forms & Controls",
        pageUrl: "https://acme-health-portal.org/lab-records",
        elementSelector: "a.download-lab-results",
        affectedHtml: `<a class="download-lab-results" href="/records/blood-test.pdf">Download</a>`,
        proposedFixHtml: `<a class="download-lab-results" href="/records/blood-test.pdf">Download Blood Test Results (PDF, 240 KB)</a>`,
        explanation: "Users are not warned that activating the link initiates an external PDF download.",
        recommendedSolution: "Include explicit file format and size in the link text or accessible description.",
        impactScore: 4,
        isApplied: true,
      },
      {
        id: "ACME-005",
        title: "Doctor bio modal lacks focus restoration upon closing",
        severity: "moderate",
        wcagCriterion: "2.4.3 Focus Order",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Keyboard & Focus",
        pageUrl: "https://acme-health-portal.org/physicians",
        elementSelector: "div#doctor-bio-modal",
        affectedHtml: `<div id="doctor-bio-modal">...</div>`,
        proposedFixHtml: `<div id="doctor-bio-modal" role="dialog" aria-modal="true" onclose="restoreFocusToPhysicianCard()">...</div>`,
        explanation: "Closing the doctor bio drops keyboard focus back to <body>, forcing users to tab through the whole page again.",
        recommendedSolution: "Store the trigger button reference and call trigger.focus() when closing the modal.",
        impactScore: 5,
        isApplied: true,
      },
      {
        id: "ACME-006",
        title: "Patient portal telephone input missing autocomplete='tel'",
        severity: "moderate",
        wcagCriterion: "1.3.5 Identify Input Purpose",
        wcagLevel: "AA",
        wcagVersion: "2.2",
        principle: "Understandable",
        category: "Forms & Controls",
        pageUrl: "https://acme-health-portal.org/profile",
        elementSelector: "input#emergency-phone",
        affectedHtml: `<input id="emergency-phone" type="text" placeholder="(555) 000-0000" />`,
        proposedFixHtml: `<input id="emergency-phone" type="tel" autocomplete="tel" placeholder="(555) 000-0000" />`,
        explanation: "Mobile devices do not summon telephone keypads and browser autofill fails.",
        recommendedSolution: "Add type='tel' and autocomplete='tel'.",
        impactScore: 4,
        isApplied: true,
      },
      {
        id: "ACME-007",
        title: "Chart legend uses color dots without text labels in table view",
        severity: "moderate",
        wcagCriterion: "1.4.1 Use of Color",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Color & Contrast",
        pageUrl: "https://acme-health-portal.org/vitals",
        elementSelector: "div.blood-pressure-legend",
        affectedHtml: `<div class="blood-pressure-legend"><span class="dot-green"></span> Systolic</div>`,
        proposedFixHtml: `<div class="blood-pressure-legend"><span class="dot-green" aria-hidden="true"></span> <span>Systolic (Target Range &lt; 120 mmHg)</span></div>`,
        explanation: "Color is the sole differentiator between normal and elevated blood pressure metrics.",
        recommendedSolution: "Add textual status indicators alongside the color coding.",
        impactScore: 4,
        isApplied: true,
      },
      {
        id: "ACME-008",
        title: "Footer health disclaimer missing lang='en' declaration",
        severity: "minor",
        wcagCriterion: "3.1.1 Language of Page",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Understandable",
        category: "Structure & Semantics",
        pageUrl: "https://acme-health-portal.org/",
        elementSelector: "footer div.legal-medical",
        affectedHtml: `<div class="legal-medical">Medical emergency notice...</div>`,
        proposedFixHtml: `<div class="legal-medical" lang="en">Medical emergency notice...</div>`,
        explanation: "Embedded legal text lacks explicit language tags.",
        recommendedSolution: "Declare lang='en' on root document or region.",
        impactScore: 2,
        isApplied: true,
      },
      {
        id: "ACME-009",
        title: "Hospital wing location map missing alternative text",
        severity: "minor",
        wcagCriterion: "1.1.1 Non-text Content",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Structure & Semantics",
        pageUrl: "https://acme-health-portal.org/facilities",
        elementSelector: "img.campus-map-thumb",
        affectedHtml: `<img class="campus-map-thumb" src="/maps/wing-b.png" alt="map" />`,
        proposedFixHtml: `<img class="campus-map-thumb" src="/maps/wing-b.png" alt="Campus map showing Wing B entrance and accessible parking ramp on North Boulevard" />`,
        explanation: "Alt text 'map' is uninformative for users seeking parking and wheelchair accessible entrances.",
        recommendedSolution: "Provide descriptive alt text detailing the accessible route.",
        impactScore: 3,
        isApplied: true,
      },
    ],
    fixComparison: {
      scanId: "scan-2026-0488-acc",
      targetUrl: "https://acme-health-portal.org",
      before: {
        score: 84,
        totalViolations: 9,
        critical: 1,
        serious: 2,
        moderate: 4,
        minor: 2,
        wcagAAPassRate: 86,
      },
      after: {
        score: 98,
        totalViolations: 0,
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
        wcagAAPassRate: 100,
      },
      improvementPercentage: 16.7,
      violationsResolved: 9,
      remainingViolations: 0,
      severityComparison: [
        { severity: "Critical", before: 1, after: 0 },
        { severity: "Serious", before: 2, after: 0 },
        { severity: "Moderate", before: 4, after: 0 },
        { severity: "Minor", before: 2, after: 0 },
      ],
      principlesComparison: [
        { principle: "Perceivable", before: 88, after: 98 },
        { principle: "Operable", before: 79, after: 96 },
        { principle: "Understandable", before: 89, after: 99 },
        { principle: "Robust", before: 92, after: 98 },
      ],
    },
  },

  // 3. FinTech Loan Dashboard (Score 52, 38 violations)
  "scan-2026-0481-acc": {
    metadata: {
      isDemonstrationMockData: true,
      disclaimer: "Demonstration audit data for testing UI/UX and remediation workflows.",
      scanId: "scan-2026-0481-acc",
      timestamp: "2026-11-03T11:40:00Z",
      targetUrl: "https://fintech-loan-dashboard.io",
      repoUrl: "https://github.com/fintech-labs/borrower-ui",
      standard: "WCAG 2.2 Level AA",
      auditEngine: "AccessAble Core v2.4",
      pagesScanned: 24,
      domNodesAudited: 6840,
      durationSeconds: 22.1,
    },
    summary: {
      currentScore: 52,
      projectedScore: 91,
      scoreRating: "Non-Compliant",
      totalViolations: 38,
      severityBreakdown: {
        critical: 8,
        serious: 12,
        moderate: 11,
        minor: 7,
      },
      wcagCompliance: {
        levelA: { percentage: 68, passed: 22, total: 33 },
        levelAA: { percentage: 46, passed: 13, total: 28 },
        levelAAA: { percentage: 21, passed: 5, total: 24 },
      },
      principlesBreakdown: [
        { name: "Perceivable", score: 55, violations: 12, maxScore: 100, passRate: 58 },
        { name: "Operable", score: 48, violations: 15, maxScore: 100, passRate: 51 },
        { name: "Understandable", score: 59, violations: 7, maxScore: 100, passRate: 64 },
        { name: "Robust", score: 62, violations: 4, maxScore: 100, passRate: 68 },
      ],
      categoryBreakdown: [
        { category: "Keyboard & Focus", count: 12, critical: 3, serious: 4, moderate: 3, minor: 2 },
        { category: "Color & Contrast", count: 10, critical: 2, serious: 4, moderate: 3, minor: 1 },
        { category: "Forms & Controls", count: 9, critical: 2, serious: 3, moderate: 3, minor: 1 },
        { category: "Target Size (2.2)", count: 4, critical: 1, serious: 1, moderate: 1, minor: 1 },
        { category: "Structure & Semantics", count: 3, critical: 0, serious: 0, moderate: 1, minor: 2 },
      ],
    },
    violations: [
      {
        id: "FIN-001",
        title: "Loan application signature canvas lacks keyboard and text alternative",
        severity: "critical",
        wcagCriterion: "2.1.1 Keyboard",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Forms & Controls",
        pageUrl: "https://fintech-loan-dashboard.io/apply/sign",
        elementSelector: "canvas#signature-pad",
        affectedHtml: `<canvas id="signature-pad" width="400" height="150"></canvas>`,
        proposedFixHtml: `<div class="signature-section">
  <canvas id="signature-pad" width="400" height="150" aria-label="Signature Drawing Pad"></canvas>
  <div class="mt-2">
    <label for="typed-signature">Or type full legal name to sign electronically:</label>
    <input id="typed-signature" type="text" placeholder="Johnathan Doe" required />
  </div>
</div>`,
        explanation: "Drawing a digital signature with a mouse or touch is impossible for keyboard-only users or people with tremors.",
        recommendedSolution: "Offer a legally recognized typed text signature option alongside the canvas pad.",
        impactScore: 14,
        isApplied: true,
      },
      {
        id: "FIN-002",
        title: "Session timeout warning closes application without 20-hour extension option",
        severity: "critical",
        wcagCriterion: "2.2.1 Timing Adjustable",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Forms & Controls",
        pageUrl: "https://fintech-loan-dashboard.io/app",
        elementSelector: "div#session-expiry-modal",
        affectedHtml: `<div id="session-expiry-modal">Your session will end in 60 seconds. <button onclick="logout()">OK</button></div>`,
        proposedFixHtml: `<div id="session-expiry-modal" role="alertdialog" aria-modal="true">
  <p>Your session will expire due to inactivity in 2 minutes.</p>
  <button type="button" onclick="extendSession()">Extend Session by 20 Minutes</button>
  <button type="button" onclick="logout()">Log Out Now</button>
</div>`,
        explanation: "Users with motor or reading challenges lose completed loan applications when the session abruptly terminates without extension options.",
        recommendedSolution: "Display an accessible alert dialogue with at least 2 minutes warning and an 'Extend Session' action.",
        impactScore: 12,
        isApplied: true,
      },
      {
        id: "FIN-003",
        title: "Monthly repayment slider requires fine drag movement with no stepping inputs",
        severity: "critical",
        wcagCriterion: "2.5.7 Dragging Movements",
        wcagLevel: "AA",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Target Size (2.2)",
        pageUrl: "https://fintech-loan-dashboard.io/calculator",
        elementSelector: "div.slider-thumb",
        affectedHtml: `<div class="slider-thumb" onmousedown="startDrag(event)"></div>`,
        proposedFixHtml: `<div class="slider-container">
  <input type="range" min="100" max="5000" step="50" value="1200" id="loan-amount-range" aria-label="Loan Amount Slider" />
  <div class="flex gap-2 mt-2">
    <button type="button" onclick="adjustAmount(-50)">- $50</button>
    <input type="number" id="loan-amount-input" value="1200" aria-label="Exact loan amount in dollars" />
    <button type="button" onclick="adjustAmount(+50)">+ $50</button>
  </div>
</div>`,
        explanation: "WCAG 2.2 SC 2.5.7 requires that dragging interactions have single-pointer alternatives like decrement/increment stepper buttons.",
        recommendedSolution: "Add numerical inputs and +/- stepper buttons alongside the slider.",
        impactScore: 10,
        isApplied: true,
      },
      {
        id: "FIN-004",
        title: "Data table of amortization schedule lacks row and column header scopes",
        severity: "critical",
        wcagCriterion: "1.3.1 Info and Relationships",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Structure & Semantics",
        pageUrl: "https://fintech-loan-dashboard.io/schedule",
        elementSelector: "table#amortization-table",
        affectedHtml: `<table><tr><td>Month</td><td>Principal</td><td>Interest</td></tr>...</table>`,
        proposedFixHtml: `<table id="amortization-table">
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Principal Paid</th>
      <th scope="col">Interest Paid</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>`,
        explanation: "Non-sighted users navigating cell by cell cannot determine which column or payment month a numeric balance belongs to.",
        recommendedSolution: "Use <th> with scope='col' and scope='row' to associate headers with data cells.",
        impactScore: 11,
        isApplied: true,
      },
    ],
    fixComparison: {
      scanId: "scan-2026-0481-acc",
      targetUrl: "https://fintech-loan-dashboard.io",
      before: {
        score: 52,
        totalViolations: 38,
        critical: 8,
        serious: 12,
        moderate: 11,
        minor: 7,
        wcagAAPassRate: 46,
      },
      after: {
        score: 91,
        totalViolations: 4,
        critical: 0,
        serious: 0,
        moderate: 2,
        minor: 2,
        wcagAAPassRate: 92,
      },
      improvementPercentage: 75.0,
      violationsResolved: 34,
      remainingViolations: 4,
      severityComparison: [
        { severity: "Critical", before: 8, after: 0 },
        { severity: "Serious", before: 12, after: 0 },
        { severity: "Moderate", before: 11, after: 2 },
        { severity: "Minor", before: 7, after: 2 },
      ],
      principlesComparison: [
        { principle: "Perceivable", before: 55, after: 92 },
        { principle: "Operable", before: 48, after: 90 },
        { principle: "Understandable", before: 59, after: 94 },
        { principle: "Robust", before: 62, after: 91 },
      ],
    },
  },

  // 4. City Library Catalog (Score 91, 4 violations)
  "scan-2026-0475-acc": {
    metadata: {
      isDemonstrationMockData: true,
      disclaimer: "Demonstration audit data for testing UI/UX and remediation workflows.",
      scanId: "scan-2026-0475-acc",
      timestamp: "2026-11-01T09:20:00Z",
      targetUrl: "https://city-library-catalog.gov",
      repoUrl: "https://github.com/civic-open/library-search",
      standard: "WCAG 2.2 Level AAA",
      auditEngine: "AccessAble Core v2.4",
      pagesScanned: 8,
      domNodesAudited: 1840,
      durationSeconds: 7.8,
    },
    summary: {
      currentScore: 91,
      projectedScore: 99,
      scoreRating: "Excellent",
      totalViolations: 4,
      severityBreakdown: {
        critical: 0,
        serious: 1,
        moderate: 2,
        minor: 1,
      },
      wcagCompliance: {
        levelA: { percentage: 100, passed: 33, total: 33 },
        levelAA: { percentage: 96, passed: 27, total: 28 },
        levelAAA: { percentage: 88, passed: 21, total: 24 },
      },
      principlesBreakdown: [
        { name: "Perceivable", score: 94, violations: 1, maxScore: 100, passRate: 96 },
        { name: "Operable", score: 92, violations: 1, maxScore: 100, passRate: 94 },
        { name: "Understandable", score: 90, violations: 1, maxScore: 100, passRate: 92 },
        { name: "Robust", score: 96, violations: 1, maxScore: 100, passRate: 98 },
      ],
      categoryBreakdown: [
        { category: "Color & Contrast", count: 1, critical: 0, serious: 1, moderate: 0, minor: 0 },
        { category: "Keyboard & Focus", count: 1, critical: 0, serious: 0, moderate: 1, minor: 0 },
        { category: "Forms & Controls", count: 1, critical: 0, serious: 0, moderate: 1, minor: 0 },
        { category: "Structure & Semantics", count: 1, critical: 0, serious: 0, moderate: 0, minor: 1 },
      ],
    },
    violations: [
      {
        id: "LIB-001",
        title: "AAA text contrast ratio 6.4:1 falls below 7.0:1 enhanced requirement",
        severity: "serious",
        wcagCriterion: "1.4.6 Contrast (Enhanced)",
        wcagLevel: "AAA",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Color & Contrast",
        pageUrl: "https://city-library-catalog.gov/books/rare",
        elementSelector: "p.book-callout",
        affectedHtml: `<p class="book-callout" style="color: #4B5563; background: #FFFFFF;">Special archival storage only.</p>`,
        proposedFixHtml: `<p class="book-callout" style="color: #1F2937; background: #FFFFFF; font-weight: 500;">Special archival storage only.</p>`,
        explanation: "For WCAG Level AAA, text requires a 7:1 contrast ratio against the background.",
        recommendedSolution: "Darken text to #1F2937 to exceed 9.2:1 contrast.",
        impactScore: 6,
        isApplied: true,
      },
      {
        id: "LIB-002",
        title: "Book hold reservation modal lacks explicit initial focus element",
        severity: "moderate",
        wcagCriterion: "2.4.3 Focus Order",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Keyboard & Focus",
        pageUrl: "https://city-library-catalog.gov/hold",
        elementSelector: "dialog#reserve-book-modal",
        affectedHtml: `<dialog id="reserve-book-modal"><h3>Reserve Copy</h3><input type="text" id="member-card" /></dialog>`,
        proposedFixHtml: `<dialog id="reserve-book-modal" aria-labelledby="reserve-heading"><h3 id="reserve-heading">Reserve Copy</h3><input type="text" id="member-card" autofocus /></dialog>`,
        explanation: "Opening the reserve modal does not position focus on the first card number input.",
        recommendedSolution: "Add autofocus or call element.focus() on modal open.",
        impactScore: 4,
        isApplied: true,
      },
      {
        id: "LIB-003",
        title: "Catalog search input missing clear button accessible label",
        severity: "moderate",
        wcagCriterion: "3.3.2 Labels or Instructions",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Understandable",
        category: "Forms & Controls",
        pageUrl: "https://city-library-catalog.gov/",
        elementSelector: "button.clear-search-btn",
        affectedHtml: `<button class="clear-search-btn">X</button>`,
        proposedFixHtml: `<button class="clear-search-btn" type="button" aria-label="Clear catalog search query"><span aria-hidden="true">&times;</span></button>`,
        explanation: "Screen readers announce 'X' button with no indication of its clearing function.",
        recommendedSolution: "Provide aria-label='Clear catalog search query'.",
        impactScore: 3,
        isApplied: true,
      },
      {
        id: "LIB-004",
        title: "Footer copyright landmark not wrapped in <footer> tag",
        severity: "minor",
        wcagCriterion: "1.3.1 Info and Relationships",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Robust",
        category: "Structure & Semantics",
        pageUrl: "https://city-library-catalog.gov/",
        elementSelector: "div.bottom-bar",
        affectedHtml: `<div class="bottom-bar">&copy; 2026 Civic Library</div>`,
        proposedFixHtml: `<footer class="bottom-bar">&copy; 2026 Civic Library</footer>`,
        explanation: "Using <div> instead of HTML5 <footer> prevents screen readers from locating the landmark.",
        recommendedSolution: "Use semantic <footer> element.",
        impactScore: 2,
        isApplied: true,
      },
    ],
    fixComparison: {
      scanId: "scan-2026-0475-acc",
      targetUrl: "https://city-library-catalog.gov",
      before: {
        score: 91,
        totalViolations: 4,
        critical: 0,
        serious: 1,
        moderate: 2,
        minor: 1,
        wcagAAPassRate: 96,
      },
      after: {
        score: 99,
        totalViolations: 0,
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
        wcagAAPassRate: 100,
      },
      improvementPercentage: 8.8,
      violationsResolved: 4,
      remainingViolations: 0,
      severityComparison: [
        { severity: "Critical", before: 0, after: 0 },
        { severity: "Serious", before: 1, after: 0 },
        { severity: "Moderate", before: 2, after: 0 },
        { severity: "Minor", before: 1, after: 0 },
      ],
      principlesComparison: [
        { principle: "Perceivable", before: 94, after: 100 },
        { principle: "Operable", before: 92, after: 99 },
        { principle: "Understandable", before: 90, after: 98 },
        { principle: "Robust", before: 96, after: 100 },
      ],
    },
  },

  // 5. DevDocs Reader (Score 79, 14 violations)
  "scan-2026-0460-acc": {
    metadata: {
      isDemonstrationMockData: true,
      disclaimer: "Demonstration audit data for testing UI/UX and remediation workflows.",
      scanId: "scan-2026-0460-acc",
      timestamp: "2026-10-29T14:05:00Z",
      targetUrl: "https://devdocs-markdown.dev",
      repoUrl: "https://github.com/oss-docs/reader-web",
      standard: "WCAG 2.2 Level AA",
      auditEngine: "AccessAble Core v2.4",
      pagesScanned: 10,
      domNodesAudited: 2450,
      durationSeconds: 9.3,
    },
    summary: {
      currentScore: 79,
      projectedScore: 96,
      scoreRating: "Moderate",
      totalViolations: 14,
      severityBreakdown: {
        critical: 2,
        serious: 4,
        moderate: 5,
        minor: 3,
      },
      wcagCompliance: {
        levelA: { percentage: 88, passed: 29, total: 33 },
        levelAA: { percentage: 75, passed: 21, total: 28 },
        levelAAA: { percentage: 46, passed: 11, total: 24 },
      },
      principlesBreakdown: [
        { name: "Perceivable", score: 78, violations: 4, maxScore: 100, passRate: 81 },
        { name: "Operable", score: 74, violations: 6, maxScore: 100, passRate: 77 },
        { name: "Understandable", score: 82, violations: 2, maxScore: 100, passRate: 86 },
        { name: "Robust", score: 85, violations: 2, maxScore: 100, passRate: 89 },
      ],
      categoryBreakdown: [
        { category: "Color & Contrast", count: 4, critical: 1, serious: 2, moderate: 1, minor: 0 },
        { category: "Keyboard & Focus", count: 4, critical: 1, serious: 1, moderate: 2, minor: 0 },
        { category: "Forms & Controls", count: 3, critical: 0, serious: 1, moderate: 1, minor: 1 },
        { category: "Structure & Semantics", count: 3, critical: 0, serious: 0, moderate: 1, minor: 2 },
      ],
    },
    violations: [
      {
        id: "DOC-001",
        title: "Code block syntax highlighting token contrast below 4.5:1",
        severity: "critical",
        wcagCriterion: "1.4.3 Contrast (Minimum)",
        wcagLevel: "AA",
        wcagVersion: "2.2",
        principle: "Perceivable",
        category: "Color & Contrast",
        pageUrl: "https://devdocs-markdown.dev/api",
        elementSelector: "pre code span.token.comment",
        affectedHtml: `<span class="token comment" style="color: #6B7280; background: #1F2937;">// Init connection</span>`,
        proposedFixHtml: `<span class="token comment" style="color: #9CA3AF; background: #1F2937;">// Init connection</span>`,
        explanation: "Gray comments on dark slate code backgrounds provide only 3.2:1 contrast.",
        recommendedSolution: "Lighten comment tokens to #9CA3AF to hit 5.2:1 contrast.",
        impactScore: 9,
        isApplied: true,
      },
      {
        id: "DOC-002",
        title: "Documentation sidebar table of contents lacks keyboard arrow navigation",
        severity: "critical",
        wcagCriterion: "2.1.1 Keyboard",
        wcagLevel: "A",
        wcagVersion: "2.2",
        principle: "Operable",
        category: "Keyboard & Focus",
        pageUrl: "https://devdocs-markdown.dev/docs/getting-started",
        elementSelector: "nav.toc-tree",
        affectedHtml: `<nav class="toc-tree"><div class="tree-node">Intro</div></nav>`,
        proposedFixHtml: `<nav class="toc-tree" role="tree" aria-label="Documentation Table of Contents"><div class="tree-node" role="treeitem" tabindex="0">Intro</div></nav>`,
        explanation: "Nested tree items cannot be collapsed or traversed using standard keyboard tree navigation.",
        recommendedSolution: "Implement ARIA tree pattern with Left/Right arrow expand/collapse.",
        impactScore: 10,
        isApplied: true,
      },
    ],
    fixComparison: {
      scanId: "scan-2026-0460-acc",
      targetUrl: "https://devdocs-markdown.dev",
      before: {
        score: 79,
        totalViolations: 14,
        critical: 2,
        serious: 4,
        moderate: 5,
        minor: 3,
        wcagAAPassRate: 75,
      },
      after: {
        score: 96,
        totalViolations: 1,
        critical: 0,
        serious: 0,
        moderate: 1,
        minor: 0,
        wcagAAPassRate: 98,
      },
      improvementPercentage: 21.5,
      violationsResolved: 13,
      remainingViolations: 1,
      severityComparison: [
        { severity: "Critical", before: 2, after: 0 },
        { severity: "Serious", before: 4, after: 0 },
        { severity: "Moderate", before: 5, after: 1 },
        { severity: "Minor", before: 3, after: 0 },
      ],
      principlesComparison: [
        { principle: "Perceivable", before: 78, after: 97 },
        { principle: "Operable", before: 74, after: 95 },
        { principle: "Understandable", before: 82, after: 96 },
        { principle: "Robust", before: 85, after: 98 },
      ],
    },
  },
};
