const auth = require("./auth");
const nodemailer = require("nodemailer");

module.exports.sendEmail = function sendEmail(
  trackingRow,
  trackingPrice,
  trackingUrl
) {
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
};
