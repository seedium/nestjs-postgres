import { Knex } from 'knex';
import { ID, IResourceObject, OmitDefaultResourceFields } from '@picflow/types';
import {IAbstractRepository} from "@interfaces/repository.interface";
import {
  RepositoryDatabaseOptions, RepositoryDataOptions,
  RepositoryListOptionsCreated,
  SelectRepositoryDatabaseOptions
} from "@interfaces/database-options.interface";
import {now} from "@utils/time";

export class SoftRepositoryInterceptor<
  TRecord extends IResourceObject,
  TResult extends IResourceObject,
> implements IAbstractRepository<TRecord, TResult>
{
  constructor(
    private readonly _repository: IAbstractRepository<TRecord, TResult>,
  ) {}
  public list(
    listOptions?: RepositoryListOptionsCreated,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Knex.QueryBuilder<TRecord> {
    return this._repository
      .list(listOptions, databaseOptions)
      .whereNull('deleted_at');
  }
  public create(
    entity: OmitDefaultResourceFields<TRecord>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord> {
    return this._repository.create(entity, databaseOptions);
  }
  public retrieve(
    id: ID,
    options?: RepositoryDataOptions,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Knex.QueryBuilder<TRecord> {
    return this._repository
      .retrieve(id, options, databaseOptions)
      .whereNull('deleted_at');
  }
  public update(
    id: ID,
    entity: Partial<OmitDefaultResourceFields<TRecord>>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord> {
    return this._repository
      .update(id, entity, databaseOptions)
      .whereNull('deleted_at');
  }
  public delete(
    id: ID,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord> {
    return (
      this._repository
        /* eslint-disable-next-line */
        .queryBuilder<any>(databaseOptions?.transaction)
        .where('id', id)
        .whereNull('deleted_at')
        .update({ deleted_at: now() })
    );
  }
  public restore(
    id: ID,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord> {
    return (
      this._repository
        /* eslint-disable-next-line */
        .queryBuilder<any>(databaseOptions?.transaction)
        .where('id', id)
        .whereNotNull('deleted_at')
        .update({ deleted_at: null })
        .returning('*')
    );
  }
  public queryBuilder<TOverrideRecord extends TRecord>(
    trx?: Knex.Transaction,
  ): Knex.QueryBuilder<TOverrideRecord, TResult> {
    return this._repository.queryBuilder(trx);
  }
}
