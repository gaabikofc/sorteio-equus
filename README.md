# Sorteio EQUUS

Aplicacao Next.js para coletar participantes do Sorteio EQUUS, gerar cupom unico no servidor e salvar os dados em MySQL.

A unidade da inscricao e preenchida automaticamente pelo backend como `Unidade São Miguel Arcanjo`.

## Requisitos

- Node.js 18.18 ou superior
- MySQL ou MariaDB
- Banco criado com o nome desejado, por exemplo `sorteio-equus`

## Instalar dependencias

```bash
npm install
```

## Configurar ambiente

Crie um arquivo `.env.local` com base no `.env.example`:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=sorteio-equus
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha
COUPON_SIGNING_SECRET=uma_chave_secreta_forte
MYSQL_SSL=
MYSQL_SSL_CA=
```

Na Vercel, cadastre essas mesmas variaveis em Project Settings > Environment Variables. As credenciais nunca ficam expostas no frontend.

## Criar tabelas

Execute o arquivo SQL:

```bash
mysql -u root -p sorteio-equus < database/schema.sql
```

No PowerShell com XAMPP, uma alternativa e:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -uroot -p -P3306 'sorteio-equus' -e "source C:/xampp/htdocs/sorteio-equus/database/schema.sql"
```

## Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Testar envio

1. Abra a pagina.
2. Aguarde o campo "Codigo do Cupom" ser preenchido.
3. Preencha os dados obrigatorios.
4. Clique em "Abrir Instagram" para acessar `https://www.instagram.com/parqueturisticoequus/`.
5. Marque o aceite do regulamento.
6. Clique em "Participar Agora".

Em sucesso, a API retorna JSON com `status: "success"` e `codigo_cupom`. O cupom mostrado e gerado e assinado pelo backend. No POST, o servidor valida os dados novamente e impede duplicidade por CPF, email e codigo.

O envio tambem exige um token de abertura do Instagram, emitido por `/api/instagram-visit` quando o botao do Instagram e clicado. Assim, a experiencia normal da pagina so libera a candidatura depois que o link for aberto.

## Publicar na Vercel

1. Suba o projeto para um repositorio Git.
2. Importe o projeto na Vercel.
3. Configure as variaveis `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `COUPON_SIGNING_SECRET`, `MYSQL_SSL` e, se o provedor exigir certificado, `MYSQL_SSL_CA`.
4. Use um MySQL externo acessivel pela Vercel.
5. Rode o SQL de `database/schema.sql` no banco de producao.
6. Confirme que o provedor MySQL permite conexoes externas vindas da Vercel, ou use um banco gerenciado compativel.
7. Publique.

Para Aiven com `SSL mode = REQUIRED`, use `MYSQL_SSL=required`. Se quiser verificacao completa do certificado, copie o conteudo do CA certificate para `MYSQL_SSL_CA`.

## Sorteio futuro

A funcao `sortearParticipanteAtivo` em `lib/sorteio.ts` ja deixa preparada a logica administrativa para buscar participantes com `status = 'ativo'`, registrar o ganhador em `sorteios` e marcar o participante como `sorteado`. Ela nao esta exposta publicamente.

Para bases pequenas, a consulta usa `ORDER BY RAND()`. Para grandes volumes, substitua por uma estrategia mais performatica baseada em contagem, offset indexado ou amostragem por chave.
