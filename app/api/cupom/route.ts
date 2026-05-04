import { NextResponse } from "next/server";
import { generateUniqueCouponCode, signCouponCode } from "@/lib/coupon";

export async function GET() {
  try {
    const codigo_cupom = await generateUniqueCouponCode();

    return NextResponse.json({
      status: "success",
      codigo_cupom,
      cupom_token: signCouponCode(codigo_cupom),
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Nao foi possivel gerar um cupom agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
