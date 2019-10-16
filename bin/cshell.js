#!/usr/bin/env node
var program = require("commander");
var colors = require("colors");

program
  .version("2.0.4")
  .usage("[command] [option]")
  .command("upload", "upload files")
  .command("download", "download files")
  .command("refresh", "refresh files")
  .command("refreshDir", "refresh directory")
  .command("prefetch", "refresh files")
  .command("delete", "delete files of the bucket");

program.parse(process.argv);

if (
  ["upload", "download", "delete", "refresh", "refreshDir", "prefetch"].indexOf(
    program.args[0]
  ) === -1
) {
  console.log(
    colors.red(
      "expect command be upload、download、refresh or delete, but received " +
        program.args[0]
    )
  );
}
