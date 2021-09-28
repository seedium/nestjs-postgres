import { Knex } from 'knex';
import { IDataOptions, IDateFilter } from '@picflow/types';
import {IncludeStrategy} from "@interfaces/include-strategy.interface";
import {FilterInlineStrategy} from "@interfaces/inline.strategy";

export type RepositoryDataOptions = Omit<IDataOptions, 'include'>;

/*
 * Can't just to remove property `include` from `IListOptionsCreated` type,
 * cuz this property comes from inheritance `IDataOptions` type and standard type `Omit` not working here.
 * So, just copy all properties from original `IListOptionsCreated` type
 * */
export interface RepositoryListOptionsCreated extends RepositoryDataOptions {
  page?: number;
  sort?: string[];
  limit?: number;
  created?: IDateFilter;
  [filterColumn: string]: string | number | unknown;
}

export interface RepositoryDatabaseOptions {
  transaction?: Knex.Transaction;
}

export type IncludeStrategies<TRecord, TResult> = IncludeStrategy<
  TRecord,
  TResult,
  unknown
>[];
export type FilterStrategies<TRecord, TResult> = FilterInlineStrategy<
  TRecord,
  TResult
>[];

export interface SelectRepositoryDatabaseOptions<TRecord, TResult>
  extends RepositoryDatabaseOptions {
  include?: IncludeStrategies<TRecord, TResult>;
  filter?: FilterStrategies<TRecord, TResult>;
}
