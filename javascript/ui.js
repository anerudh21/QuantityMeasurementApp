export function populateDropdown(selectEl, units) {
  if (!selectEl) {
    console.warn("selectEl is null or undefined");
    return;
  }

  selectEl.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = "-- Select Unit --";
  selectEl.appendChild(defaultOption);

  if (units && Array.isArray(units)) {
    units.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.symbol;
      opt.textContent = `${u.label} (${u.symbol})`;
      selectEl.appendChild(opt);
    });
  }
}

export function setActive(parentEl, clickedEl, childSelector) {
  if (!parentEl) {
    return;
  }

  parentEl.querySelectorAll(childSelector).forEach(el => el.classList.remove("active"));
  clickedEl.classList.add("active");
}

export function showResult(value, unitSymbol) {
  const resultValueEl = document.querySelector("#result-value");
  const resultUnitEl = document.querySelector("#result-unit");

  if (value === null || value === undefined) {
    if (resultValueEl) resultValueEl.textContent = "—";
    if (resultUnitEl) resultUnitEl.textContent = unitSymbol || "";
    return;
  }

  if (resultValueEl) {
    resultValueEl.textContent = value;
  }
  if (resultUnitEl) {
    resultUnitEl.textContent = unitSymbol || "";
  }

  const resultPanel = resultValueEl?.parentElement;
  if (resultPanel) {
    resultPanel.classList.add("highlight");
    
    setTimeout(() => {
      resultPanel.classList.remove("highlight");
    }, 1500);
  }
}

export function toggleOperators(show) {
  const operatorSelector = document.querySelector(".operator-row");
  
  if (!operatorSelector) {
    console.warn("Element .operator-row not found");
    return;
  }

  operatorSelector.style.display = show ? "flex" : "none";
}

export function renderHistory(records) {
  const list = document.querySelector("#history-list");
  
  if (!list) {
    console.warn("Element #history-list not found");
    return;
  }

  if (!records || !Array.isArray(records)) {
    records = [];
  }

  list.innerHTML = "";

  if (records.length === 0) {
    const placeholder = document.createElement("li");
    placeholder.className = "history-placeholder";
    placeholder.textContent = "No history yet.";
    list.appendChild(placeholder);
    return;
  }

  records.forEach(r => {
    const li = document.createElement("li");
    const timestamp = new Date(r.timestamp).toLocaleString();
    li.textContent = `${r.expression}  =  ${r.result}  (${timestamp})`;
    list.appendChild(li);
  });
}