// Expense & Budget Visualizer — app

// === Constants ===

const STORAGE_KEY       = "transactions";
const LIMIT_STORAGE_KEY = "spendingLimit";
const THEME_STORAGE_KEY = "theme";

const CATEGORIES = ["Food", "Transport", "Fun"];

const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56",
};

const AMOUNT_MAX      = 999_999_999.99;
const NAME_MAX_LENGTH = 100;

const RULES = {
  name:     { required: true, maxLength: NAME_MAX_LENGTH },
  amount:   { required: true, min: 0.000001, max: AMOUNT_MAX, maxDecimals: 2 },
  category: { required: true, values: CATEGORIES },
};

// === Storage ===

function persist(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null || raw === "") return [];
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (err) { console.error("Failed to parse transactions from localStorage:", err); return []; }
  if (!Array.isArray(parsed)) { console.error("Invalid transactions data in localStorage: expected an array."); return []; }
  for (const entry of parsed) {
    const nameValid     = typeof entry.name === "string" && entry.name.trim().length > 0;
    const amountValid   = typeof entry.amount === "number" && isFinite(entry.amount) && entry.amount > 0 && entry.amount <= AMOUNT_MAX;
    const categoryValid = CATEGORIES.includes(entry.category);
    if (!nameValid || !amountValid || !categoryValid) {
      console.error("Invalid transaction entry found in localStorage; discarding entire collection.", entry);
      return [];
    }
  }
  return parsed;
}

// === Spending Limit Storage ===

function persistLimit(value) {
  localStorage.setItem(LIMIT_STORAGE_KEY, String(value));
}

function loadLimit() {
  const raw = localStorage.getItem(LIMIT_STORAGE_KEY);
  if (raw === null) return 0;
  const n = parseFloat(raw);
  return isFinite(n) && n >= 0 ? n : 0;
}

// === Theme Storage ===

function persistTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function loadTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const btn = document.getElementById("theme-toggle");

  if (btn) {
    const isDark = theme === "dark";

    btn.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    btn.setAttribute("aria-checked", String(isDark));
  }
}

// === Validation ===

function validate(formData) {
  const errors = {};
  const trimmedName = (formData.name ?? "").trim();
  if (trimmedName.length === 0) {
    errors.name = "Item name is required.";
  } else if (trimmedName.length > NAME_MAX_LENGTH) {
    errors.name = `Item name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }
  const rawAmount = (formData.amount ?? "").trim();
  if (rawAmount === "") {
    errors.amount = "Amount is required.";
  } else {
    const num = Number(rawAmount);
    if (isNaN(num) || !isFinite(num)) {
      errors.amount = "Amount must be a valid number.";
    } else if (num <= 0) {
      errors.amount = "Amount must be greater than 0.";
    } else if (num > AMOUNT_MAX) {
      errors.amount = `Amount must be no greater than ${AMOUNT_MAX.toLocaleString()}.`;
    } else {
      const dotIndex = rawAmount.indexOf(".");
      if (dotIndex !== -1 && rawAmount.length - dotIndex - 1 > 2) {
        errors.amount = "Amount must have at most 2 decimal places.";
      }
    }
  }
  if (!CATEGORIES.includes(formData.category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(", ")}.`;
  }
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

// === State ===

let transactions = [];
let spendingLimit = 0;

// === Mutations ===

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now() + "-" + Math.random().toString(36).slice(2);
}

function addTransaction(formData) {
  const transaction = {
    id:        generateId(),
    name:      formData.name.trim(),
    amount:    parseFloat(formData.amount),
    category:  formData.category,
    createdAt: Date.now(),
  };
  transactions.push(transaction);
  persist(transactions);
  render();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  persist(transactions);
  render();
}

// === Sorting ===

function getSortedTransactions() {
  const sortEl = document.getElementById("sort-select");
  const mode   = sortEl ? sortEl.value : "newest";
  const copy   = [...transactions];
  switch (mode) {
    case "amount-desc": return copy.sort((a, b) => b.amount - a.amount);
    case "amount-asc":  return copy.sort((a, b) => a.amount - b.amount);
    case "category":    return copy.sort((a, b) => a.category.localeCompare(b.category));
    case "newest":
    default:            return copy.reverse();
  }
}

// === Rendering ===

