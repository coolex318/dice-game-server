import JWT from "jsonwebtoken";

export const generateToken = (userId: number, secretKey: string): string => {
  const token = JWT.sign({ userId }, secretKey, {
    algorithm: "HS256",
    expiresIn: "30 days",
  }) as string;

  return token;
};

export const verifyToken = (token: string, secretKey: string): number => {
  const decoded = JWT.verify(token, secretKey);
  const res = decoded ? decoded.userId : -1;
  return res;
};
