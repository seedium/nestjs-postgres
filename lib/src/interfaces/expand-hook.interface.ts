import { IList, IResourceObject } from '@picflow/types';
import {IRepository} from "@interfaces/repository.interface";
import {RepositoryDatabaseOptions} from "@interfaces/database-options.interface";

export type ExpandStrategy<
  T extends Record<string, unknown> = Record<string, unknown>,
> = (
  repository: IRepository<IResourceObject>,
  record: T,
  options: {
    foreignField: string;
    localField: string;
    expand: string[];
    databaseOptions?: RepositoryDatabaseOptions;
  },
) => Promise<unknown | IList<unknown>>;

export interface ExpandRepositoryStrategyOptions {
  retrieveStrategy: ExpandStrategy;
  listStrategy: ExpandStrategy;
}

export interface ExpandRepositoryOptions
  extends ExpandRepositoryStrategyOptions {
  isList: boolean;
  localField: string;
  foreignField: string;
  repository: IRepository<IResourceObject>;
}
