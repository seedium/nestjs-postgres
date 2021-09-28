import { DateTime } from 'luxon';

export const now = (): number => {
  return Math.trunc(DateTime.utc().toSeconds());
};

export const fromTimestamp = (time: number): DateTime => {
  return DateTime.fromSeconds(time);
};

export const toTimestamp = (time: DateTime): number => {
  return time.toSeconds();
};
