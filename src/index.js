const auth = require("./auth.js");
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

const trackingPrice = 750;
const trackingUrl =
  "https://www.nowinstock.net/computers/videocards/nvidia/gtx1080ti/";
let trackingRows = [];

class TrackingRow {
  constructor(id, name, store, url, status, price, lastStock) {
    this.id = id;
    this.name = name;
    this.store = store;
    this.url = url;
    this.status = status;
    this.price = price;
    this.lastStock = lastStock;
  }
}

function moneyStringToNumber(moneyString) {
  const trimmedString = moneyString.substring(1, moneyString.length);

  let returnValue = parseFloat(trimmedString.replace(",", ""), 10);

  if (returnValue.isNan) {
    returnValue = null;
  }

  return returnValue;
}

function parseName(string) {
  return string.substring(0, string.indexOf(":") - 1);
}

function parseStore(string) {
  return string.substring(string.indexOf(":") + 2, string.indexOf("(") - 1);
}

function sendEmail(trackingRow) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: auth.auth
  });

  const mailOptions = {
    from: "### AUTO FILLED ###", // sender address
    to: "szopanator@gmail.com", // list of receivers
    subject: `Price Drop! - ${trackingRow.name} is below ${trackingPrice}!`, // Subject line
    html: `<p>Get it at: <a href="${trackingRow.url}">${
      trackingRow.store
    }</a> for ${
      trackingRow.price
    }</p><p>I am a bot. <a href="${trackingUrl}">This</a> is the URL I scraped to find this deal. Enjoy!</p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
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
      name = parseName(nameElement.data);
      store = parseStore(nameElement.data);
    }

    const statusElement = element.childNodes[2].firstChild;
    if (statusElement != null) {
      status = statusElement.data;
    }

    const lastPriceElement = element.childNodes[3].firstChild;
    if (lastPriceElement != null) {
      lastPrice = moneyStringToNumber(lastPriceElement.data);
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
      sendEmail(trackingRow);
    }
  });
}

// The actual script
axios.default
  .get(trackingUrl)
  .then(handleResponse)
  .catch(error => {
    console.log(error);
  });
