export const unidadesCompra = [
  "EQUUS Indaiatuba",
  "EQUUS Campinas",
  "EQUUS Itu",
  "Outra unidade",
] as const;

export type UnidadeCompra = (typeof unidadesCompra)[number];

export function onlyDigits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateParticipantePayload(payload: Record<string, unknown>) {
  const nome_completo = normalizeText(payload.nome_completo);
  const cpf = onlyDigits(payload.cpf);
  const celular = onlyDigits(payload.celular);
  const email = normalizeEmail(payload.email);
  const cep = onlyDigits(payload.cep);
  const unidade_compra = normalizeText(payload.unidade_compra);
  const aceite_regulamento = payload.aceite_regulamento === true;
  const aceite_marketing = payload.aceite_marketing !== false;

  if (!nome_completo) {
    return { ok: false as const, message: "Informe seu nome completo." };
  }

  if (cpf.length !== 11) {
    return { ok: false as const, message: "Informe um CPF com 11 digitos." };
  }

  if (celular.length < 10 || celular.length > 11) {
    return { ok: false as const, message: "Informe um celular valido." };
  }

  if (!isValidEmail(email)) {
    return { ok: false as const, message: "Informe um email valido." };
  }

  if (cep.length !== 8) {
    return { ok: false as const, message: "Informe um CEP com 8 digitos." };
  }

  if (!unidadesCompra.includes(unidade_compra as UnidadeCompra)) {
    return { ok: false as const, message: "Selecione a unidade da compra." };
  }

  if (!aceite_regulamento) {
    return {
      ok: false as const,
      message: "Voce precisa aceitar o regulamento para participar.",
    };
  }

  return {
    ok: true as const,
    data: {
      nome_completo,
      cpf,
      celular,
      email,
      cep,
      unidade_compra,
      aceite_regulamento,
      aceite_marketing,
    },
  };
}
