const BASE_URL = "https://api.measurement.azaken.com";


export async function getUnits(type) {
  const res = await fetch(`${BASE_URL}/units?type=${type}`);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch units for type "${type}"`);
  }
  
  return await res.json();
}

export async function getHistory() {
  const res = await fetch(`${BASE_URL}/history`);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch history`);
  }
  
  return await res.json();
}

export async function getConversion(from, to) {
  if (from === to) {
    return { from, to, factor: 1, formula: "1:1" };
  }

  const res = await fetch(`${BASE_URL}/conversions?from=${from}&to=${to}`);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch conversion for "${from}" to "${to}"`);
  }

  const data = await res.json();
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Conversion not available for unit pair "${from}" → "${to}"`);
  }
  
  return data[0];
}