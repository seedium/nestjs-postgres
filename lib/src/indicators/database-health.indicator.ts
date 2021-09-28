import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Knex } from 'knex';
import { Inject } from '@nestjs/common';
import {KNEX_MANAGER} from "@constants";

export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(@Inject(KNEX_MANAGER) private readonly _knexManager: Knex) {
    super();
  }
  public async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this._knexManager.raw(`select 1+1 as result`);
      return this.getStatus('database', true);
    } catch (err) {
      throw new HealthCheckError(
        'Database is not healthy',
        this.getStatus('database', false),
      );
    }
  }
}
