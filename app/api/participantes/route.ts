import { NextRequest, NextResponse } from "next/server";
import { generateUniqueCouponCode, verifySignedCouponCode } from "@/lib/coupon";
import { isDuplicateKeyError, pool } from "@/lib/db";
import { verifyInstagramVisitToken } from "@/lib/instagram";
import { validateParticipantePayload } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = validateParticipantePayload(payload);

    if (!validation.ok) {
      return NextResponse.json(
        { status: "error", message: validation.message },
        { status: 400 },
      );
    }

    if (!verifyInstagramVisitToken(payload.instagram_token)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Abra o Instagram da EQUUS antes de finalizar sua participacao.",
        },
        { status: 400 },
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const signedCoupon = verifySignedCouponCode(
      payload.codigo_cupom,
      payload.cupom_token,
    );

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const codigoCupom =
        attempt === 0 && signedCoupon ? signedCoupon : await generateUniqueCouponCode();

      try {
        await pool.execute(
          `INSERT INTO participantes_sorteio
            (
              nome_completo,
              cpf,
              celular,
              email,
              cep,
              unidade_compra,
              codigo_cupom,
              aceite_regulamento,
              aceite_marketing,
              ip,
              user_agent
            )
           VALUES
            (
              :nome_completo,
              :cpf,
              :celular,
              :email,
              :cep,
              :unidade_compra,
              :codigo_cupom,
              :aceite_regulamento,
              :aceite_marketing,
              :ip,
              :user_agent
            )`,
          {
            ...validation.data,
            codigo_cupom: codigoCupom,
            aceite_regulamento: validation.data.aceite_regulamento ? 1 : 0,
            aceite_marketing: validation.data.aceite_marketing ? 1 : 0,
            ip: ip ?? null,
            user_agent: userAgent ?? null,
          },
        );

        return NextResponse.json(
          {
            status: "success",
            message: "Inscricao realizada com sucesso!",
            codigo_cupom: codigoCupom,
          },
          { status: 201 },
        );
      } catch (error) {
        if (!isDuplicateKeyError(error)) {
          throw error;
        }

        const duplicateMessage =
          error instanceof Error && error.message.includes("codigo_cupom")
            ? null
            : "Este CPF ou email ja participou da promocao.";

        if (duplicateMessage) {
          return NextResponse.json(
            { status: "error", message: duplicateMessage },
            { status: 409 },
          );
        }
      }
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Nao foi possivel gerar um cupom unico. Tente novamente.",
      },
      { status: 500 },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Nao foi possivel concluir sua inscricao agora.",
      },
      { status: 500 },
    );
  }
}
