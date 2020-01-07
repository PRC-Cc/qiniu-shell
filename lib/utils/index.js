const colors = require("colors");
const path = require("path");
const fs = require("fs");

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

module.exports = {
  isEmpty(data) {
    return data == null || data === true;
  },
  log: {
    success(msg) {
      console.log(colors.green(msg));
    },
    fail(msg) {
      console.log(colors.red(msg));
    },
    failAndExit(msg) {
      console.log(colors.red(msg));
      process.exit(1);
    },
    error(err) {
      if (err && err.message) {
        this.failAndExit(err.message);
      } else {
        throw err;
      }
    },
    info() {
      console.log(...arguments);
    }
  },
  mkdirsSync
};
