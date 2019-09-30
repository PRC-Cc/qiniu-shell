#!/usr/bin/env node
const program = require("commander");
const colors = require("colors");
const { log, isEmpty } = require("../lib/utils");

program
  .usage("[option]")
  .option("-a, --accessKey [value]", "AccessKey")
  .option("-s, --secretKey [value]", "SecretKey")
  .option("-u, --urls [value]", 'Urls of refresh directory. Split by ","')
  .option(
    "-c, --configFile [path]",
    'Path of refresh directory file. If set this, "-u" will be useless'
  )
  .parse(process.argv);

if (isEmpty(program.accessKey)) {
  log.failAndExit("AccessKey is null");
}
if (isEmpty(program.secretKey)) {
  log.failAndExit("SecretKey is null");
}
if (isEmpty(program.urls) && isEmpty(program.configFile)) {
  log.failAndExit("You should set at least one parameter in urls and config");
}

require("../lib/scripts/refreshDir.js")(program);
