import { Knex } from 'knex';
import { IList } from '@picflow/types';
import {IPaginationBuilder} from "@interfaces/pagination.interface";

export class PagePagination<TRecord, TResult>
{
  public buildQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    limit = 20,
    page = 0,
  ): void {
    const offset = page * limit;
    queryBuilder.offset(offset).limit(limit);
  }
  public prepareListResponse<TResult>(data: TResult[]): IList<TResult> {
    return {
      data,
    };
  }
}
