const client = require("twilio")(
  "AC68cd266fea676a7a838ad8de9042afdc",
  "1c5715c107daef39c444200622d56c2b"
);

client.messages
  .create({
    to: "+6289522407667",
    from: "+154122949091",
    body: "Testing OTP",
  })
  .then((message) => console.log(message.sid))
  .catch((err) => {
    console.log(err.message);
  });
