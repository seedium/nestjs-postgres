import { Knex } from 'knex';
import { IList, IResourceObject } from '@picflow/types';
import {IPaginationBuilder} from "@interfaces/pagination.interface";

export class UnlimitedPagination<
  TRecord extends IResourceObject,
  TResult extends IResourceObject,
> implements IPaginationBuilder<TRecord, TResult>
{
  public buildQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    limit: number,
    page: number,
  ): void {
    if (limit || page) {
      limit = limit ?? 20;
      page = page ?? 0;
      const offset = page * limit;
      queryBuilder.offset(offset).limit(limit);
    }
  }
  public prepareListResponse<TResult>(data: TResult[]): IList<TResult> {
    return {
      data,
    };
  }
}
