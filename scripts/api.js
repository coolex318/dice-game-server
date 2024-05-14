const { getJWTToken } = require("./utils");

const main = async () => {
  const jwtToken = await getJWTToken();
  console.log({ jwtToken });
};

main();
