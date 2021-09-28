import { Nullable } from '@picflow/types';

export interface ICreateTimestamp {
  created_at: number;
  updated_at: number;
}

export interface IUpdateTimestamp {
  updated_at: ICreateTimestamp['updated_at'];
}

export interface ISoftTimestampResource extends ICreateTimestamp {
  deleted_at: Nullable<number>;
}

export type ITimestampResourceObject = ICreateTimestamp;

export type OmitTimestampResourceObject<T extends ITimestampResourceObject> =
  Omit<T, 'created_at' | 'updated_at'>;
