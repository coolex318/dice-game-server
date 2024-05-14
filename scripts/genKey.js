const { generateKeySync } = require("crypto");
const key = generateKeySync("hmac", { length: 256 });
console.log(key.export().toString("hex"));
