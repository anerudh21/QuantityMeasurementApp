export function applyConversion(value, convObj) {
  if (isNaN(value)) {
    throw new Error("Invalid number");
  }

  if (convObj.factor === 1 || (convObj.formula && convObj.formula === "x")) {
    return value;
  }

  if (convObj.factor !== null && convObj.factor !== undefined) {
    return parseFloat((value * convObj.factor).toFixed(6));
  }

  if (convObj.formula !== null && convObj.formula !== undefined) {
    try {
      const expr = convObj.formula.replace(/x/g, value);
      return parseFloat(eval(expr).toFixed(6));
    } catch (error) {
      throw new Error("Bad formula");
    }
  }

  throw new Error("Invalid conversion object");
}