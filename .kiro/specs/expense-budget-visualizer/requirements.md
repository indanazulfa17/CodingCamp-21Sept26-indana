# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that enables users to track personal expenses by category, visualize spending distribution through a pie chart, and monitor their running balance — all without a backend server. The app is built with HTML, CSS, and Vanilla JavaScript, persists data in browser Local Storage, and works as either a standalone web page or browser extension across all modern browsers.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense record composed of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI component that displays all saved transactions.
- **Input_Form**: The UI form component used to create a new Transaction.
- **Category**: A predefined classification for a Transaction. Valid values are: `Food`, `Transport`, and `Fun`.
- **Balance_Display**: The UI component at the top of the App that shows the computed total balance.
- **Chart**: The pie chart UI component that visualizes spending distribution by Category.
- **Local_Storage**: The browser's `localStorage` API used as the sole persistence layer.
- **Validator**: The client-side logic responsible for checking Input_Form field completeness before submission.

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to fill out a form with an item name, amount, and category so that I can record a new expense.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for the item name capped at 100 characters, a numeric field for the amount, and a dropdown selector for the Category.
2. THE Input_Form SHALL populate the Category dropdown with exactly three options: `Food`, `Transport`, and `Fun`.
3. WHEN the user submits the Input_Form with all fields filled, THE App SHALL create a new Transaction and add it to the Transaction_List.
4. WHEN the user submits the Input_Form, THE Validator SHALL check that the item name field is not empty, the amount field contains a numeric value greater than 0.00 and no greater than 999,999,999.99 with at most two decimal places, and a Category is selected.
5. IF the Validator detects that any required field is empty or invalid, THEN THE Input_Form SHALL display an inline error message identifying the missing or invalid field and SHALL NOT create a Transaction.
6. WHEN a Transaction is successfully created, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to see all my recorded expenses in a scrollable list so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all saved Transactions in the order they were added, from most recent to oldest.
2. THE Transaction_List SHALL render each Transaction entry showing the item name, the amount formatted as a currency value with exactly two decimal places, and the Category label.
3. WHILE the number of Transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL remain scrollable to allow access to all entries.
4. THE Transaction_List SHALL provide a delete control for each Transaction entry.
5. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Local_Storage and THE Transaction_List SHALL re-render immediately without requiring a page reload.
6. WHILE the Transaction_List contains no Transactions, THE Transaction_List SHALL display an empty-state placeholder message (e.g., "No transactions yet") to indicate that no data has been recorded.

---

### Requirement 3: Persistent Data Storage

**User Story:** As a user, I want my transactions to be saved between browser sessions so that I do not lose my data when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a new Transaction is created, THE App SHALL serialize and write the updated Transaction collection to Local_Storage under the key `"transactions"`.
2. WHEN a Transaction is deleted, THE App SHALL serialize and write the updated Transaction collection to Local_Storage under the key `"transactions"`.
3. WHEN the App initializes, THE App SHALL read and deserialize the Transaction collection from Local_Storage under the key `"transactions"` and render all previously saved Transactions in the Transaction_List in most-recent-to-oldest order.
4. IF Local_Storage contains no data under key `"transactions"` at initialization, THEN THE App SHALL render an empty Transaction_List with no thrown exceptions.
5. IF Local_Storage data under key `"transactions"` fails validation — where a valid Transaction collection requires each entry to have a non-empty name, a positive numeric amount, and a valid Category (`Food`, `Transport`, or `Fun`) — THEN THE App SHALL log the parse error to the browser console and initialize with an empty Transaction collection.

---

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see my total running balance at the top of the page so that I can quickly understand my overall spending at a glance.

#### Acceptance Criteria

1. THE Balance_Display SHALL be positioned at the top of the App's main content area and remain visible without scrolling.
2. THE Balance_Display SHALL compute the total balance as the sum of the amounts of all Transactions currently in the Transaction_List, where expenses are positive values and the net total reflects total spending.
3. WHEN a Transaction is added to the Transaction_List, THE Balance_Display SHALL update to reflect the new total within 100 milliseconds without requiring a page reload.
4. WHEN a Transaction is deleted from the Transaction_List, THE Balance_Display SHALL update to reflect the new total within 100 milliseconds without requiring a page reload.
5. THE Balance_Display SHALL format the total balance as a currency value with two decimal places; the supported display range is 0.00 to 999,999,999.99.
6. IF the Transaction_List contains no Transactions, THE Balance_Display SHALL show "0.00".

---

### Requirement 5: Spending Distribution Chart

**User Story:** As a user, I want to see a pie chart of my spending by category so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render as a pie chart where each slice proportion is calculated as (category total / grand total) × 100, rounded to two decimal places.
2. THE Chart SHALL assign a distinct color to each Category (`Food`, `Transport`, `Fun`) where the color assigned to each Category SHALL remain consistent across renders, and SHALL include a legend mapping each color to its Category label.
3. WHEN a Transaction is added to the Transaction_List, THE Chart SHALL update automatically to reflect the new spending distribution within 100 milliseconds without requiring a page reload.
4. WHEN a Transaction is deleted from the Transaction_List, THE Chart SHALL update automatically to reflect the revised spending distribution within 100 milliseconds without requiring a page reload.
5. WHILE the Transaction_List contains no Transactions, THE Chart SHALL display a visible placeholder message (e.g., "No data available") instead of an empty chart.
6. WHERE Chart.js is loaded as a chart library, THE App SHALL use Chart.js to render the Chart; otherwise THE App SHALL use an alternative lightweight chart library.
7. IF a Category has a total amount of zero, THE Chart SHALL NOT render a slice for that Category.

---

### Requirement 6: Project Structure and Code Organization

**User Story:** As a developer, I want the codebase to follow a clear folder structure so that the project is easy to navigate and maintain.

#### Acceptance Criteria

1. THE App SHALL contain exactly one CSS file located inside a `css/` directory.
2. THE App SHALL contain exactly one JavaScript file located inside a `js/` directory.
3. THE App's HTML entry point SHALL be a single `index.html` file at the project root.
4. THE App SHALL not require a backend server or build step to run; opening `index.html` directly in a browser SHALL be sufficient to launch the App.

---

### Requirement 7: Browser Compatibility and Performance

**User Story:** As a user, I want the app to work across modern browsers and respond immediately to my interactions so that I have a smooth experience.

#### Acceptance Criteria

1. THE App SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari without polyfills or browser-specific workarounds.
2. THE App SHALL render the initial page, including all UI components, within 2 seconds on a standard broadband connection, where standard broadband is defined as a download speed of at least 10 Mbps.
3. WHEN the user adds or deletes a Transaction, THE App SHALL update the Balance_Display, Transaction_List, and Chart within 100 milliseconds of the action completing.
4. THE App SHALL apply a clean, minimal visual style with clear visual hierarchy and readable typography — including a minimum 16px body font size, a 1.5 line-height, and at least a 4.5:1 color contrast ratio for text against its background — across all screen sizes where the App is rendered.
