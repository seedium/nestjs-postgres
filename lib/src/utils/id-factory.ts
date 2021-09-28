import * as crypto from 'crypto';

const ALPHA_NUM =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class IdFactory {
  private readonly _len = 16;
  private readonly _separator = '_';

  public get defaultRandomLength(): number {
    return this._len;
  }

  constructor(private readonly _prefix: string) {}
  public generate(): string {
    return this._prefix + this._separator + this.newId();
  }
  private newId() {
    const value = new Array(this._len);
    for (let i = 0; i < this._len; i++) {
      value[i] = ALPHA_NUM[this.randomInteger(ALPHA_NUM.length)];
    }
    return value.join('');
  }
  private randomInteger(maximum: number): number {
    return crypto.randomInt(maximum);
  }
}
