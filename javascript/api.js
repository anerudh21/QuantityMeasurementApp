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