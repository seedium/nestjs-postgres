import { OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';
import type { QueryResult } from 'pg';
import { ID, OmitDefaultResourceFields } from '@picflow/types';
import {IAbstractRepository, IRawRepository, IRepository} from "@interfaces/repository.interface";
import {RepositoryBuilder} from "./repository-builder";
import {CrudRepositoryHook} from "./crud-repository-hook";
import {IdFactory} from "@utils/id-factory";
import {RepositoryReflector} from "./repository-reflector";
import {ExpandInjector, RepositoryInjector} from "./injectors";
import {ExpandHook, IncludeHook} from "./hooks";
import {IPaginationBuilder} from "@interfaces/pagination.interface";
import {PagePagination} from "./paginations";
import {
  RepositoryDatabaseOptions, RepositoryDataOptions,
  RepositoryListOptionsCreated,
  SelectRepositoryDatabaseOptions
} from "@interfaces/database-options.interface";
import {ICreateTimestamp, IUpdateTimestamp} from "@interfaces/resource.interface";
import {now} from "@utils/time";

export class PostgresRepository<TRecord, TResult>
  implements IAbstractRepository<TRecord, TResult>, OnModuleInit
{
  public readonly hooks: CrudRepositoryHook<TRecord, TResult>;
  public readonly builder: RepositoryBuilder<TRecord, TResult>;
  public readonly idFactory: IdFactory;

  protected readonly _reflector: RepositoryReflector<TRecord, TResult>;

  protected readonly _expandInjector: ExpandInjector;

  protected readonly _includeHook: IncludeHook<TRecord, TResult>;
  protected readonly _expandHook: ExpandHook;

  constructor(
    repository: IRepository | IRawRepository,
    repositoryInjector: RepositoryInjector,
    protected readonly _manager: Knex,
    protected readonly _pagination: IPaginationBuilder<
      TRecord,
      TResult
    > = new PagePagination(),
  ) {
    this._reflector = new RepositoryReflector(repository.constructor);
    this.builder = new RepositoryBuilder(this._pagination);
    this._expandInjector = new ExpandInjector(
      repositoryInjector,
      this._reflector.expandable,
    );
    this._includeHook = new IncludeHook();
    this._expandHook = new ExpandHook(this._expandInjector);
    this.hooks = new CrudRepositoryHook(
      this,
      this._reflector,
      this._includeHook,
      this._expandHook,
      this._pagination,
    );
    this.idFactory = new IdFactory(this._reflector.prefix);
    this.verifyPrefixLength(this._reflector.prefix);
  }
  public async onModuleInit(): Promise<void> {
    this._expandInjector.onModuleInit();
  }
  public list(
    {
      limit,
      page,
      sort = [],
      created,
      ...filterOptions
    }: RepositoryListOptionsCreated = {},
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Knex.QueryBuilder<TRecord> {
    const queryBuilder = this.queryBuilder(databaseOptions?.transaction);
    queryBuilder.select(
      '*',
      ...this._includeHook.runInline(
        {
          factoryQueryBuilder: () =>
            this.queryBuilder(databaseOptions?.transaction),
          factoryRawBuilder: () =>
            this.rawBuilder(databaseOptions?.transaction),
        },
        this._includeHook.filterCanIncludeInline(databaseOptions?.include),
      ),
    );
    this.builder.buildFilterQuery(
      queryBuilder,
      () => this.rawBuilder(databaseOptions?.transaction),
      filterOptions,
      databaseOptions?.filter,
    );
    this.builder.buildPaginationQuery(queryBuilder, limit, page);
    this.builder.buildSortQuery(queryBuilder, sort);
    this.builder.buildDateFilterQuery(queryBuilder, created);
    return queryBuilder;
  }
  public create(
    entity: OmitDefaultResourceFields<TRecord>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord> {
    /* eslint-disable-next-line */
    return this.queryBuilder<any>(databaseOptions?.transaction)
      .insert({
        ...entity,
        ...this.getCreateTimestamps(),
        id: this.idFactory.generate(),
      })
      .returning('*');
  }
  public retrieve(
    id: ID,
    options?: RepositoryDataOptions,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Knex.QueryBuilder<TRecord> {
    const queryBuilder = this.queryBuilder(databaseOptions?.transaction);
    queryBuilder
      .select(
        '*',
        ...this._includeHook.runInline(
          {
            factoryQueryBuilder: () =>
              this.queryBuilder(databaseOptions?.transaction),
            factoryRawBuilder: () =>
              this.rawBuilder(databaseOptions?.transaction),
          },
          this._includeHook.filterCanIncludeInline(databaseOptions?.include),
        ),
      )
      .where('id', id)
      .first();
    return queryBuilder;
  }
  public update(
    id: ID,
    entity: Partial<OmitDefaultResourceFields<TRecord>>,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord> {
    /* eslint-disable-next-line */
    return this.queryBuilder<any>(databaseOptions?.transaction)
      .where('id', id)
      .update({
        ...entity,
        ...this.getUpdateTimestamps(),
      })
      .returning('*');
  }
  public delete(
    id: ID,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Knex.QueryBuilder<TRecord, TResult> {
    return this.queryBuilder(databaseOptions?.transaction)
      .where('id', id)
      .del();
  }
  public queryBuilder<TOverrideRecord extends TRecord>(
    trx?: Knex.Transaction,
  ): Knex.QueryBuilder<TOverrideRecord, TResult> {
    const queryBuilder = this._manager<TOverrideRecord, TResult>(
      this._reflector.table,
    );
    if (trx) {
      queryBuilder.transacting(trx);
    }
    return queryBuilder;
  }

  public rawBuilder(
    trx?: Knex.Transaction,
  ): Knex.RawBuilder<TRecord, QueryResult>;
  public rawBuilder(trx?: Knex.Transaction): (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueOrSql: any,
    ...bindings: readonly Knex.RawBinding[]
  ) => Knex.Raw<QueryResult> {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueOrSql: any,
      ...bindings: readonly Knex.RawBinding[]
    ): Knex.Raw<QueryResult> => {
      const rawBuilder = this._manager.raw(valueOrSql, ...bindings);
      if (trx) {
        rawBuilder.transacting(trx);
      }
      return rawBuilder;
    };
  }

  public getCreateTimestamps(): ICreateTimestamp {
    return {
      created_at: now(),
      updated_at: now(),
    };
  }
  public getUpdateTimestamps(): IUpdateTimestamp {
    return {
      updated_at: now(),
    };
  }
  private verifyPrefixLength(prefix: string): void {
    if (prefix.length > 30) {
      throw new Error(
        `The prefix "${prefix}" has exceeded maximum limit of column id. Maximum length should 30 chars or less`,
      );
    }
  }
}
