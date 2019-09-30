#!/usr/bin/env node
const program = require("commander");
const colors = require("colors");
const { log, isEmpty } = require("../lib/utils");

program
  .usage("[option]")
  .option("-a, --accessKey [value]", "AccessKey")
  .option("-s, --secretKey [value]", "SecretKey")
  .option("-b, --bucket [value]", "Bucket")
  .option("-p, --prefix [value]", "Prefix of files. If don't set it, all files of buckt will be deleted.")
  .parse(process.argv);

if (isEmpty(program.accessKey)) {
  log.failAndExit("AccessKey is null");
}
if (isEmpty(program.secretKey)) {
  log.failAndExit("SecretKey is null");
}
if (isEmpty(program.bucket)) {
  log.failAndExit("Bucket is null");
}

require("../lib/scripts/delete.js")(program);
