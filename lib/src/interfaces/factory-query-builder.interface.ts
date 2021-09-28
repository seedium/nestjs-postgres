import { Knex } from 'knex';

export type FactoryQueryBuilder<TRecord, TResult> = () => Knex.QueryBuilder<
  TRecord,
  TResult
>;

export type FactoryRawBuilder<TRecord, TResult> = () => Knex.RawBuilder<
  TRecord,
  TResult
>;

export interface FactoryQueryBuilderMap<TRecord, TResult> {
  factoryQueryBuilder: FactoryQueryBuilder<TRecord, TResult>;
  factoryRawBuilder: FactoryRawBuilder<TRecord, TResult>;
}

export interface QueryBuilderMap<TRecord, TResult> {
  queryBuilder: Knex.QueryBuilder<TRecord, TResult>;
  rawQueryBuilder: Knex.RawBuilder<TRecord, TResult>;
}
