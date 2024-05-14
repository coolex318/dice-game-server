export const RequestCode = {
  REGISTER: 0x01,
  UPDATE_PROFILE: 0x02,

  START_SESSION: 0x11,
  NEW_BET: 0x12,
};

export const ResponseCode = {
  SUCCESS: 0x01,
  INFO: 0x02,
  WARN: 0x03,
  ERROR: 0xff,
};

export const EXPIRY_TIME = 300_000;
