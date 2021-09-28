import {
  Inject,
  DynamicModule,
  FactoryProvider,
  OnApplicationShutdown,
} from '@nestjs/common';
import knex, { Knex } from 'knex';
import { Config } from 'nestjs-configuration';
import { Logger, LoggerModule } from 'nestjs-universal-logger';
import { defer } from 'rxjs';
import {KNEX_MANAGER, POSTGRES_MODULE_OPTIONS} from "@constants";
import {PostgresModuleOptions} from "@interfaces/postgresModuleOptions.interface";
import {handleRetry} from "@utils/handle-retry";
import {DatabaseHealthIndicator} from "./src/indicators";
import {RepositoryInjector} from "./src/injectors";
import {KnexHelper} from "./src/providers";

export class PostgresCoreModule implements OnApplicationShutdown {
  private readonly _logger = new Logger('PostgresModule');

  constructor(
    @Inject(POSTGRES_MODULE_OPTIONS) private readonly options: PostgresModuleOptions,
    @Inject(KNEX_MANAGER) private readonly _knex: Knex,
  ) {
    this._logger.setContext(PostgresCoreModule);
  }

  static forRoot(options: PostgresModuleOptions): DynamicModule {
    const postgresModuleOptions = {
      provide: POSTGRES_MODULE_OPTIONS,
      useValue: options,
    };
    const knexProvider: FactoryProvider = {
      provide: KNEX_MANAGER,
      inject: [Config, Logger],
      useFactory: async (config: Config, logger: Logger) =>
        await defer(async () => {
          logger.setContext(PostgresCoreModule);

          if (options.connection.connectionString) {
            logger.log(
              `Connecting to database ${PostgresCoreModule.hideStringCredentials(
                options.connection.connectionString,
              )}...`,
            );
          } else {
            logger.log(
              `Connecting to database ${options.connection.host}:${options.connection.port}...`,
            );
          }

          const knexInstance = knex({
            client: 'pg',
            connection: options.connection,
            pool: options.pool,
          });
          await knexInstance.raw(`select 1+1 as result`);
          return knexInstance;
        })
          .pipe(handleRetry('postgres', logger))
          .toPromise(),
    };
    return {
      module: PostgresCoreModule,
      imports: [LoggerModule.forFeature()],
      providers: [
        knexProvider,
        DatabaseHealthIndicator,
        RepositoryInjector,
        KnexHelper,
        postgresModuleOptions,
      ],
      exports: [
        knexProvider,
        DatabaseHealthIndicator,
        RepositoryInjector,
        KnexHelper,
      ],
    };
  }

  static hideStringCredentials(connectionString: string): string {
    return connectionString.replace(/\/\/.*@/, '//*****:*****@');
  }

  async onApplicationShutdown(): Promise<void> {
    await this._knex.destroy();
    this._logger.log(`Connection to database is destroyed`);
  }
}
