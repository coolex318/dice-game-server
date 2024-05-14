import { Wallet } from "ethers";
import { recoverHelloMsgPayload, sign } from "../src/utils";
import { expect } from "chai";

describe("Utils", () => {
  describe("Utils:signature", () => {
    const testMnemonic =
      "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
    const helloMsg = "Hello!";
    describe("#recover", () => {
      it("happy: return the correct address", async () => {
        const signer = Wallet.fromMnemonic(testMnemonic);
        const signature = await sign(helloMsg, signer);
        const recovered = recoverHelloMsgPayload(helloMsg, signature);
        expect(signer.address).to.be.eq(recovered);
      });
    });
  });
});
