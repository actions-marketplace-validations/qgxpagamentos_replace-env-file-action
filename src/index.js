const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const github = require("@actions/github");
const dotenv = require("dotenv");
const util = require("util");

const escapeNewlines = (str) => {
  return str.replace(/\n/g, "\\n");
};

const format = (key, value) => {
  return `${key}=${escapeNewlines(value)}`;
};

const isDirectory = (path) => {
  try {
    const stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (_e) {
    return false;
  }
};

const isFile = (path) => {
  try {
    const stat = fs.lstatSync(path);
    return stat.isFile()
  } catch (_e) {
    return false;
  }
};

/**
 * Main action function.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const filename = core.getInput("path");
    const map = core.getMultilineInput("map");
    const addIfNotExist = core.getBooleanInput("add_if_not_exist", {
      required: false,
    });
    const encoding = "utf8";

    let filteredArray = [];
    let newMap = {};

    core.info("Testing input path...");
    if (isDirectory(filename)) {
      throw new Error("Input path must be the path of a file and not a directory.");
    }
    if (!isFile(filename)) {
      throw new Error("File not found");
    }

    core.info("Testing input map...");
    for (const item of map) {
      const element = item.split("=");
      if (!element || element.length !== 2) {
        throw new Error(`Enviroment no key value ${element}`);
      }
      newMap[element[0].trim()] = element[1].trim();
    }

    const result = dotenv.config({ path: filename }).parsed;

    if (!addIfNotExist) {
      core.info("not adding key value");
      filteredArray = Object.keys(newMap).filter(
        (n) => Object.keys(result).indexOf(n) === -1
      );
    }

    const mergedMap = Object.assign(
      result,
      ...Object.entries(newMap).map(([k, v]) => ({ [k]: v }))
    );

    for (const key of filteredArray) {
      delete mergedMap[key];
    }

    core.info("convert to env file");
    const contents = Object.keys(mergedMap)
      .map((key) => format(key, mergedMap[key]))
      .join("\n");

    core.info("update file");
    await util.promisify(fs.writeFile)(filename, contents);

    core.info("successfully");
  } catch (error) {
    core.setFailed(`Unhandled error: ${error}`);
  }
}

main();
