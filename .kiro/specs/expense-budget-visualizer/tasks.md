# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a zero-dependency, single-page expense tracker using HTML, CSS, and Vanilla JavaScript. The app persists data in `localStorage`, renders a real-time balance display, a scrollable transaction list, and a Chart.js pie chart — all driven by a single re-render cycle. No build step is required; the app opens directly in a browser.

---

## Tasks

- [x] 1. Scaffold project structure
  - Create `css/` and `js/` directories at the project root
  - Create an empty `css/styles.css` file
  - Create an empty `js/app.js` file
  - Create `index.html` at the project root with the standard HTML5 boilerplate, a `<link>` to `css/styles.css`, and a `<script src="js/app.js" defer>` tag
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Build HTML page structure
  - [x] 2.1 Implement the `<header>` with `<h1>` and `#balance-display` container
    - Place `<header>` as the first child of `<body>` so the balance is always visible above the fold
    - Include a `<span id="balance-display">` that will be populated by JavaScript
    - _Requirements: 4.1, 4.5, 4.6_

  - [x] 2.2 Implement the `<main>` with three `<section>` elements
    - `#form-section` containing `#input-form` with: text input for item name (`maxlength="100"`), number input for amount (`step="0.01"`), `<select>` for category, inline `<span class="field-error">` elements for each field (hidden by default), and a submit button
    - `#chart-section` containing `<canvas id="spending-chart">` and `<p id="chart-placeholder" hidden>`
    - `#list-section` containing `<ul id="transaction-list">` and `<p id="list-placeholder" hidden>`
    - Load Chart.js from CDN (`https://cdn.jsdelivr.net/npm/chart.js`) before the app script; wrap in `<script>` tag so it is available globally
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.6, 5.5, 5.6_

- [x] 3. Implement CSS styles in `css/styles.css`
  - [x] 3.1 Apply base typography and layout reset
    - Set `font-size: 16px` (minimum) on `body`, `line-height: 1.5`, and box-sizing reset
    - Define color palette that achieves at least 4.5:1 contrast ratio for all text-on-background combinations
    - _Requirements: 7.4_

  - [x] 3.2 Style the header and balance display
    - Position the header so it stays above the fold; make `#balance-display` visually prominent (larger font weight / size)
    - _Requirements: 4.1_

  - [x] 3.3 Style the input form and inline error messages
    - Style `#input-form` fields, labels, and submit button; `.field-error` spans should be visually distinct (e.g., red text) and hidden by default via `display: none`, revealed by a `.visible` class
    - _Requirements: 1.5_

  - [x] 3.4 Style the transaction list and delete buttons
    - Make `#transaction-list` scrollable (e.g., `max-height` + `overflow-y: auto`); style each `<li>` to display name, amount, and category inline; style `.tx-delete` button with accessible tap target
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.5 Style the chart section and placeholder messages
    - Give `#chart-section` a defined height; style `#chart-placeholder` and `#list-placeholder` as muted center-aligned text
    - _Requirements: 5.5_

  - [x] 3.6 Add responsive layout
    - Use a flexible column/grid layout so the form, chart, and list sections reflow gracefully on narrow viewports
    - _Requirements: 7.4_

- [x] 4. Implement `js/app.js` — Constants and Data Models
  - Define `STORAGE_KEY = "transactions"` constant
  - Define `CATEGORIES = ["Food", "Transport", "Fun"]` array
  - Define `CATEGORY_COLORS = { Food: "#FF6384", Transport: "#36A2EB", Fun: "#FFCE56" }` map
  - Define `AMOUNT_MAX = 999_999_999.99` and `NAME_MAX_LENGTH = 100` limits
  - Define `RULES` object mirroring the validation rules from the design document
  - _Requirements: 1.1, 1.2, 5.2, 5.6_

