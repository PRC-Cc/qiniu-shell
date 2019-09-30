#!/usr/bin/env node
const program = require("commander");
const colors = require("colors");
const { log, isEmpty } = require("../lib/utils");

program
  .usage("[option]")
  .option("-a, --accessKey [value]", "AccessKey")
  .option("-s, --secretKey [value]", "SecretKey")
  .option("-u, --urls [value]", 'Urls of prefetch files. Split by ","')
  .option(
    "-c, --configFile [value]",
    'Path of prefetch urls file. If set this, "-u" will be useless'
  )
  .parse(process.argv);

if (isEmpty(program.accessKey)) {
  log.failAndExit("AccessKey is null");
}
if (isEmpty(program.secretKey)) {
  log.failAndExit("SecretKey is null");
}
if (isEmpty(program.urls) && isEmpty(program.config)) {
  log.failAndExit("You should set at least one parameter in urls and config");
}

require("../lib/scripts/prefetch.js")(program);
