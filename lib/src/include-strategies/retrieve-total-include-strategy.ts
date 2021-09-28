import { IListOptionsCreated, IResourceObject } from '@picflow/types';
import {TotalCountIncludeStrategy} from "./total-count-include.strategy";

export const retrieveTotalIncludeStrategy = <
  TRecord extends IResourceObject,
  TResult extends IResourceObject,
>(
  options?: IListOptionsCreated,
): [TotalCountIncludeStrategy<TRecord, TResult>] | [] => {
  if (options?.include?.includes('total_count')) {
    return [new TotalCountIncludeStrategy<TRecord, TResult>(options)];
  }
  return [];
};
