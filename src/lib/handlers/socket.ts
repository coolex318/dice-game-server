import { ajv, EXPIRY_TIME } from "../../utils";
import { ClientInfo, SocketMessage } from "../entities";
import { REQUEST_SCHEMAS } from "../schemas";

export const handleSockMessage = async (
  message: SocketMessage,
  clientInfo: ClientInfo
): Promise<string> => {
  const { code, data, timestamp } = message;

  // Validate message code
  if (!REQUEST_SCHEMAS[code]) {
    throw new Error(`Unsupported message code: ${code}`);
  }

  // Validate message schema
  const { name, schema, handler } = REQUEST_SCHEMAS[code];
  const validate = ajv.compile(schema);
  const parsed_data = JSON.parse(data) as Object;

  const valid = validate(parsed_data);
  if (!valid) {
    throw new Error(
      validate.errors
        ?.map((err: unknown) => JSON.stringify(err, null, 2))
        .join(",")
    );
  }

  // validate expiry time
  const curTimestamp = Date.now();
  if (curTimestamp - timestamp > EXPIRY_TIME) {
    throw new Error(
      `Request expired, timestamp: ${timestamp}, expiry: ${EXPIRY_TIME}, now: ${curTimestamp}`
    );
  }

  const response = await handler(parsed_data, clientInfo);
  return response;
};
