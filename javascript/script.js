import { getUnits, getHistory } from "./api.js";
import { populateDropdown, setActive, toggleOperators, renderHistory, showResult } from "./ui.js";
import { handleTypeCardClick } from "./app.js";

const state = {
  type: "length",
  action: "conversion",
  fromVal: null,
  fromUnit: "",
  toVal: null,
  toUnit: "",
  operator: "+"
};

let cachedUnits = [];
let cachedHistory = [];

document.addEventListener("DOMContentLoaded", async () => {
  function attachEventListeners() {
    handleTypeCardClick(state, showErrorBanner);

    const actionButtons = document.querySelectorAll(".action-button");
    const buttonsContainer = actionButtons[0]?.parentElement;
    actionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setActive(buttonsContainer, button, ".action-button");
        state.action = (button.textContent || "conversion").trim().toLowerCase();
        toggleOperators(state.action === "arithmetic");
      });
    });

    const operatorDropdown = document.querySelector(".operator-dropdown");
    if (operatorDropdown) {
      operatorDropdown.addEventListener("change", (event) => {
        state.operator = event.target.value;
      });
    }
  }

  async function loadUnits(type) {
    let allUnits;
    try {
      const unitsPayload = await getUnits(type);
      allUnits = Array.isArray(unitsPayload) ? unitsPayload : unitsPayload?.units;
      if (!Array.isArray(allUnits)) {
        throw new Error("Invalid units response");
      }
      cachedUnits = allUnits;
    } catch (error) {
      allUnits = cachedUnits;
      if (!Array.isArray(allUnits) || allUnits.length === 0) {
        throw error;
      }
    }

    const matchingUnits = allUnits.filter((unit) => String(unit.type).toLowerCase() === type.toLowerCase());
    const unitDropdowns = document.querySelectorAll(".unit-dropdown");

    unitDropdowns.forEach((dropdown) => {
      populateDropdown(dropdown, matchingUnits);
    });

    state.fromUnit = unitDropdowns[0]?.value || "";
    state.toUnit = unitDropdowns[1]?.value || "";
  }

  function setInitialActiveSelections() {
    const firstTypeCard = document.querySelector(".card");
    const firstActionButton = document.querySelector(".action-button");
    if (firstTypeCard) firstTypeCard.classList.add("active");
    if (firstActionButton) firstActionButton.classList.add("active");
  }

  async function loadHistory() {
    try {
      const historyPayload = await getHistory();
      const items = Array.isArray(historyPayload) ? historyPayload : historyPayload?.history || [];
      cachedHistory = items;
      renderHistory(cachedHistory);
    } catch (_) {
      cachedHistory = cachedHistory || [];
      renderHistory(cachedHistory);
    }
  }

  function showErrorBanner(message) {
    let banner = document.getElementById("error-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "error-banner";
      banner.style.background = "#fee2e2";
      banner.style.color = "#991b1b";
      banner.style.padding = "10px 12px";
      banner.style.margin = "10px 0";
      banner.style.border = "1px solid #fca5a5";
      banner.style.borderRadius = "6px";
      document.body.prepend(banner);
    }

    banner.textContent = message;
  }

  attachEventListeners();

  try {
    await loadUnits("length");
  } catch (error) {
    if (error instanceof TypeError) {
      showErrorBanner("Server unavailable");
    } else {
      showErrorBanner("Failed to load units");
    }
  }

  setInitialActiveSelections();
  toggleOperators(false);

  try {
    await loadHistory();
  } catch (error) {
    if (error instanceof TypeError) {
      showErrorBanner("Server unavailable");
    } else {
      showErrorBanner("Failed to load history");
    }
  }
});