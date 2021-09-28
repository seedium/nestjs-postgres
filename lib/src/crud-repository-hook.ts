import { Knex } from 'knex';
import { IList } from '@picflow/types';
import { asyncObject } from '@picflow/helpers';
import {FieldTransformer} from "@interfaces/entity-repository-options.interface";
import {PostgresRepository} from "./postgres-repository";
import {RepositoryReflector} from "./repository-reflector";
import {ExpandHook, IncludeHook} from "./hooks";
import {IPaginationBuilder} from "@interfaces/pagination.interface";
import {
  RepositoryDatabaseOptions,
  RepositoryDataOptions,
  RepositoryListOptionsCreated,
  SelectRepositoryDatabaseOptions
} from "@interfaces/database-options.interface";

export class CrudRepositoryHook<TRecord, TResult> {
  private readonly _fieldTransformEntries: [
    keyof TResult,
    FieldTransformer<unknown>,
  ][] = [];
  constructor(
    private readonly _repository: PostgresRepository<TRecord, TResult>,
    private readonly _repositoryReflector: RepositoryReflector<
      TRecord,
      TResult
    >,
    private readonly _includeHook: IncludeHook<TRecord, TResult>,
    private readonly _expandHook: ExpandHook,
    private readonly _pagination: IPaginationBuilder<TRecord, TResult>,
  ) {
    if (this._repositoryReflector.transform) {
      this._fieldTransformEntries = Object.entries(
        this._repositoryReflector.transform,
      ) as [keyof TResult, FieldTransformer][];
    }
  }
  public async list<Result>(
    queryBuilder: Knex.QueryBuilder<TRecord> | TResult[],
    options?: RepositoryListOptionsCreated,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<IList<Result>> {
    let data: TResult[];
    if (this.isQueryBuilder(queryBuilder)) {
      data = (await queryBuilder) as TResult[];
    } else {
      data = queryBuilder as TResult[];
    }
    const result = await this.prepareListResponse(
      data,
      options,
      databaseOptions,
    );
    return {
      ...result,
      data: result.data.map((value) => this.transformFields(value)),
    } as unknown as IList<Result>;
  }
  public async create(
    queryBuilder: Knex.QueryBuilder<TRecord>,
  ): Promise<TRecord> {
    const [result] = await queryBuilder;
    return this.transformFields(result);
  }
  public async retrieve<Result>(
    queryBuilder: Knex.QueryBuilder<TRecord>,
    options?: RepositoryDataOptions,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<Result | null> {
    const record = await queryBuilder;
    if (!record) {
      return null;
    }
    return this.transformFields(
      await this.expand(record, options, databaseOptions),
    );
  }
  public async update(
    queryBuilder: Knex.QueryBuilder<TRecord>,
  ): Promise<TRecord | null> {
    const [record] = await queryBuilder;
    if (!record) {
      return null;
    }
    return this.transformFields(record);
  }
  public async delete(queryBuilder: Knex.QueryBuilder<TRecord>): Promise<void> {
    await queryBuilder;
  }
  private async prepareListResponse(
    data: TResult[],
    options?: RepositoryListOptionsCreated,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<IList<TResult>> {
    const preparedListResponse = this._pagination.prepareListResponse(
      data,
      options,
      databaseOptions,
    );
    const { expandedListResponse, ...includes } = await asyncObject({
      expandedListResponse: this.expand<IList<TResult>>(
        preparedListResponse,
        options,
        databaseOptions,
      ),
      ...this._includeHook.runList(
        () => this._repository.queryBuilder(databaseOptions?.transaction),
        () => this._repository.rawBuilder(databaseOptions?.transaction),
        this._includeHook.filterCanIncludeList(databaseOptions?.include),
      ),
    });
    return {
      ...includes,
      ...expandedListResponse,
    };
  }
  private async expand<Result>(
    data: Result,
    options?: RepositoryDataOptions | RepositoryListOptionsCreated,
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): Promise<Result> {
    return this._expandHook.expand(
      data,
      options?.expand ?? [],
      this.filterDatabaseOptionsForExpandHook(databaseOptions),
    );
  }
  private isQueryBuilder(
    maybeQueryBuilder: unknown,
  ): maybeQueryBuilder is Knex.QueryBuilder<TRecord, TResult> {
    return (
      typeof (maybeQueryBuilder as Knex.QueryBuilder<TRecord, TResult>).then ===
      'function'
    );
  }
  private transformFields<TResult>(result: TResult): TResult {
    if (!result) {
      return result;
    }
    if (!this._fieldTransformEntries.length) {
      return result;
    }
    for (const [field, transformer] of this._fieldTransformEntries) {
      if (result[field as unknown as keyof TResult]) {
        // @ts-expect-error Expect field name will be valid for iterate object properties name
        result[field] = transformer(result[field]);
      }
    }
    return result;
  }
  private filterDatabaseOptionsForExpandHook(
    databaseOptions?: SelectRepositoryDatabaseOptions<TRecord, TResult>,
  ): RepositoryDatabaseOptions | undefined {
    if (!databaseOptions) {
      return databaseOptions;
    }
    const { transaction } = databaseOptions;
    return { transaction };
  }
}
