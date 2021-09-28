import { Inject, Optional } from '@nestjs/common';
import { Knex } from 'knex';
import { PostgresRepository } from '../postgres-repository';
import {IRawRepository} from "@interfaces/repository.interface";
import {KNEX_MANAGER} from "@constants";
import {RepositoryInjector} from "../injectors";
import {IPaginationBuilder} from "@interfaces/pagination.interface";

export class RawRepository<TRecord, TResult> implements IRawRepository {
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
}
