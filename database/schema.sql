CREATE TABLE IF NOT EXISTS participantes_sorteio (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cep VARCHAR(8) NOT NULL,
  unidade_compra VARCHAR(120) NOT NULL,
  codigo_cupom VARCHAR(20) NOT NULL,
  aceite_regulamento TINYINT(1) NOT NULL DEFAULT 0,
  aceite_marketing TINYINT(1) NOT NULL DEFAULT 1,
  ip VARCHAR(45) NULL,
  user_agent TEXT NULL,
  status ENUM('ativo', 'cancelado', 'sorteado') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_participantes_cpf (cpf),
  UNIQUE KEY uq_participantes_codigo_cupom (codigo_cupom),
  UNIQUE KEY uq_participantes_email (email),
  INDEX idx_participantes_status (status),
  INDEX idx_participantes_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sorteios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  data_sorteio DATETIME NULL,
  participante_ganhador_id BIGINT UNSIGNED NULL,
  codigo_cupom_ganhador VARCHAR(20) NULL,
  status ENUM('pendente', 'realizado', 'cancelado') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sorteios_status (status),
  CONSTRAINT fk_sorteios_participante
    FOREIGN KEY (participante_ganhador_id)
    REFERENCES participantes_sorteio(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
