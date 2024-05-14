import { BigNumber, utils, BigNumberish } from "ethers";

export const formatInNum = (balance: BigNumber, digits: number): number => {
  return (
    balance.mul(BigNumber.from(10).pow(digits)).toNumber() /
    Math.pow(10, digits)
  );
};

export const getFullDisplayBalance = (
  balance: BigNumberish,
  decimals = 18,
  decimalsToAppear?: number
): number => {
  return (
    Math.floor(
      +utils.formatUnits(balance, decimals) * 10 ** (decimalsToAppear || 8)
    ) /
    10 ** (decimalsToAppear || 8)
  );
};
