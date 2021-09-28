import {
  EntityRepositoryOptions,
  ExpandableOptions,
  ListExpandableOptions
} from "@interfaces/entity-repository-options.interface";
import {tenantRepositoryExpandListStrategy, tenantRepositoryExpandRetrieveStrategy} from "../expand-strategies";
import {EntityRepository} from "./entity-repository.decorator";

const isFieldExpandableOptions = (
  maybeFieldExpandableOptions: unknown | undefined,
): maybeFieldExpandableOptions is ListExpandableOptions => {
  if (!maybeFieldExpandableOptions) {
    return false;
  }
  return !!(maybeFieldExpandableOptions as ListExpandableOptions).repository;
};

const transformExpandableOptions = (
  expandable?: ExpandableOptions,
): ExpandableOptions | undefined => {
  if (!expandable) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(expandable).map(
      ([property, expandableOptionsOrTypeRepository]) => {
        if (isFieldExpandableOptions(expandableOptionsOrTypeRepository)) {
          return [
            property,
            {
              listStrategy: tenantRepositoryExpandListStrategy,
              retrieveStrategy: tenantRepositoryExpandRetrieveStrategy,
              ...expandableOptionsOrTypeRepository,
            },
          ];
        }
        return [
          property,
          {
            listStrategy: tenantRepositoryExpandListStrategy,
            retrieveStrategy: tenantRepositoryExpandRetrieveStrategy,
            repository: expandableOptionsOrTypeRepository,
          },
        ];
      },
    ),
  );
};

const transformOptions = (
  options: EntityRepositoryOptions,
): EntityRepositoryOptions => ({
  ...options,
  expandable: transformExpandableOptions(options.expandable),
});

export const EntityTenantRepository = (
  options: EntityRepositoryOptions,
): ClassDecorator => {
  return (target) => EntityRepository(transformOptions(options))(target);
};
