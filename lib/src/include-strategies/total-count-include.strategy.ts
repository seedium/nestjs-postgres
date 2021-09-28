import { IListOptionsCreated, IResourceObject } from '@picflow/types';
import { omit } from '@picflow/helpers';
import {Include} from "../decorators";
import {CanIncludeList} from "@interfaces/include-strategy.interface";
import {QueryBuilderMap} from "@interfaces/factory-query-builder.interface";
import {sanitizeFilterOptions} from "@utils/sanitaze-filter-options";

@Include('total_count')
export class TotalCountIncludeStrategy<
  TRecord extends IResourceObject,
  TResult extends IResourceObject,
> implements CanIncludeList<TRecord, TResult, bigint>
{
  constructor(private readonly _options?: IListOptionsCreated) {}
  public async list({
    queryBuilder,
  }: QueryBuilderMap<TRecord, TResult>): Promise<bigint> {
    const filterOptions = this.extractFilterOptions(this._options);
    const sanitizedFilter = sanitizeFilterOptions(filterOptions);
    const result = await queryBuilder.where(sanitizedFilter).count('*').first();
    return BigInt(result.count);
  }
  private extractFilterOptions(
    options: IListOptionsCreated = {},
  ): Record<string, unknown> {
    return omit(
      options,
      'page',
      'limit',
      'include',
      'expand',
      'sort',
      'created',
    );
  }
}
