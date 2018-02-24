const TrackingRow = require("./tracking_row");
const email = require("./email");
const util = require("./util");
const axios = require("axios");
const cheerio = require("cheerio");

function displayCorrectUsage() {
  console.log(
    "Incorrect program usage.\n" +
      "Correct Usage:\n" +
      "\tnode index.js <price> <url> <flags>\n" +
      "Correct Usage Example:\n" +
      '\tnode index.js 750 "https://www.nowinstock.net/computers/videocards/nvidia/gtx1080ti/" -R -I 500'
  );
  process.exit(1);
}

// Verify correct argument length
if (process.argv.length < 4) {
  displayCorrectUsage();
}

const trackingPrice = process.argv[2];
const trackingUrl = process.argv[3];
const loop = process.argv.includes("--repeat") || process.argv.includes("-R");
let trackingRows = [];
let interval = 300000; // 5 Minutes

// TODO: if specifying interval, make sure that repeat is given.
if (process.argv.includes("--interval")) {
  interval = process.argv[process.indexOf("--interval") + 1];
} else if (process.argv.includes("-I")) {
  interval = process.argv[process.argv.indexOf("-I") + 1];
}

// Verify values for trackingPrice & trackingUrl
if (!trackingPrice || Number.isNaN(Number(trackingPrice)) || !trackingUrl) {
  displayCorrectUsage();
}

function handleResponse(response) {
  trackingRows = [];
  const $ = cheerio.load(response.data);

  const table = $("#trackerContent > #data > table > tbody");
  const rows = table.find("tr");

  rows.each((index, element) => {
    if (element.childNodes.length < 5) {
      return;
    }

    let name = "";
    let url = "";
    let store = "";
    let status = "";
    let lastPrice = null;
    let lastStock = "";

    const urlElement = element.childNodes[1].childNodes[0];
    if (urlElement.attribs != null) {
      url = urlElement.attribs.href;
    }

    const nameElement = element.childNodes[1].childNodes[0].firstChild;
    if (nameElement != null) {
      name = util.parseName(nameElement.data);
      store = util.parseStore(nameElement.data);
    }

    const statusElement = element.childNodes[2].firstChild;
    if (statusElement != null) {
      status = statusElement.data;
    }

    const lastPriceElement = element.childNodes[3].firstChild;
    if (lastPriceElement != null) {
      lastPrice = util.moneyStringToNumber(lastPriceElement.data);
    }

    const lastStockElement = element.childNodes[5].firstChild;
    if (lastStockElement != null) {
      lastStock = lastStockElement.data;
    }

    if (name && store && status && url && lastPrice && lastStock) {
      trackingRows.push(
        new TrackingRow(index, name, store, url, status, lastPrice, lastStock)
      );
    }
  });

  trackingRows.forEach(trackingRow => {
    if (
      trackingRow.price < trackingPrice &&
      trackingRow.status === "In Stock"
    ) {
      email.sendEmail(trackingRow, trackingPrice, trackingUrl);
    }
  });
}

function handleError(error) {
  console.log(`Request errored: ${error}`);
}

function main() {
  console.log(`Requesting ${trackingUrl} for prices below ${trackingPrice}`);
  axios.default
    .get(trackingUrl)
    .then(handleResponse)
    .catch(handleError);
}

if (loop === true) {
  main();
  setInterval(main, interval);
} else {
  main();
}
