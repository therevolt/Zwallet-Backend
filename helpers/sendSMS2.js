const client = require("twilio")(
  "AC68cd266fea676a7a838ad8de9042afdc",
  "282eea1963432ed084d4f60b017f0f7c"
);

client.messages
  .create({
    to: "+6289522407667",
    from: "+15412294909",
    body: "Testing OTP",
  })
  .then((message) => console.log(message.sid))
  .catch((err) => {
    console.log(err.message);
  });
