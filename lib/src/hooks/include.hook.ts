import { Knex } from 'knex';
import {
  FactoryQueryBuilder,
  FactoryQueryBuilderMap,
  FactoryRawBuilder
} from "@interfaces/factory-query-builder.interface";
import {CanIncludeList} from "@interfaces/include-strategy.interface";
import {reflect} from "@utils/reflect";
import {INCLUDE_OPTIONS} from "@constants";
import {IncludeInlineStrategy} from "@interfaces/inline.strategy";
import {IncludeStrategies} from "@interfaces/database-options.interface";

export class IncludeHook<TRecord, TResult> {
  public runList(
    factoryQueryBuilder: FactoryQueryBuilder<TRecord, TResult>,
    factoryRawBuilder: FactoryRawBuilder<TRecord, TResult>,
    include: CanIncludeList<TRecord, TResult, unknown>[],
  ): Record<string, Promise<unknown>> {
    return include.reduce<Record<string, Promise<unknown>>>(
      (includes, includeStrategy) => {
        const includeName = reflect<string>(includeStrategy, INCLUDE_OPTIONS);
        if (!includeName) {
          return includes;
        }
        includes[includeName] = includeStrategy.list({
          queryBuilder: factoryQueryBuilder(),
          rawQueryBuilder: factoryRawBuilder(),
        });
        return includes;
      },
      {},
    );
  }
  public runInline(
    {
      factoryQueryBuilder,
      factoryRawBuilder,
    }: FactoryQueryBuilderMap<TRecord, TResult>,
    include: IncludeInlineStrategy<TRecord, TResult>[],
  ): Array<Knex.QueryBuilder<TRecord, TResult> | Knex.Raw<TResult>> {
    return include.reduce<
      Array<Knex.QueryBuilder<TRecord, TResult> | Knex.Raw<TResult>>
    >((includes, includeStrategy) => {
      const includeName = reflect<string>(includeStrategy, INCLUDE_OPTIONS);
      if (!includeName) {
        return includes;
      }
      const queryBuilderOrRaw = includeStrategy.inline({
        queryBuilder: factoryQueryBuilder(),
        rawQueryBuilder: factoryRawBuilder(),
      });
      if (this.isQueryBuilder(queryBuilderOrRaw)) {
        queryBuilderOrRaw.as(includeName);
      }
      includes.push(queryBuilderOrRaw);
      return includes;
    }, []);
  }
  public filterCanIncludeList(
    strategies: IncludeStrategies<TRecord, TResult> = [],
  ): CanIncludeList<TRecord, TResult, unknown>[] {
    return strategies.filter(
      (strategy): strategy is CanIncludeList<TRecord, TResult, unknown> =>
        !!(strategy as CanIncludeList<TRecord, TResult, unknown>).list,
    );
  }
  public filterCanIncludeInline(
    strategies: IncludeStrategies<TRecord, TResult> = [],
  ): IncludeInlineStrategy<TRecord, TResult>[] {
    return strategies.filter(
      (strategy): strategy is IncludeInlineStrategy<TRecord, TResult> =>
        !!(strategy as IncludeInlineStrategy<TRecord, TResult>).inline,
    );
  }
  private isQueryBuilder(
    queryBuilderOrRaw: Knex.QueryBuilder | Knex.Raw,
  ): queryBuilderOrRaw is Knex.QueryBuilder {
    return !!(queryBuilderOrRaw as Knex.QueryBuilder).as;
  }
}
