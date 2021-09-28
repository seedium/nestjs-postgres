import { Knex } from 'knex';
import {QueryBuilderMap} from "@interfaces/factory-query-builder.interface";

export interface IncludeInlineStrategy<TRecord, TResult> {
  inline(
    queryBuilderMap: QueryBuilderMap<TRecord, TResult>,
  ): Knex.QueryBuilder<TRecord, TResult> | Knex.Raw<TResult>;
}

export interface FilterInlineStrategy<TRecord, TResult> {
  inline(rawQueryBuilder: Knex.RawBuilder<TRecord, TResult>): Knex.Raw<TResult>;
}
