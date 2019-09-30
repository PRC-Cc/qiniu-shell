const { flush } = require("../utils/cdn");

module.exports = function refresh(program) {
  return flush(program, "refresh");
};
