import { Type, Static } from "@sinclair/typebox";

export const RegisterRequestSchema = Type.Object({
  address: Type.String(),
  signature: Type.String(),
});
export type RegisterRequest = Static<typeof RegisterRequestSchema>;
