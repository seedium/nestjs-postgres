import { Type } from '@nestjs/common';
import {
  EntityRepositoryOptions,
  ExpandableOptions,
  FieldTransformer
} from "@interfaces/entity-repository-options.interface";
import {PostgresRepository} from "./postgres-repository";
import {reflect} from "@utils/reflect";
import {ENTITY_REPOSITORY_OPTIONS} from "@constants";

export class RepositoryReflector<TRecord, TResult> {
  private readonly _repositoryOptions: EntityRepositoryOptions;
  constructor(
    repositoryClassOrConstructor:
      | Function
      | Type<PostgresRepository<TRecord, TResult>>,
  ) {
    this._repositoryOptions = this.reflectRepositoryOptions(
      repositoryClassOrConstructor,
    );
  }
  public get table(): string {
    return this._repositoryOptions.name;
  }
  public get expandable(): ExpandableOptions {
    return this._repositoryOptions.expandable ?? {};
  }
  public get transform(): Partial<Record<string, FieldTransformer>> | null {
    return this._repositoryOptions.transform ?? null;
  }
  public get prefix(): string {
    return this._repositoryOptions.prefix;
  }
  private reflectRepositoryOptions(
    reflectObject: Function | Type<PostgresRepository<TRecord, TResult>>,
  ): EntityRepositoryOptions {
    const entityRepositoryOptions = reflect<EntityRepositoryOptions>(
      reflectObject,
      ENTITY_REPOSITORY_OPTIONS,
    );
    if (!entityRepositoryOptions) {
      throw new Error(
        `"${reflectObject.name}" doesn't have decorator @EntityRepository`,
      );
    }
    return entityRepositoryOptions;
  }
}
