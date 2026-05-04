"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FormState = {
  nome_completo: string;
  cpf: string;
  celular: string;
  email: string;
  cep: string;
  aceite_regulamento: boolean;
  aceite_marketing: boolean;
};

const initialFormState: FormState = {
  nome_completo: "",
  cpf: "",
  celular: "",
  email: "",
  cep: "",
  aceite_regulamento: false,
  aceite_marketing: true,
};

const instagramUrl = "https://www.instagram.com/centrohipicoequus/";
const unidadeCompraPadrao = "Unidade São Miguel Arcanjo";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function maskCep(value: string) {
  return onlyDigits(value).slice(0, 8);
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupomToken, setCupomToken] = useState("");
  const [instagramOpened, setInstagramOpened] = useState(false);
  const [instagramToken, setInstagramToken] = useState("");
  const [loadingCupom, setLoadingCupom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const isSubmitDisabled = useMemo(
    () => submitting || loadingCupom || !codigoCupom || !instagramOpened,
    [codigoCupom, instagramOpened, loadingCupom, submitting],
  );

  useEffect(() => {
    async function loadCoupon() {
      try {
        const response = await fetch("/api/cupom", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setCodigoCupom(data.codigo_cupom);
        setCupomToken(data.cupom_token);
      } catch {
        setMessageTone("error");
        setMessage("Não foi possível gerar seu cupom agora. Atualize a página.");
      } finally {
        setLoadingCupom(false);
      }
    }

    loadCoupon();
  }, []);

  function updateField(name: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (!form.nome_completo.trim()) return "Informe seu nome completo.";
    if (onlyDigits(form.cpf).length !== 11) return "Informe um CPF com 11 dígitos.";
    if (![10, 11].includes(onlyDigits(form.celular).length)) {
      return "Informe um celular válido.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Informe um email válido.";
    }
    if (onlyDigits(form.cep).length !== 8) return "Informe um CEP com 8 dígitos.";
    if (!form.aceite_regulamento) {
      return "Você precisa aceitar os regulamentos da promoção.";
    }
    if (!instagramOpened || !instagramToken) {
      return "Abra o Instagram da EQUUS antes de finalizar sua participação.";
    }
    return "";
  }

  async function handleInstagramOpen() {
    try {
      const response = await fetch("/api/instagram-visit", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setInstagramOpened(true);
      setInstagramToken(data.instagram_token);
      setMessage("");
    } catch {
      setMessageTone("error");
      setMessage("Não foi possível confirmar a abertura do Instagram. Tente novamente.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setMessageTone("error");
      setMessage(validationMessage);
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/participantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cpf: onlyDigits(form.cpf),
          celular: onlyDigits(form.celular),
          cep: onlyDigits(form.cep),
          unidade_compra: unidadeCompraPadrao,
          codigo_cupom: codigoCupom,
          cupom_token: cupomToken,
          instagram_token: instagramToken,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível concluir sua inscrição.");
      }

      setCodigoCupom(data.codigo_cupom);
      setMessageTone("success");
      setMessage(`Inscrição realizada com sucesso! Guarde seu código: ${data.codigo_cupom}`);
      setForm(initialFormState);
      setInstagramOpened(false);
      setInstagramToken("");
    } catch (error) {
      setMessageTone("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir sua inscrição agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="raffle-card" aria-labelledby="raffle-title">
        <header className="card-header">
          <p className="brand-mark">Sorteio EQUUS</p>
          <h1 id="raffle-title">PARTICIPE E CONCORRA!</h1>
          <p>Preencha seus dados e garanta seu número da sorte.</p>
        </header>

        <form className="raffle-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Nome Completo</span>
            <input
              name="nome_completo"
              type="text"
              required
              placeholder="Seu nome"
              value={form.nome_completo}
              onChange={(event) => updateField("nome_completo", event.target.value)}
            />
          </label>

          <label className="field">
            <span>CPF</span>
            <input
              name="cpf"
              type="text"
              inputMode="numeric"
              required
              placeholder="Apenas números"
              value={form.cpf}
              onChange={(event) => updateField("cpf", maskCpf(event.target.value))}
            />
          </label>

          <label className="field">
            <span>Celular</span>
            <input
              name="celular"
              type="text"
              inputMode="numeric"
              required
              placeholder="(00) 00000-0000"
              value={form.celular}
              onChange={(event) => updateField("celular", maskPhone(event.target.value))}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label className="field">
            <span>CEP</span>
            <input
              name="cep"
              type="text"
              inputMode="numeric"
              required
              placeholder="00000000"
              value={form.cep}
              onChange={(event) => updateField("cep", maskCep(event.target.value))}
            />
          </label>

          <label className="field">
            <span>Código do Cupom</span>
            <input
              name="codigo_cupom"
              type="text"
              readOnly
              value={loadingCupom ? "Gerando cupom..." : codigoCupom}
              className="coupon-input"
              aria-live="polite"
            />
          </label>

          <section className="instagram-block" aria-labelledby="instagram-title">
            <div className="instagram-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <rect x="4" y="4" width="16" height="16" rx="5" />
                <circle cx="12" cy="12" r="3.2" />
                <circle cx="16.7" cy="7.3" r="0.8" />
              </svg>
            </div>
            <h2 id="instagram-title">Siga nosso Instagram</h2>
            <p>Acompanhe nossas novidades, eventos e promoções exclusivas!</p>

            <div className="instagram-profile">
              <strong>EQUUS</strong>
              <span>@centrohipicoequus</span>
            </div>

            <a
              className={`instagram-action ${instagramOpened ? "opened" : ""}`}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInstagramOpen}
            >
              {instagramOpened ? "Instagram aberto" : "Abrir Instagram"}
            </a>
          </section>

          <div className="checkbox-group">
            <label className="checkbox-row">
              <input
                name="aceite_regulamento"
                type="checkbox"
                required
                checked={form.aceite_regulamento}
                onChange={(event) =>
                  updateField("aceite_regulamento", event.target.checked)
                }
              />
              <span>
                Eu li e concordo com os{" "}
                <a href="#regulamento">regulamentos da promoção</a>.
              </span>
            </label>

            <label className="checkbox-row">
              <input
                name="aceite_marketing"
                type="checkbox"
                checked={form.aceite_marketing}
                onChange={(event) => updateField("aceite_marketing", event.target.checked)}
              />
              <span>Aceito receber ofertas exclusivas.</span>
            </label>
          </div>

          {message ? (
            <p className={`form-message ${messageTone}`} role="status">
              {message}
            </p>
          ) : null}

          <button className="submit-button" type="submit" disabled={isSubmitDisabled}>
            {submitting ? "Enviando..." : "Participar Agora"}
          </button>
        </form>
      </section>
    </main>
  );
}
