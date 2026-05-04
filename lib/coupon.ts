import crypto from "crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "./db";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const couponPattern = /^EQUS-[A-Z0-9]{6}$/;

function getSigningSecret() {
  return process.env.COUPON_SIGNING_SECRET || process.env.MYSQL_PASSWORD || "sorteio-equus";
}

export function generateCouponCode() {
  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += alphabet[crypto.randomInt(0, alphabet.length)];
  }

  return `EQUS-${code}`;
}

export async function generateUniqueCouponCode(maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generateCouponCode();
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM participantes_sorteio WHERE codigo_cupom = :code LIMIT 1",
      { code },
    );

    if (rows.length === 0) {
      return code;
    }
  }

  throw new Error("Nao foi possivel gerar um cupom unico.");
}

export function signCouponCode(code: string) {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(code)
    .digest("hex");
}

export function verifySignedCouponCode(code: unknown, token: unknown) {
  if (typeof code !== "string" || typeof token !== "string") {
    return null;
  }

  if (!couponPattern.test(code)) {
    return null;
  }

  const expected = signCouponCode(code);
  const expectedBuffer = Buffer.from(expected, "hex");
  const tokenBuffer = Buffer.from(token, "hex");

  if (expectedBuffer.length !== tokenBuffer.length) {
    return null;
  }

  return crypto.timingSafeEqual(expectedBuffer, tokenBuffer) ? code : null;
}
