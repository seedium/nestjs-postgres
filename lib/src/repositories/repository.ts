import { Inject, Optional } from '@nestjs/common';
import { Knex } from 'knex';
import {
  ID,
  IList,
  IResourceObject,
  OmitDefaultResourceFields,
} from '@picflow/types';
import {IRepository} from "@interfaces/repository.interface";
import {PostgresRepository} from "../postgres-repository";
import {KNEX_MANAGER} from "@constants";
import {RepositoryInjector} from "../injectors";
import {IPaginationBuilder} from "@interfaces/pagination.interface";
import {
  RepositoryDatabaseOptions, RepositoryDataOptions,
  RepositoryListOptionsCreated,
  SelectRepositoryDatabaseOptions
} from "@interfaces/database-options.interface";

export class Repository<
  TRecord extends IResourceObject,
  TResult extends IResourceObject,
> implements IRepository<TRecord, TResult>
{
  protected readonly _repository: PostgresRepository<TRecord, TResult>;
  constructor(
    @Inject(KNEX_MANAGER) manager: Knex,
    repositoryInjector: RepositoryInjector,
    @Optional() pagination?: IPaginationBuilder<TRecord, TResult>,
  ) {
    this._repository = new PostgresRepository(
      this,
      repositoryInjector,
      manager,
      pagination,
    );
  }
  public onModuleInit(): Promise<void> {
    return this._repository.onModuleInit();
  }
  public async list(
    options?: RepositoryListOptionsCreated,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<IList<TResult>> {
    return this._repository.hooks.list(
      this._repository.list(options, databaseOptions),
      options,
      databaseOptions,
    );
  }
  public async create(
    entity: OmitDefaultResourceFields<TRecord>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TRecord> {
    return this._repository.hooks.create(
      this._repository.create(entity, databaseOptions),
    );
  }
  public async retrieve(
    id: ID,
    options?: RepositoryDataOptions,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<TResult | null> {
    return this._repository.hooks.retrieve(
      this._repository.retrieve(id, options, databaseOptions),
      options,
      databaseOptions,
    );
  }
  public async update(
    id: ID,
    entity: Partial<OmitDefaultResourceFields<TRecord>>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TRecord | null> {
    return this._repository.hooks.update(
      this._repository.update(id, entity, databaseOptions),
    );
  }
  public async delete(
    id: ID,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<void> {
    return this._repository.hooks.delete(
      this._repository.delete(id, databaseOptions),
    );
  }
}
