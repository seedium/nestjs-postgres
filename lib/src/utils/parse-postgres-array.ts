export const parsePostgresArray = <T>(
  transformCb: (value: unknown) => T = (value) => value as T,
): ((str: string) => T[]) => {
  return (str: string): T[] => {
    const match = str.match(/[\w.-]+/g);
    if (!match) {
      return [];
    }
    return match.map(transformCb);
  };
};
