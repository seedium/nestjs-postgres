import { Knex } from 'knex';
import { IComplexDateFilter, IDateFilter } from '@picflow/types';
import {IPaginationBuilder} from "@interfaces/pagination.interface";
import {FactoryRawBuilder} from "@interfaces/factory-query-builder.interface";
import {FilterStrategies} from "@interfaces/database-options.interface";
import {sanitizeFilterOptions} from "@utils/sanitaze-filter-options";

export class RepositoryBuilder<TRecord, TResult> {
  constructor(
    private readonly _pagination: IPaginationBuilder<TRecord, TResult>,
  ) {}
  public buildFilterQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    factoryRawBuilder: FactoryRawBuilder<TRecord, TResult>,
    filterObject: Record<string, unknown>,
    filterStrategies: FilterStrategies<TRecord, TResult> = [],
  ): void {
    /*
     * TODO We can optimize this part by trusting validation layer.
     *  So, by building the right schema where we can filter number and string values we can expect do not fall.
     * */
    const sanitizedFilter = sanitizeFilterOptions(filterObject);
    queryBuilder.where(sanitizedFilter);
    if (filterStrategies.length > 0) {
      filterStrategies.forEach((filterStrategy) =>
        queryBuilder.andWhereRaw(
          filterStrategy.inline(factoryRawBuilder()) as Knex.Raw<TResult>,
        ),
      );
    }
  }
  public buildPaginationQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    limit?: number,
    ...args: unknown[]
  ): void {
    return this._pagination.buildQuery(queryBuilder, limit, ...args);
  }
  public buildSortQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    sort: string[],
  ): void {
    sort.forEach((property) => {
      const [direction, column] = this.getSortDirection(property);
      queryBuilder.orderBy(column, direction);
    });
  }
  public buildDateFilterQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    dateFilter?: IDateFilter,
  ): void {
    if (!dateFilter) {
      return;
    }
    if (this.isDateFilterTimestamp(dateFilter)) {
      queryBuilder.where('created_at', dateFilter);
    } else {
      this.buildComplexDateFilterQuery(queryBuilder, dateFilter);
    }
  }
  protected getSortDirection(property: string): ['asc' | 'desc', string] {
    const sortSymbol = property[0];
    if (sortSymbol === '+') {
      return ['asc', property.slice(1, property.length)];
    } else if (sortSymbol === '-') {
      return ['desc', property.slice(1, property.length)];
    } else {
      return ['asc', property];
    }
  }
  protected buildComplexDateFilterQuery(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    dateFilter: IComplexDateFilter,
  ): void {
    Object.entries(dateFilter).forEach(([operator, value]) =>
      this.getQueryForDateOperator(
        queryBuilder,
        operator as 'gt' | 'gte' | 'lt' | 'lte',
        value,
      ),
    );
  }
  private isDateFilterTimestamp(dateFilter: IDateFilter): dateFilter is number {
    return typeof dateFilter === 'number';
  }
  private getQueryForDateOperator(
    queryBuilder: Knex.QueryBuilder<TRecord, TResult>,
    operator: 'gt' | 'gte' | 'lt' | 'lte',
    value: number,
  ): void {
    if (operator === 'gt') {
      queryBuilder.where('created_at', '>', value);
    } else if (operator === 'gte') {
      queryBuilder.where('created_at', '>=', value);
    } else if (operator === 'lt') {
      queryBuilder.where('created_at', '<', value);
    } else if (operator === 'lte') {
      queryBuilder.where('created_at', '<=', value);
    }
  }
}
