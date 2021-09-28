import {EntityRepositoryOptions} from "@interfaces/entity-repository-options.interface";
import {ENTITY_REPOSITORY_OPTIONS} from "@constants";

export const EntityRepository = (
  options: EntityRepositoryOptions,
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(ENTITY_REPOSITORY_OPTIONS, options, target);
  };
};
