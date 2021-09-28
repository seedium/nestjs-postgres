import {QueryBuilderMap} from "@interfaces/factory-query-builder.interface";
import {IncludeInlineStrategy} from "@interfaces/inline.strategy";

export interface CanIncludeList<TRecord, TResult, U> {
  list(queryBuilderMap: QueryBuilderMap<TRecord, TResult>): Promise<U>;
}

export type IncludeStrategy<TRecord, TResult, U> =
  | CanIncludeList<TRecord, TResult, U>
  | IncludeInlineStrategy<TRecord, TResult>;