- [x] 5. Implement Storage module (`load` and `persist`)
  - [x] 5.1 Implement `persist(transactions)` and `load()` functions
    - `persist()` calls `localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))`
    - `load()` reads, JSON-parses, and validates the stored array; on any parse failure or invalid entry, logs to `console.error` and returns an empty array
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.2 Write property test for serialization round-trip (Property 1)
    - **Property 1: Serialization round-trip preserves all transactions**
    - For any array of valid Transaction objects, `JSON.parse(JSON.stringify(arr))` must deeply equal the original
    - Use fast-check; tag: `// Feature: expense-budget-visualizer, Property 1: Serialization round-trip`
    - Run ≥ 100 iterations
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 6. Implement Validation module
  - [x] 6.1 Implement `validate(formData)` returning `{ ok, errors }`
    - Check name: required, non-empty after trim, ≤ 100 chars
    - Check amount: required, numeric, > 0, ≤ 999,999,999.99, ≤ 2 decimal places
    - Check category: must be one of `CATEGORIES`
    - Return `{ ok: true }` or `{ ok: false, errors: { name?, amount?, category? } }`
    - _Requirements: 1.4, 1.5_

  - [ ]* 6.2 Write property test for whitespace-only name rejection (Property 3)
    - **Property 3: Validation rejects all-whitespace names**
    - Generate strings of only whitespace characters; assert `validate({ name, amount: "1", category: "Food" }).ok === false`
    - Tag: `// Feature: expense-budget-visualizer, Property 3: Whitespace name rejection`
    - Run ≥ 100 iterations
    - **Validates: Requirements 1.4, 1.5**

  - [ ]* 6.3 Write property test for out-of-range amount rejection (Property 4)
    - **Property 4: Validation rejects out-of-range amounts**
    - Generate amounts ≤ 0, > 999,999,999.99, and amounts with > 2 decimal places; assert each is rejected
    - Tag: `// Feature: expense-budget-visualizer, Property 4: Out-of-range amount rejection`
    - Run ≥ 100 iterations
    - **Validates: Requirements 1.4, 1.5**

- [x] 7. Implement State and Mutations
  - [x] 7.1 Implement in-memory `transactions` array and `addTransaction(formData)` mutation
    - Generate a UUID with `crypto.randomUUID()` (fallback: `Date.now() + '-' + Math.random().toString(36).slice(2)`)
    - Build a Transaction object `{ id, name: formData.name.trim(), amount: parseFloat(formData.amount), category: formData.category, createdAt: Date.now() }`
    - Push to `transactions`, call `persist(transactions)`, then call `render()`
    - _Requirements: 1.3, 1.6, 3.1_

  - [x] 7.2 Implement `deleteTransaction(id)` mutation
    - Filter `transactions` to remove the entry with matching `id`
    - Call `persist(transactions)`, then call `render()`
    - _Requirements: 2.5, 3.2_

  - [ ]* 7.3 Write property test for add-then-delete round-trip (Property 7)
    - **Property 7: Add then delete returns to original state**
    - For any valid transaction payload, adding then deleting by id must produce a collection equal to the original
    - Tag: `// Feature: expense-budget-visualizer, Property 7: Add-delete round-trip`
    - Run ≥ 100 iterations
    - **Validates: Requirements 2.5, 3.1, 3.2**

- [x] 8. Implement Rendering — Balance Display and Transaction List
  - [x] 8.1 Implement `renderBalanceDisplay()`
    - Sum `transactions.map(t => t.amount)` and display formatted as `$1,234.56` (two decimal places, comma thousands separator)
    - Show `$0.00` when `transactions` is empty
    - Update `#balance-display` inner text
    - _Requirements: 4.2, 4.5, 4.6_

  - [ ]* 8.2 Write property test for balance sum correctness (Property 2)
    - **Property 2: Balance equals sum of all transaction amounts**
    - For any non-empty array of transactions, the computed balance must equal `transactions.reduce((s, t) => s + t.amount, 0)` formatted to two decimal places
    - Tag: `// Feature: expense-budget-visualizer, Property 2: Balance sum`
    - Run ≥ 100 iterations
    - **Validates: Requirements 4.2, 4.5**

  - [x] 8.3 Implement `renderTransactionList()`
    - Build `<li data-id="{id}">` entries in **reverse insertion order** (most-recent first) with child spans for name, formatted amount, and category, plus a `<button class="tx-delete" aria-label="Delete {name}">×</button>`
    - Replace the entire `<ul>` contents on each call
    - Toggle `#list-placeholder` visibility: shown when empty, hidden otherwise
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 8.4 Write property test for most-recent-first render order (Property 8)
    - **Property 8: Transaction list renders in most-recent-first order**
    - For any sequence of N transactions, after rendering the list the first `<li>` data-id must match the last-added transaction's id
    - Tag: `// Feature: expense-budget-visualizer, Property 8: Render order`
    - Run ≥ 100 iterations
    - **Validates: Requirements 2.1, 3.3**

