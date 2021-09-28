import { Knex } from 'knex';
import { OnModuleInit } from '@nestjs/common';
import { IList, IResourceObject } from '@picflow/types';

export interface IAbstractRepository<TRecord, TResult> {
  list(...args: unknown[]): Knex.QueryBuilder<TRecord>;
  create(...args: unknown[]): Knex.QueryBuilder<TRecord>;
  retrieve(...args: unknown[]): Knex.QueryBuilder<TRecord>;
  update(...args: unknown[]): Knex.QueryBuilder<TRecord>;
  delete(...args: unknown[]): Knex.QueryBuilder<TRecord>;
  queryBuilder<TOverrideRecord extends TRecord>(
    trx?: Knex.Transaction,
  ): Knex.QueryBuilder<TOverrideRecord, TResult>;
}

export interface IRepository<
  TRecord extends IResourceObject = IResourceObject,
  TResult extends IResourceObject = IResourceObject,
> extends OnModuleInit {
  list(...args: unknown[]): Promise<IList<TResult>>;
  create(...args: unknown[]): Promise<TRecord>;
  retrieve(...args: unknown[]): Promise<TResult | null>;
  update(...args: unknown[]): Promise<TRecord | null>;
  delete(...args: unknown[]): Promise<void>;
}

export type IRawRepository = OnModuleInit;
