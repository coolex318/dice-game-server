const { Wallet } = require("ethers");
const { default: axios } = require("axios");

const getJWTToken = async () => {
  const testMnemonic =
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
  const signer = Wallet.fromMnemonic(testMnemonic);
  const WELCOME_MESSAGE = "I want to become a dice gamer";
  const signature = await signer.signMessage(WELCOME_MESSAGE);
  const address = signer.address;
  try {
    const res = await axios.get("http://localhost:5050/register", {
      headers: {
        address: address,
        signature: signature,
      },
    });

    console.log({ data: res.data });
    return res.data.token;
  } catch (e) {
    console.error(e);
    return "";
  }
};

module.exports = { getJWTToken };
