import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {KNEX_MANAGER} from "@constants";
import {RepositoryDatabaseOptions} from "@interfaces/database-options.interface";

@Injectable()
export class KnexHelper {
  constructor(@Inject(KNEX_MANAGER) private readonly _knex: Knex) {}
  public async withTransaction<T>(
    databaseOptions: RepositoryDatabaseOptions | undefined,
    cb: (transaction: Knex.Transaction) => Promise<T>,
  ): Promise<T> {
    if (databaseOptions?.transaction) {
      return cb(databaseOptions.transaction);
    }
    return this._knex.transaction(cb);
  }
}
