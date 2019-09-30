const { flush } = require("../utils/cdn");

module.exports = function prefetch(program) {
  return flush(program, "prefetch");
};