function formatCurrency(amount) {
  if (typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function") {
    return new Intl.NumberFormat("en-US", {
      style:                 "currency",
      currency:              "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  const fixed              = amount.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withCommas         = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withCommas}.${decPart}`;
}

function renderBalanceDisplay() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const el    = document.getElementById("balance-display");
  if (el) {
    el.textContent = formatCurrency(total);
    if (spendingLimit > 0 && total > spendingLimit) {
      el.classList.add("over-limit");
    } else {
      el.classList.remove("over-limit");
    }
  }
}

function renderTransactionList() {
  const ul          = document.getElementById("transaction-list");
  const placeholder = document.getElementById("list-placeholder");
  if (!ul) return;
  ul.innerHTML = "";
  if (transactions.length === 0) {
    if (placeholder) placeholder.hidden = false;
    return;
  }
  if (placeholder) placeholder.hidden = true;
  for (const tx of getSortedTransactions()) {
    const li = document.createElement("li");
    li.dataset.id = tx.id;
    const nameSpan = document.createElement("span");
    nameSpan.className   = "tx-name";
    nameSpan.textContent = tx.name;
    const amountSpan = document.createElement("span");
    amountSpan.className   = "tx-amount";
    amountSpan.textContent = formatCurrency(tx.amount);
    const categorySpan = document.createElement("span");
    categorySpan.className   = "tx-category";
    categorySpan.textContent = tx.category;
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "tx-delete";
    deleteBtn.setAttribute("aria-label", `Delete ${tx.name}`);
    deleteBtn.textContent = "x";
    li.appendChild(nameSpan);
    li.appendChild(amountSpan);
    li.appendChild(categorySpan);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  }
}

// === Chart Management ===

let chart = null;

function initChart() {
  const canvas      = document.getElementById("spending-chart");
  const placeholder = document.getElementById("chart-placeholder");
  if (!window.Chart) {
    if (canvas)      canvas.hidden = true;
    if (placeholder) { placeholder.textContent = "Chart library not available"; placeholder.hidden = false; }
    return;
  }
  chart = new window.Chart(canvas, {
    type: "pie",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });
}

function updateChart() {
  const totals = {};
  for (const category of CATEGORIES) totals[category] = 0;
  for (const tx of transactions) {
    if (totals[tx.category] !== undefined) totals[tx.category] += tx.amount;
  }
  const labels = [], data = [], backgroundColor = [];
  for (const category of CATEGORIES) {
    if (totals[category] > 0) {
      labels.push(category);
      data.push(totals[category]);
      backgroundColor.push(CATEGORY_COLORS[category]);
    }
  }
  chart.data = { labels, datasets: [{ data, backgroundColor }] };
  chart.update();
}

function renderChart() {
  if (chart === null) return;
  const canvas      = document.getElementById("spending-chart");
  const placeholder = document.getElementById("chart-placeholder");
  if (transactions.length === 0) {
    if (canvas)      canvas.hidden = true;
    if (placeholder) placeholder.hidden = false;
  } else {
    if (canvas)      canvas.hidden = false;
    if (placeholder) placeholder.hidden = true;
    updateChart();
  }
}

// === Top-level render ===

function render() {
  renderBalanceDisplay();
  renderTransactionList();
  renderChart();
}

// === Bootstrap ===

document.addEventListener("DOMContentLoaded", () => {
  // 1. Load persisted state
  transactions  = load();
  spendingLimit = loadLimit();

  // 2. Apply saved theme before first paint
  applyTheme(loadTheme());

  // 3. Chart + initial render
  initChart();
  render();

  // 4. Populate spending limit input
  const limitInput = document.getElementById("spending-limit");
  if (limitInput && spendingLimit > 0) {
    limitInput.value = spendingLimit;
  }

  // 5. Form submit handler
  const form          = document.getElementById("input-form");
  const nameInput     = document.getElementById("item-name");
  const amountInput   = document.getElementById("item-amount");
  const categoryInput = document.getElementById("item-category");
  const nameError     = document.getElementById("name-error");
  const amountError   = document.getElementById("amount-error");
  const categoryError = document.getElementById("category-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    nameError.textContent = ""; amountError.textContent = ""; categoryError.textContent = "";
    nameError.classList.remove("visible"); amountError.classList.remove("visible"); categoryError.classList.remove("visible");
    const formData = { name: nameInput.value, amount: amountInput.value, category: categoryInput.value };
    const result = validate(formData);
    if (!result.ok) {
      if (result.errors.name)     { nameError.textContent     = result.errors.name;     nameError.classList.add("visible"); }
      if (result.errors.amount)   { amountError.textContent   = result.errors.amount;   amountError.classList.add("visible"); }
      if (result.errors.category) { categoryError.textContent = result.errors.category; categoryError.classList.add("visible"); }
      return;
    }
    addTransaction(formData);
    form.reset();
  });

  // 6. Delete via event delegation
  const list = document.getElementById("transaction-list");
  list.addEventListener("click", (event) => {
    const btn = event.target.closest(".tx-delete");
    if (!btn) return;
    const li = btn.closest("li");
    if (!li) return;
    const id = li.dataset.id;
    if (id) deleteTransaction(id);
  });

  // 7. Sort control
  const sortSelect = document.getElementById("sort-select");
  sortSelect.addEventListener("change", () => renderTransactionList());

  // 8. Spending limit
  if (limitInput) {
    limitInput.addEventListener("input", () => {
      const val = parseFloat(limitInput.value);
      spendingLimit = isFinite(val) && val >= 0 ? val : 0;
      persistLimit(spendingLimit);
      renderBalanceDisplay();
    });
  }

  // 9. Theme toggle
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      persistTheme(next);
    });
  }
});
