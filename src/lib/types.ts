export type Setter<T> = T | ((currentState: T) => T);
export type Core<T> = {
  set: (newValueOrAction: Setter<T>) => void;
  get: () => T;
  sub: (listener: () => void) => () => void;
};

export type Action = { type: string };
export type ActionFn = (action: Action) => void;