const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
});

const sendMail = (mailTo, body) => {
  return new Promise((resolve, reject) => {
    // send mail with defined transport object
    try {
      transporter
        .sendMail({
          from: process.env.EMAIL, // sender address
          to: mailTo, // list of receivers
          subject: "ZWallet Mail Notifications", // Subject line
          text: "ZWallet Website", // plain text body
          html: `<body style="margin: 0; padding: 0;">
        <table cellpadding="0" cellspacing="0" width="100%">
         <tr>
          <td>
           <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
        <tr>
         <td>
          <table align="center" cellpadding="0" cellspacing="0" width="600">
        <tr>
         <td bgcolor="#FFBA33" style="padding: 20px 0 30px 0;" align="center">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 33" width="30" height="33">
         <rect fill="url(#pattern0)" width="30" height="33" />
         <defs>
         <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
         <use transform="translate(-0.05) scale(0.00859375 0.0078125)" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#image0" />
         </pattern>
         <image id="image0" width="128" height="128" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABdFBMVEUAAABtSSRrPypgQCBVVStqQClrPyhqQCmAQEBrQClqQCpqPylpQClqQClqQClqQClpQClqQCprQShqPylpQShqQSlrPylpPypqQCtqPixtQCSAAABqQClrPylqQClqQClqQClqQSlrQSppPyhpQShqPyhrPyhpQClmPSlqQCsAAABqPylqQClqQCpqQClqQChqQClpQSlqPylqQSlrPyloQChpPypiOydpRCZqQShrPylrQiloPippPC1wQDBqQClpQChqQClqQClqQClpQClqQSlrQSppPyppQStqPyhsPihoQClqQClqQClqQClqQChqQChrQSlpQSlqPylqQSlrPylrQSlpPypqPixsQCZxORxqQClmTTNqQClqQClqQClqQClqQSlrPypmQCZqQSlrPyprQSppPypqPydsQChsPidrQSpqPytsQCdtPSRqQClqQClqQClpQClqQCprQShqPyhpQShqPylqQCtqQClqQCkAAAD9aLYqAAAAenRSTlMAB5kIBru95ASIk313+9/ev76enX5eXT08HRwC+Pnb2rqaenlaWTk4GRgB9fbX1re2lpV2dSBVDSJSUTIxERDw0M+vro+Obm1OTS0s7OvLyquqiolqaUpJKSgJ/gro58fGpqUUgoFiYUFAIVY1NBXz09KzspKRcnEw73lu0eUAAAABYktHRACIBR1IAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AoTBg0nXTSkcAAAAolJREFUeNrt2+kz1XEUx/Fv1hspS6EsyRJRQnFxLVGWQhSV0m6Lsofy1zPTgziTued8z+fM9OB8Hhvn9eDOb+783nNDwO3CUbplAK/9Y5kOcIADHKAAZGUDlpMWkHvqr7OEePgyHeAABzjAAQ5wgAMc8H8BEhf/Ls/uaN7Jv8+/9GeJc78hJwqs7hecf/TMLlsBrvDuh0IrQBETUGwFKGECrloB8pmAa1aAUiagzApQzgRctwLcYAIqKm3uV1UwAaHaBnCTez9k2wBq2IBbNgD+C5paG0AdG1BvA2hgA27bABrZgCYbwB02oLnF4v7dZjYg3LMAtPLvh/sWgDYBoN0C0CEAPLAAPBQAOrsM1ikA+Hy+kOyGLykC9OCfQ70iQAoP6BMB+vGAAdmHYBB9f1D4KXyEBgwJAcNowGMh4AkaMCIEjKIBY0LAOBrwVAh4hgZMCAFJNED2JD7ZJPb+lPR+eI4FTIsBM1jACzHgJRYwKwbMYQGvxIDXWMAbMWAeC3grBrxbQN5feC8GhA9IwEf5/fAJCfgcAfiCBHyNACwiv5MvRgB8Pl9I4d5PpaIAS7jn0HIUYAUHWI0CfMMB1qIA6zhA3DtKXMbnZns6WMbnZns6WMbnZns6WMbnZns6WMbnZns6WMbnZns6WMbnZns6WMbnZns6VMbnZ3s6UMbnZ3s6UMaviQaAMn787ypAGZ+f7elAGZ+f7elAGZ+f7elAGZ+f7ekwGV+S7ekgGV+S7ekgGb9NAYBkfEm2p4NkfEm2p/uOAHQpAD8QgA0FYBMBUL2e2dLf39LcD9t6wI4KsKsH7KkAP/WAfRXgQA84VAEAGV+W7en69IBfKgAg4wuzPd1v7f102f4YHafoQNyAPE4AAAAldEVYdGRhdGU6Y3JlYXRlADIwMjAtMTAtMTlUMDY6MTM6MzkrMDA6MDCibWEHAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTEwLTE5VDA2OjEzOjM5KzAwOjAw0zDZuwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=" />
         </defs>
         </svg>
         </td>
        </tr>
        <tr>
         <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
        <table cellpadding="0" cellspacing="0" width="100%">
         <tr>
          <td>
           Hello ${body.name}!
          </td>
         </tr>
         <tr>
          <td style="padding: 20px 0 30px 0;">
           ${body.text}
          </td>
         </tr>
         <tr>
          <td>
           <a href="${body.url}">${body.textBtn}</a>
          </td>
         </tr>
        </table>
       </td>
        </tr>
        <tr>
         <td bgcolor="#ee4c50" align="center">
          URL Verify Will Expired 1 Hours After Recived!
         </td>
        </tr>
       </table>
         </td>
        </tr>
       </table>
          </td>
         </tr>
        </table>
       </body>`, // html body
        })
        .then(() => {
          resolve("Success! Please Check Your Email!");
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject("Failed!");
    }
  });
};

module.exports = sendMail;
