import { Type, ForwardReference } from '@nestjs/common';
import { IResourceObject } from '@picflow/types';
import {IRepository} from "@interfaces/repository.interface";
import {ExpandRepositoryStrategyOptions} from "@interfaces/expand-hook.interface";

export type TypeRepository<T extends IResourceObject = IResourceObject> = Type<
  IRepository<T>
>;

export interface ListExpandableOptions
  extends Partial<ExpandRepositoryStrategyOptions> {
  foreignField?: string;
  repository:
    | TypeRepository
    | ForwardReference<() => TypeRepository>
    | undefined;
}

export type ExpandableOptions = Record<
  string,
  | ListExpandableOptions
  | TypeRepository
  | ForwardReference<() => TypeRepository>
  | undefined
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldTransformer<TValue = any, TResult = unknown> = (
  value: TValue,
) => TResult;

export interface EntityRepositoryOptions {
  name: string;
  prefix: string;
  expandable?: ExpandableOptions;
  transform?: Partial<Record<string, FieldTransformer>>;
}
