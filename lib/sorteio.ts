import type { RowDataPacket } from "mysql2";
import { pool } from "./db";

type ParticipanteAtivo = RowDataPacket & {
  id: number;
  nome_completo: string;
  codigo_cupom: string;
};

export async function sortearParticipanteAtivo(nomeSorteio: string, descricao?: string) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
      Preparado para uso administrativo futuro.
      ORDER BY RAND() e simples e funciona bem em bases pequenas.
      Para grandes volumes, substitua por uma estrategia baseada em contagem,
      offset aleatorio indexado ou amostragem por chave.
    */
    const [participantes] = await connection.execute<ParticipanteAtivo[]>(
      `SELECT id, nome_completo, codigo_cupom
       FROM participantes_sorteio
       WHERE status = 'ativo'
       ORDER BY RAND()
       LIMIT 1`,
    );

    const ganhador = participantes[0];

    if (!ganhador) {
      await connection.rollback();
      return null;
    }

    await connection.execute(
      `INSERT INTO sorteios
        (nome, descricao, data_sorteio, participante_ganhador_id, codigo_cupom_ganhador, status)
       VALUES
        (:nome, :descricao, NOW(), :participanteId, :codigoCupom, 'realizado')`,
      {
        nome: nomeSorteio,
        descricao: descricao ?? null,
        participanteId: ganhador.id,
        codigoCupom: ganhador.codigo_cupom,
      },
    );

    await connection.execute(
      "UPDATE participantes_sorteio SET status = 'sorteado' WHERE id = :id",
      { id: ganhador.id },
    );

    await connection.commit();
    return ganhador;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
