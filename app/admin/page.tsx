"use client";

import { FormEvent, useState } from "react";

type Participante = {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [participantes, setParticipantes] = useState<Participante[]>([]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("q", search.trim());
      }

      const response = await fetch(`/api/admin/participantes?${params.toString()}`, {
        headers: {
          "x-admin-token": token,
        },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel consultar os participantes.");
      }

      setParticipantes(data.participantes);
      setMessage(
        data.participantes.length
          ? `${data.participantes.length} participante(s) encontrado(s).`
          : "Nenhum participante encontrado.",
      );
    } catch (error) {
      setParticipantes([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel consultar os participantes.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <header className="admin-header">
          <p>Sorteio EQUUS</p>
          <h1>Participantes</h1>
        </header>

        <form className="admin-controls" onSubmit={handleSearch}>
          <label>
            Token administrativo
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Digite o ADMIN_TOKEN"
              required
            />
          </label>

          <label>
            Busca
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, email, CPF, celular ou cupom"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </form>

        {message ? <p className="admin-message">{message}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cupom</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Celular</th>
                <th>Unidade</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((participante) => (
                <tr key={participante.id}>
                  <td>{participante.nome_completo}</td>
                  <td>
                    <strong>{participante.codigo_cupom}</strong>
                  </td>
                  <td>{participante.email}</td>
                  <td>{participante.cpf}</td>
                  <td>{participante.celular}</td>
                  <td>{participante.unidade_compra}</td>
                  <td>{participante.status}</td>
                  <td>{formatDate(participante.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
