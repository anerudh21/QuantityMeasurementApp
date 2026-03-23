import { getUnits } from "./api.js";
import { populateDropdown, setActive, showResult } from "./ui.js";


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

        state.fromUnit = "";
        state.toUnit = "";
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