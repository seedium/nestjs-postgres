import {ExpandStrategy} from "@interfaces/expand-hook.interface";

export const repositoryExpandRetrieveStrategy: ExpandStrategy = (
  repository,
  record,
  { localField, expand, databaseOptions },
) => repository.retrieve(record[localField], { expand }, databaseOptions);
