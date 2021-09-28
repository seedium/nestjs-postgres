import { OnModuleInit, ForwardReference } from '@nestjs/common';
import { IResourceObject } from '@picflow/types';
import {ExpandRepositoryOptions, ExpandRepositoryStrategyOptions} from "@interfaces/expand-hook.interface";
import {RepositoryInjector} from "./repository-injector";
import {
  ExpandableOptions,
  ListExpandableOptions,
  TypeRepository
} from "@interfaces/entity-repository-options.interface";
import {RepositoryCircularDependencyException} from "@exceptions/repository-circular-dependency.exception";
import {repositoryExpandListStrategy, repositoryExpandRetrieveStrategy} from "../expand-strategies";
import {IRepository} from "@interfaces/repository.interface";

export class ExpandInjector implements OnModuleInit {
  private _expandableRepositories: Map<string, ExpandRepositoryOptions> =
    new Map();
  constructor(
    private readonly _repositoryInjector: RepositoryInjector,
    private readonly _expandableOptions: ExpandableOptions,
  ) {}
  public onModuleInit(): void {
    this.buildDependencyGraph(this._expandableOptions).forEach(
      (expandRepositoryOptions) => {
        this._expandableRepositories.set(
          expandRepositoryOptions.localField,
          expandRepositoryOptions,
        );
      },
    );
  }
  public getExpandRepositoryOptions(
    field: string,
  ): ExpandRepositoryOptions | null {
    const repository = this._expandableRepositories.get(field);
    if (!repository) {
      return null;
    }
    return repository;
  }
  private buildDependencyGraph(
    expandable: ExpandableOptions,
  ): ExpandRepositoryOptions[] {
    return Object.entries(expandable).map<ExpandRepositoryOptions>(
      ([property, expandableOptions]) => {
        if (!expandableOptions) {
          throw new RepositoryCircularDependencyException(property);
        }
        if (this.isFieldExpandableOptions(expandableOptions)) {
          return this.lookupInFieldExpandableOptions(
            property,
            expandableOptions,
          );
        }
        if (this.isTypeExpandableRepository(expandableOptions)) {
          return this.lookupInTypeExpandable(property, expandableOptions);
        }
        return this.lookupInForwardReference(property, expandableOptions);
      },
    );
  }
  private lookupInFieldExpandableOptions(
    localField: string,
    fieldExpandableOptions: ListExpandableOptions,
  ): ExpandRepositoryOptions {
    const { repository, retrieveStrategy, listStrategy, ...expandOptions } =
      fieldExpandableOptions;
    const buildExpandRepositoryOptions = (
      expandRepositoryOptions: ExpandRepositoryOptions,
    ): ExpandRepositoryOptions => ({
      ...expandRepositoryOptions,
      ...expandOptions,
      isList:
        !!expandOptions.foreignField &&
        expandOptions.foreignField !== expandRepositoryOptions.foreignField,
    });
    if (this.isForwardReference(repository)) {
      const forwardExpandOptions = this.lookupInForwardReference(
        localField,
        repository,
        {
          retrieveStrategy,
          listStrategy,
        },
      );
      return buildExpandRepositoryOptions(forwardExpandOptions);
    }
    const typeExpandOptions = this.lookupInTypeExpandable(
      localField,
      repository,
      {
        retrieveStrategy,
        listStrategy,
      },
    );
    return buildExpandRepositoryOptions(typeExpandOptions);
  }
  private lookupInForwardReference(
    localField: string,
    { forwardRef }: ForwardReference<() => TypeRepository>,
    strategyOptions?: Partial<ExpandRepositoryStrategyOptions>,
  ): ExpandRepositoryOptions {
    const typeExpandableRepository = forwardRef();
    return this.lookupInTypeExpandable(
      localField,
      typeExpandableRepository,
      strategyOptions,
    );
  }
  private lookupInTypeExpandable(
    localField: string,
    typeExpandableRepository: TypeRepository | undefined,
    strategyOptions?: Partial<ExpandRepositoryStrategyOptions>,
  ): ExpandRepositoryOptions {
    if (!typeExpandableRepository) {
      throw new RepositoryCircularDependencyException(localField);
    }
    return {
      isList: false,
      localField,
      foreignField: 'id',
      retrieveStrategy:
        strategyOptions?.retrieveStrategy ?? repositoryExpandRetrieveStrategy,
      listStrategy:
        strategyOptions?.listStrategy ?? repositoryExpandListStrategy,
      repository: this.injectRepositoryFromTypeExpandable(
        typeExpandableRepository,
      ),
    };
  }
  private injectRepositoryFromTypeExpandable(
    typeExpandableRepository: TypeRepository,
  ): IRepository<IResourceObject> {
    return this._repositoryInjector.injectRepository(typeExpandableRepository);
  }
  private isFieldExpandableOptions(
    maybeFieldExpandableOptions: unknown | undefined,
  ): maybeFieldExpandableOptions is ListExpandableOptions {
    if (!maybeFieldExpandableOptions) {
      return false;
    }
    return !!(maybeFieldExpandableOptions as ListExpandableOptions).repository;
  }
  private isTypeExpandableRepository(
    maybeTypeExpandableRepository: unknown | undefined,
  ): maybeTypeExpandableRepository is TypeRepository {
    if (!maybeTypeExpandableRepository) {
      return false;
    }
    return typeof maybeTypeExpandableRepository === 'function';
  }
  private isForwardReference(
    maybeForwardReference: unknown | undefined,
  ): maybeForwardReference is ForwardReference<() => TypeRepository> {
    if (!maybeForwardReference) {
      return false;
    }
    return !!(maybeForwardReference as ForwardReference).forwardRef;
  }
}
