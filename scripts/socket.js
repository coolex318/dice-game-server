const protobuf = require("protobufjs");
const { Wallet, utils } = require("ethers");
const WebSocket = require("ws");
const { getJWTToken } = require("./utils");
const { randomBytes } = require("crypto");

const createRegisterPacket = async (Payload) => {
  const testMnemonic =
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
  const signer = Wallet.fromMnemonic(testMnemonic);
  const WELCOME_MESSAGE = "I want to become a dice gamer";
  const signature = await signer.signMessage(WELCOME_MESSAGE);
  const address = signer.address;

  const code = 0x01;
  const data = JSON.stringify({
    address,
    signature,
  });
  const timestamp = Date.now();

  const buf = Payload.encode({ code, data, timestamp }).finish();
  return buf;
};

const createSessionPacket = (Payload) => {
  const code = 0x11;
  const data = JSON.stringify({
    currency: "USDC",
    clientSeed: randomBytes(32).toString("hex"),
  });
  const timestamp = Date.now();
  const buf = Payload.encode({ code, data, timestamp }).finish();
  return buf;
};

const createBetPacket = (Payload) => {
  const code = 0x12;
  const randomNum = Math.random() * 100;
  const border = Math.floor(
    randomNum === 0 ? 1 : randomNum === 100 ? 99 : randomNum
  );
  const diceType =
    Math.floor(Math.random() * 100) % 2 == 0 ? "rollOver" : "rollUnder";
  const data = JSON.stringify({
    amount: utils.parseEther("1").toString(),
    border,
    diceType,
  });
  const timestamp = Date.now();
  const buf = Payload.encode({ code, data, timestamp }).finish();
  return buf;
};

const createRandomPacket = async () => {
  return Payload.encode({
    code: randomCode,
    data: "register message",
    timestamp: Date.now(),
  }).finish();
};

const main = async () => {
  const jwtToken = await getJWTToken();
  const ws = new WebSocket("ws://localhost:5050", {
    headers: { token: jwtToken },
  });
  const root = await protobuf.load("message.proto");
  const Payload = root.lookupType("dicepackage.SocketPayload");
  const registerPacket = await createRegisterPacket(Payload);
  const sessionPacket = createSessionPacket(Payload);

  ws.on("open", function open() {
    console.log("socket opened!");
    setTimeout(() => {
      ws.send(sessionPacket);
    }, 1000);
    setInterval(() => {
      console.log("sending a newBet packet");
      ws.send(createBetPacket(Payload));
    }, 5000);
  });

  ws.on("message", function message(message) {
    console.log(`message arrived, raw: ${message}`);
    console.log(message);
    try {
      const decoded = Payload.decode(message);
      console.log(`> decoded:`);
      console.log(decoded);
    } catch (e) {
      console.log(e);
    }
  });

  ws.on("error", function error(data) {
    console.log("error received: %s", data);
  });

  ws.on("close", function close() {
    console.log("disconnected");
  });
};

main();
