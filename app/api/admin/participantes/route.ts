import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { onlyDigits } from "@/lib/validation";

type ParticipanteRow = RowDataPacket & {
  id: number;
  nome_completo: string;
  cpf: string;
  celular: string;
  email: string;
  cep: string;
  unidade_compra: string;
  codigo_cupom: string;
  aceite_regulamento: 0 | 1;
  aceite_marketing: 0 | 1;
  status: string;
  created_at: string;
};

function isAuthorized(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  const requestToken = request.headers.get("x-admin-token");

  return Boolean(adminToken && requestToken && requestToken === adminToken);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { status: "error", message: "Acesso administrativo nao autorizado." },
      { status: 401 },
    );
  }

  const search = request.nextUrl.searchParams.get("q")?.trim() || "";
  const numericSearch = onlyDigits(search);

  try {
    const params: Record<string, string> = {};
    let where = "";

    if (search) {
      params.search = `%${search}%`;
      params.numericSearch = `%${numericSearch || search}%`;
      where = `
        WHERE nome_completo LIKE :search
          OR email LIKE :search
          OR codigo_cupom LIKE :search
          OR cpf LIKE :numericSearch
          OR celular LIKE :numericSearch
      `;
    }

    const [participantes] = await pool.execute<ParticipanteRow[]>(
      `SELECT
          id,
          nome_completo,
          cpf,
          celular,
          email,
          cep,
          unidade_compra,
          codigo_cupom,
          aceite_regulamento,
          aceite_marketing,
          status,
          created_at
       FROM participantes_sorteio
       ${where}
       ORDER BY created_at DESC
       LIMIT 100`,
      params,
    );

    return NextResponse.json({
      status: "success",
      participantes,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Nao foi possivel consultar os participantes agora.",
      },
      { status: 500 },
    );
  }
}