- [ ] 9. Checkpoint — Core data flow verified
  - Ensure all non-optional unit tests pass for Constants, Storage, Validation, State/Mutations, and Balance/List rendering
  - Ask the user if any questions arise before proceeding to chart integration

- [x] 10. Implement Chart Management (Chart.js integration)
  - [x] 10.1 Implement `initChart()` to create the Chart.js instance
    - Detect whether `window.Chart` is defined; if not, hide `<canvas>` and show a static fallback message in `#chart-placeholder`
    - If available, create a `new Chart(canvas, { type: 'pie', ... })` with empty initial data and store the instance in a module-scoped variable
    - _Requirements: 5.6_

  - [x] 10.2 Implement `updateChart()` called inside `renderChart()`
    - Compute per-category totals from `transactions`; exclude categories with a zero total from both `data.labels` and `data.datasets[0].data`
    - Map category names to colors via `CATEGORY_COLORS`
    - Call `chart.data = { labels, datasets }; chart.update()` to mutate the existing instance (no destroy/recreate)
    - Show `#chart-placeholder` and hide `<canvas>` when `transactions` is empty; reverse when non-empty
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [ ]* 10.3 Write property test for chart slice proportions (Property 5)
    - **Property 5: Chart slice proportions sum to 100%**
    - For any non-empty transaction collection, `sum(categoryTotal / grandTotal × 100)` must equal 100 ± 0.01
    - Tag: `// Feature: expense-budget-visualizer, Property 5: Slice proportions sum to 100`
    - Run ≥ 100 iterations
    - **Validates: Requirements 5.1**

  - [ ]* 10.4 Write property test for zero-amount category exclusion (Property 6)
    - **Property 6: Zero-amount categories produce no chart slice**
    - For any transaction collection where one or more categories have no entries, assert those categories do not appear in the computed chart labels array
    - Tag: `// Feature: expense-budget-visualizer, Property 6: Zero-amount category exclusion`
    - Run ≥ 100 iterations
    - **Validates: Requirements 5.7**

- [x] 11. Implement top-level `render()` orchestrator and Bootstrap
  - [x] 11.1 Implement `render()` that calls `renderBalanceDisplay()`, `renderTransactionList()`, and `renderChart()` synchronously
    - This is the single re-render entry point; all mutations call `render()` after `persist()`
    - _Requirements: 4.3, 4.4, 5.3, 5.4, 7.3_

  - [x] 11.2 Implement the `DOMContentLoaded` bootstrap handler
    - Call `load()` to initialize the in-memory `transactions` array from `localStorage`
    - Call `initChart()` to set up the Chart.js instance
    - Call `render()` to populate all three UI regions from loaded state
    - Wire the `#input-form` `submit` event: call `validate()`, show/clear inline errors, call `addTransaction()` on success and `form.reset()`
    - Wire delete via **event delegation** on `#transaction-list`: listen for clicks matching `.tx-delete`, extract `data-id` from the parent `<li>`, call `deleteTransaction(id)`
    - _Requirements: 1.3, 1.5, 1.6, 2.5, 3.3, 3.4_

- [x] 12. Final checkpoint — Full integration verified
  - Ensure all non-optional tests pass end-to-end
  - Manually verify: add transaction → list updates, balance updates, chart updates (all within 100 ms); delete transaction → same; page reload → state restored from localStorage; corrupt localStorage → empty state, no exception
  - Ask the user if any questions arise

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property-based tests require [fast-check](https://github.com/dubzzz/fast-check); since the app has no build step, tests should be run in a separate test harness (e.g., Node.js + fast-check) that imports the extracted pure functions
- Each task references specific requirements for full traceability
- Checkpoints at tasks 9 and 12 ensure incremental validation before adding complexity
- The Chart.js CDN fallback (task 10.1) must be wired before any chart rendering is attempted

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "4"] },
    { "id": 1, "tasks": ["1", "2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "5.1"] },
    { "id": 3, "tasks": ["5.2", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3"] },
    { "id": 7, "tasks": ["8.4", "10.1"] },
    { "id": 8, "tasks": ["10.2"] },
    { "id": 9, "tasks": ["10.3", "10.4", "11.1"] },
    { "id": 10, "tasks": ["11.2"] }
  ]
}
```
