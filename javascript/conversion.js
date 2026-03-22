export function applyConversion(value, convObj) {
  if (isNaN(value)) {
    throw new Error("Invalid number");
  }

  if (convObj.factor !== null && convObj.factor !== undefined) {
    const result = value * convObj.factor;
    return parseFloat(result.toFixed(6));
  }

  if (convObj.formula) {
    try {
      const expr = convObj.formula.replace(/x/g, value);
      const result = eval(expr);
      return parseFloat(result.toFixed(6));
    } catch (error) {
      throw new Error(`Bad formula: ${error.message}`);
    }
  }

  throw new Error("No conversion factor or formula provided");
}

export function compareValues(v1, u1, v2, u2, base1, base2) {
  if (isNaN(v1) || isNaN(v2) || isNaN(base1) || isNaN(base2)) {
    return "Invalid values — cannot compare";
  }

  if (base1 > base2) {
    return `${v1} ${u1} is GREATER than ${v2} ${u2}`;
  }

  if (base1 < base2) {
    return `${v1} ${u1} is LESS than ${v2} ${u2}`;
  }

  return `${v1} ${u1} is EQUAL to ${v2} ${u2}`;
}

export function performArithmetic(v1, v2normalised, op) {
  switch (op) {
    case "+":
      return parseFloat((v1 + v2normalised).toFixed(6));
    
    case "-":
      return parseFloat((v1 - v2normalised).toFixed(6));
    
    case "*":
      return parseFloat((v1 * v2normalised).toFixed(6));
    
    case "/":
      if (v2normalised === 0) {
        throw new Error("Cannot divide by zero");
      }
      return parseFloat((v1 / v2normalised).toFixed(6));
    
    default:
      throw new Error("Unknown operator");
  }
}