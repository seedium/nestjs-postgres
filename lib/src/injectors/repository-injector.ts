import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { IResourceObject } from '@picflow/types';
import {TypeRepository} from "@interfaces/entity-repository-options.interface";
import {IRepository} from "@interfaces/repository.interface";

@Injectable()
export class RepositoryInjector {
  constructor(private readonly _moduleRef: ModuleRef) {}
  public injectRepository(token: TypeRepository): IRepository<IResourceObject> {
    return this._moduleRef.get(token, { strict: false });
  }
}
