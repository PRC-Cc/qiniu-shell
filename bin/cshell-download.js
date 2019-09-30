#!/usr/bin/env node
const program = require("commander");
const colors = require("colors");
const { log, isEmpty } = require("../lib/utils");

program
  .usage("[option]")
  .option("-a, --accessKey [value]", "AccessKey")
  .option("-s, --secretKey [value]", "SecretKey")
  .option("-b, --bucket [value]", "Bucket")
  .option("-d, --publicDomain [value]", "Public domain of bucket")
  .option("--privateDomain [value]", 'Private domain of bucket. If set this, "-d" will be useless')
  .option("-p, --prefix [value]", "Prefix of files")
  .option(
    "-o, --outputDirectoryPath [value]",
    'The path of the downloaded file, default is "dist"'
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
if (isEmpty(program.publicDomain) && isEmpty(program.privateDomain)) {
  log.failAndExit(
    "You should set at least one parameter in publicDomain and privateDomain"
  );
}

require("../lib/scripts/download.js")(program);
