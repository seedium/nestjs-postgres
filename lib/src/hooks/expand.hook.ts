import { prop, asyncMap, isPlainObject } from '@picflow/helpers';
import {ExpandInjector} from "../injectors";
import {RepositoryDatabaseOptions} from "@interfaces/database-options.interface";
import {ExpandRepositoryOptions} from "@interfaces/expand-hook.interface";

export class ExpandHook {
  constructor(private readonly _expandInjector: ExpandInjector) {}
  public async expand<TResult>(
    response: TResult,
    expand: string[],
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TResult> {
    if (!expand.length) {
      return response;
    }
    const expandResult = await asyncMap(expand, (path) =>
      this.expandPath(response, path.split('.'), databaseOptions),
    );
    return expandResult.reduce<TResult>(
      (result, currentExpandResult, index) =>
        this.traverseMerge(
          result,
          currentExpandResult,
          expand[index].split('.'),
        ) as TResult,
      response,
    );
  }
  private async expandPath<TResult>(
    data: TResult,
    paths: string[],
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TResult> {
    if (!paths.length) {
      return data;
    }
    // I can do the casting cuz checked length of array above
    const path = paths.shift() as string;
    const expandRepositoryOptions =
      this._expandInjector.getExpandRepositoryOptions(path);
    if (!expandRepositoryOptions) {
      return {
        ...data,
        [path]: await this.expandPath(
          prop(path)(data as Record<string, unknown>),
          paths,
          databaseOptions,
        ),
      };
    }
    if (Array.isArray(data)) {
      return (await asyncMap(data, (element) =>
        this.expandElement(
          element,
          path,
          paths,
          expandRepositoryOptions,
          databaseOptions,
        ),
      )) as unknown as TResult;
    }
    return (await this.expandElement(
      data as Record<string, unknown>,
      path,
      paths,
      expandRepositoryOptions,
      databaseOptions,
    )) as unknown as TResult;
  }
  private async expandElement<TResult extends Record<string, unknown>>(
    data: TResult,
    path: string,
    leastPath: string[],
    {
      isList,
      localField,
      foreignField,
      repository,
      retrieveStrategy,
      listStrategy,
    }: ExpandRepositoryOptions,
    databaseOptions?: RepositoryDatabaseOptions,
  ): Promise<TResult> {
    const expand = leastPath.length ? [leastPath.join('.')] : [];
    if (isList) {
      return {
        ...data,
        [path]: await listStrategy(repository, data, {
          foreignField,
          localField,
          expand,
          databaseOptions,
        }),
      };
    }
    if (typeof data[localField] === 'string') {
      return {
        ...data,
        [path]: await retrieveStrategy(repository, data, {
          foreignField,
          localField,
          expand,
          databaseOptions,
        }),
      };
    }
    return {
      ...data,
      [path]: null,
    };
  }
  private traverseMerge<TResult>(
    target: TResult,
    source: TResult,
    paths: string[],
  ): TResult | TResult[] {
    const path = paths.shift();
    if (path) {
      if (isPlainObject(target)) {
        return {
          ...target,
          [path]: this.traverseMerge(
            target[path],
            (source as Record<string, unknown>)[path],
            paths,
          ),
        };
      }
      if (Array.isArray(target)) {
        return target.map((targetElement, index) => ({
          ...targetElement,
          [path]: this.traverseMerge(
            targetElement[path],
            (source as unknown as Array<Record<string, unknown>>)[index][path],
            paths,
          ),
        }));
      }
    }
    return source;
  }
}
