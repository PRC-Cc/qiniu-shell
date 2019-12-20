#!/usr/bin/env node
const program = require("commander");
const colors = require("colors");
const { log, isEmpty } = require("../lib/utils");

program
  .usage("[option]")
  .option("-a, --accessKey [value]", "AccessKey")
  .option("-s, --secretKey [value]", "SecretKey")
  .option("-b, --bucket [value]", "Bucket")
  .option("-p, --prefix [value]", "Prefix of files")
  .option("-f, --force", "Whether to overwrite upload.")
  .option(
    "-z --zone [value]",
    'Online zone. one of "huad"、"huab"、"huan"、"beim"、"z0"、"z1"、"z2"、"na0"'
  )
  .option(
    "-o, --originDirectoryPath [value]",
    'Directory\'s path of the files to upload, default is "dist"'
  )
  .option(
    "-n, --concurrencyNumber [value]",
    'Concurrency number of action. default is 40'
  )
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

require("../lib/scripts/upload.js")(program);
