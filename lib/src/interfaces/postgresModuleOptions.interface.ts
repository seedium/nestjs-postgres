import { Knex } from 'knex';

export interface PostgresModuleOptions{
  connection: Knex.PgConnectionConfig,
  pool: Knex.PoolConfig,
}
