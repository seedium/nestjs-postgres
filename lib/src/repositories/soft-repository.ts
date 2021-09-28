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
import {SoftRepositoryInterceptor} from "../interceptors";
import {KNEX_MANAGER} from "@constants";
import {RepositoryInjector} from "../injectors";
import {IPaginationBuilder} from "@interfaces/pagination.interface";
import {
  RepositoryDatabaseOptions, RepositoryDataOptions,
  RepositoryListOptionsCreated,
  SelectRepositoryDatabaseOptions
} from "@interfaces/database-options.interface";
import * as picflow from 'picflow';

console.log(picflow);

export class SoftRepository<
  TRecord extends IResourceObject,
  TResult extends IResourceObject,
> implements IRepository<TRecord, TResult>
{
  protected readonly _repository: PostgresRepository<TRecord, TResult>;
  private readonly _softInterceptorRepository: SoftRepositoryInterceptor<
    TRecord,
    TResult
  >;
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
    this._softInterceptorRepository = new SoftRepositoryInterceptor(
      this._repository,
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
      this._softInterceptorRepository.list(options, databaseOptions),
      options,
      databaseOptions,
    );
  }
  public async create(
    entity: OmitDefaultResourceFields<TRecord>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TRecord> {
    return this._repository.hooks.create(
      this._softInterceptorRepository.create(entity, databaseOptions),
    );
  }
  public async retrieve(
    id: ID,
    options?: RepositoryDataOptions,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<TResult | null> {
    return this._repository.hooks.retrieve(
      this._softInterceptorRepository.retrieve(id, options, databaseOptions),
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
      this._softInterceptorRepository.update(id, entity, databaseOptions),
    );
  }
  public async delete(
    id: ID,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<void> {
    return this._repository.hooks.delete(
      this._softInterceptorRepository.delete(id, databaseOptions),
    );
  }
  public async restore(
    id: ID,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TResult | null> {
    const [record] = await this._softInterceptorRepository.restore(
      id,
      databaseOptions,
    );
    if (!record) {
      return null;
    }
    return record;
  }
}
