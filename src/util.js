module.exports.moneyStringToNumber = function moneyStringToNumber(moneyString) {
  const trimmedString = moneyString.substring(1, moneyString.length);

  let returnValue = parseFloat(trimmedString.replace(",", ""), 10);

  if (returnValue.isNan) {
    returnValue = null;
  }

  return returnValue;
};

module.exports.parseName = function parseName(string) {
  return string.substring(0, string.indexOf(":") - 1);
};

module.exports.parseStore = function parseStore(string) {
  return string.substring(string.indexOf(":") + 2, string.indexOf("(") - 1);
};
