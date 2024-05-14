import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  generateKeySync,
} from "crypto";

export const generateRandomBytes = (length: number): Buffer => {
  return randomBytes(length);
};

export const generatePrivKey = (
  type: "hmac" | "aes" = "hmac",
  length: number = 16
): string => {
  const key = generateKeySync(type, { length });
  const keyInHexString = key.export().toString("hex");
  return keyInHexString;
};

export const encrypt = (
  text: string,
  masterKey: string,
  algorithm = "aes-256-cbc"
): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(masterKey, "hex"), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([iv, encrypted, cipher.final()]);

  return encrypted.toString("hex");
};

export const decrypt = (
  encrypted: string,
  masterKey: string,
  algorithm = "aes-256-cbc"
): string => {
  const iv = Buffer.from(encrypted.substr(0, 32), "hex");
  const encryptedText = Buffer.from(encrypted.substr(32), "hex");

  const decipher = createDecipheriv(
    algorithm,
    Buffer.from(masterKey, "hex"),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
