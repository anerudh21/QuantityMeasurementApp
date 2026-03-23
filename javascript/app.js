import { getUnits, getConversion, saveHistory, getHistory } from "./api.js";
import { populateDropdown, setActive, showResult, toggleOperators, renderHistory, attachHistorySearch } from "./ui.js";
import { applyConversion, compareValues, performArithmetic } from "./conversion.js";


export function handleTypeCardClick(state, showErrorBanner) {
  const cards = document.querySelectorAll(".card");
  const cardsContainer = cards[0]?.parentElement;
  
  if (!cardsContainer) {
    console.warn("Cards container not found");
    return;
  }

  cards.forEach((card) => {
    card.addEventListener("click", async () => {
      const selectedType = card.dataset.type;
      if (!selectedType) return;

      state.type = selectedType;
      setActive(cardsContainer, card, ".card");

      const fromInput = document.querySelector(".input-container .input-field");
      const toInput = document.querySelectorAll(".input-container .input-field")[1];
      if (fromInput) fromInput.value = "";
      if (toInput) toInput.value = "";
      
      const resultContainer = document.querySelector(".result-container");
      if (resultContainer) resultContainer.style.display = "none";
      
      state.fromVal = null;
      state.toVal = null;
      state.fromUnit = "";
      state.toUnit = "";
      
      showResult(0, "");

      try {
        const unitsPayload = await getUnits(selectedType);
        const units = Array.isArray(unitsPayload) ? unitsPayload : unitsPayload?.units || [];
        
        if (!Array.isArray(units)) {
          throw new Error("Invalid units response");
        }

        const fromSelect = document.querySelector(".input-container .unit-dropdown");
        const toSelect = document.querySelectorAll(".input-container .unit-dropdown")[1];

        if (fromSelect) populateDropdown(fromSelect, units);
        if (toSelect) populateDropdown(toSelect, units);
        
        if (units.length > 0) {
          if (fromSelect) fromSelect.value = units[0].symbol;
          if (toSelect) toSelect.value = units[0].symbol;
        }

        state.fromUnit = fromSelect?.value || "";
        state.toUnit = toSelect?.value || "";
      } catch (error) {
        if (error instanceof TypeError) {
          showErrorBanner("Server unavailable");
        } else {
          showErrorBanner("Failed to load units");
        }
      }
    });
  });
}

export function handleActionTabClick(state) {
  const buttons = document.querySelectorAll(".action-btn");
  const buttonsContainer = buttons[0]?.parentElement;

  if (!buttonsContainer) {
    console.warn("Action buttons container not found");
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedAction = button.dataset.action;
      if (!selectedAction) return;

      state.action = selectedAction;
      setActive(buttonsContainer, button, ".action-btn");

      toggleOperators(state.action === "arithmetic");
      updateHeaders(state.action);

      const resultContainer = document.querySelector(".result-container");
      if (resultContainer) resultContainer.style.display = "none";
      
      const fromInput = document.querySelector(".input-container .input-field");
      const toInput = document.querySelectorAll(".input-container .input-field")[1];
      if (fromInput) fromInput.value = "";
      if (toInput) {
        toInput.value = "";
        if (state.action === "conversion") {
          toInput.readOnly = true;
          toInput.style.cursor = "default";
          toInput.style.backgroundColor = "#45475a";
        } else {
          toInput.readOnly = false;
          toInput.style.cursor = "text";
          toInput.style.backgroundColor = "transparent";
        }
      }
    
      state.fromVal = null;
      state.toVal = null;
      showResult(0, "");
      
      if (state.action === "conversion" && resultContainer) {
        resultContainer.style.display = "none";
      }
    });
  });
}

export function updateHeaders(action) {
  const headers = document.querySelectorAll(".table-header span");
  if (headers.length < 2) return;

  let fromLabel = "FROM";
  let toLabel = "TO";

  if (action === "comparison") {
    fromLabel = "VALUE 1";
    toLabel = "VALUE 2";
  } else if (action === "arithmetic") {
    fromLabel = "VALUE";
    toLabel = "OPERAND";
  }

  headers[0].textContent = fromLabel;
  headers[1].textContent = toLabel;
}


export async function calculate(state, showErrorBanner) {
  try {
    const resultContainer = document.querySelector(".result-container");
    
    if (state.action === "conversion") {
      if (!state.fromVal || state.fromVal <= 0 || !state.fromUnit || !state.toUnit) {
        if (resultContainer) resultContainer.style.display = "none";
        const toInput = document.querySelectorAll(".input-container .input-field")[1];
        if (toInput) toInput.value = "";
        return;
      }
      
      const conv = await getConversion(state.fromUnit, state.toUnit);
      const result = applyConversion(state.fromVal, conv);
      const toInput = document.querySelectorAll(".input-container .input-field")[1];
      if (toInput) toInput.value = result;
      if (resultContainer) resultContainer.style.display = "none";
    }
    else if (state.action === "comparison") {
      if (!state.fromVal || state.fromVal <= 0 || !state.fromUnit || !state.toVal || state.toVal <= 0 || !state.toUnit) {
        if (resultContainer) resultContainer.style.display = "none";
        return;
      }

      const conv = await getConversion(state.fromUnit, state.toUnit);
      const base1 = applyConversion(state.fromVal, conv);
      const base2 = state.toVal;
      const result = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
      
      if (resultContainer) resultContainer.style.display = "flex";
      showResult(result, "");
      
      const record = {
        type: state.type,
        action: state.action,
        expression: `${state.fromVal} ${state.fromUnit} vs ${state.toVal} ${state.toUnit}`,
        result: result,
        timestamp: new Date().toISOString()
      };
      await saveHistory(record);
      const historyPayload = await getHistory();
      const historyItems = Array.isArray(historyPayload) ? historyPayload : historyPayload?.history || [];
      renderHistory(historyItems);
      attachHistorySearch(historyItems);
    }
    else if (state.action === "arithmetic") {
      if (!state.fromVal || state.fromVal <= 0 || !state.fromUnit || !state.toVal || state.toVal <= 0 || !state.toUnit || !state.operator) {
        if (resultContainer) resultContainer.style.display = "none";
        return;
      }

      const convToFrom = await getConversion(state.toUnit, state.fromUnit);
      const normalizedToVal = applyConversion(state.toVal, convToFrom);
      const result = performArithmetic(state.fromVal, normalizedToVal, state.operator);
      
      if (resultContainer) resultContainer.style.display = "flex";
      showResult(result, state.fromUnit);
      
      const record = {
        type: state.type,
        action: state.action,
        expression: `${state.fromVal} ${state.fromUnit} ${state.operator} ${state.toVal} ${state.toUnit}`,
        result: result,
        timestamp: new Date().toISOString()
      };
      await saveHistory(record);
      const historyPayload = await getHistory();
      const historyItems = Array.isArray(historyPayload) ? historyPayload : historyPayload?.history || [];
      renderHistory(historyItems);
      attachHistorySearch(historyItems);
    }
  } catch (error) {
    showResult(`Error: ${error.message}`, "");
    if (showErrorBanner) {
      showErrorBanner(error.message);
    }
  }
}