import {ExpandStrategy} from "@interfaces/expand-hook.interface";

export const repositoryExpandListStrategy: ExpandStrategy = (
  repository,
  record,
  { foreignField, expand, databaseOptions },
) => repository.list({ [foreignField]: record.id, expand }, databaseOptions);
