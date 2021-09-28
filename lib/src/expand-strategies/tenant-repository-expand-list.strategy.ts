import {ExpandStrategy} from "@interfaces/expand-hook.interface";

export const tenantRepositoryExpandListStrategy: ExpandStrategy = (
  repository,
  record,
  { foreignField, expand, databaseOptions },
) =>
  repository.list(
    record.tenant,
    { [foreignField]: record.id, expand },
    databaseOptions,
  );
