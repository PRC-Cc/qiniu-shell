const { flush } = require("../utils/cdn");

module.exports = function refreshDir(program) {
  return flush(program, "refreshDir");
};
