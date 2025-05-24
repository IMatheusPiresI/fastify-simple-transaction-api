import { Knex, knex as setupKnex } from 'knex';
import { env } from './env';
import 'dotenv/config';

const connectionSqlite = {
  filename: env.DATABASE_URL,
};
const connectionPostgress = env.DATABASE_URL;

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite' ? connectionSqlite : connectionPostgress,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
};

export const knex = setupKnex(config);

// RF

// [ ] Usuário deve poder criar uma nova transação.
// [ ] Usuário deve poder obter um resumo da sua conta.
// [ ] Usuário deve poder listar todas as transações que já ocorreram.
// [ ] Usuário deve poder visualizar uma transação única.

// RN

// [ ] A transação pode ser do tipo crédito que somará ao valor total, ou débito que subtrairá.
// [ ] Deve ser possível identificarmos o usuário entre as requisições.
// [ ] O usuário só pode visualizar transações o qual ele criou.

// RNF

// -
