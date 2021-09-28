import {INCLUDE_OPTIONS} from "@constants";

export const Include = (name: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(INCLUDE_OPTIONS, name, target);
  };
};
