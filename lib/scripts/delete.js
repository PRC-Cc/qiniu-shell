const path = require("path");
const fs = require("fs");
const qiniu = require("qiniu");
const colors = require("colors");
const inquirer = require("inquirer");
const { isEmpty, log, mkdirsSync } = require("../utils");

let bucket;
let bucketManager;

function init(program) {
  const accessKey = program.accessKey;
  const secretKey = program.secretKey;
  bucket = program.bucket;
  const prefix = isEmpty(program.prefix) ? "" : program.prefix;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_z2;
  bucketManager = new qiniu.rs.BucketManager(mac, config);
  bucketManager.listPrefix(
    bucket,
    {
      prefix
    },
    function(err, respBody, respInfo) {
      if (err) {
        log.error(err);
      }
      if (respInfo.statusCode == 200) {
        const items = respBody.items;
        handleTipChoose(items);
      } else {
        log.fail(
          `List ${bucket} ${prefix} error. ${respInfo.statusCode} ${respBody.error}`
        );
      }
    }
  );
}

function handleTipChoose(items) {
  const deleteOperations = [];
  items.forEach(function(item, index) {
    deleteOperations.push(qiniu.rs.deleteOp(bucket, item.key));
    log.info(`${bucket}: ${items[index].key}`);
  });

  const deleteFilesLen = deleteOperations.length;

  if (deleteFilesLen === 0) {
    log.failAndExit("There are no files to delete. Please check your config.");
  }

  inquirer
    .prompt([
      {
        name: "choice",
        message: colors.red(
          `${deleteFilesLen} files will be deleted.Are you sure you want to do this?(Y/N)`
        )
      }
    ])
    .then(answers => {
      const { choice } = answers;
      if (choice === "y" || choice === "Y") {
        handleDelete(items, deleteOperations);
      } else {
        process.exit();
      }
    });
}

function handleDelete(items, deleteOperations) {
  bucketManager.batch(deleteOperations, function(err, respBody, respInfo) {
    if (err) {
      log.error(err);
    } else {
      // 200 is success, 298 is part success
      if (parseInt(respInfo.statusCode / 100) == 2) {
        respBody.forEach(function(item, index) {
          if (item.code == 200) {
            log.success(`Delete ${bucket} ${items[index].key} success`);
          } else {
            log.fail(
              `Delete ${bucket} ${items[index].key} fail ${item.code} ${item.data.error}`
            );
          }
        });
      } else {
        log.fail(
          `Delete files fail. ${respInfo.deleteusCode} ${respBody.error}`
        );
      }
    }
  });
}

module.exports = init;
