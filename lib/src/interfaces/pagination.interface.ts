import { Knex } from 'knex';
import { IList } from '@picflow/types';

export interface IPaginationBuilder<TRecord, TResult> {
  buildQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    limit?: number,
    ...args: unknown[]
  ): void;
  prepareListResponse<TResult>(
    data: TResult[],
    ...args: unknown[]
  ): IList<TResult>;
}
