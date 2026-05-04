import crypto from "crypto";

const instagramVisitPrefix = "instagram-visit";
const maxTokenAgeMs = 30 * 60 * 1000;

function getSigningSecret() {
  return process.env.COUPON_SIGNING_SECRET || process.env.MYSQL_PASSWORD || "sorteio-equus";
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
}

export function createInstagramVisitToken() {
  const timestamp = Date.now();
  const payload = `${instagramVisitPrefix}:${timestamp}`;

  return `${timestamp}.${signPayload(payload)}`;
}

export function verifyInstagramVisitToken(token: unknown) {
  if (typeof token !== "string") {
    return false;
  }

  const [timestampValue, signature] = token.split(".");
  const timestamp = Number(timestampValue);

  if (!timestamp || !signature || Date.now() - timestamp > maxTokenAgeMs) {
    return false;
  }

  const payload = `${instagramVisitPrefix}:${timestamp}`;
  const expected = signPayload(payload);
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}
