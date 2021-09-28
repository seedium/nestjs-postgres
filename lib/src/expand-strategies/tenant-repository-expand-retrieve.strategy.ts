import {ExpandStrategy} from "@interfaces/expand-hook.interface";

export const tenantRepositoryExpandRetrieveStrategy: ExpandStrategy = (
  repository,
  record,
  { localField, expand, databaseOptions },
) =>
  repository.retrieve(
    record.tenant,
    record[localField],
    { expand },
    databaseOptions,
  );
