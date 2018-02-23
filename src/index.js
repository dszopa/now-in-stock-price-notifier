const TrackingRow = require("./tracking_row");
const email = require("./email");
const util = require("./util");
const axios = require("axios");
const cheerio = require("cheerio");

if (process.argv.length !== 4) {
  console.log(
    "Incorrect program usage.\n" +
      "Correct Usage:\n" +
      "\tnode index.js <price> <url>\n" +
      "Correct Usage Example:\n" +
      '\tnode index.js 750 "https://www.nowinstock.net/computers/videocards/nvidia/gtx1080ti/"'
  );
  process.exit(1);
}

const trackingPrice = process.argv[2];
const trackingUrl = process.argv[3];
let trackingRows = [];

// "Main"
axios.default
  .get(trackingUrl)
  .then(response => {
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

      if (
        name !== "" &&
        store !== "" &&
        status !== "" &&
        url !== "" &&
        lastPrice != null &&
        !lastPrice.isNan &&
        lastStock !== ""
      ) {
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
  })
  .catch(error => {
    console.log(error);
  });
