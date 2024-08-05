import { useCallback, useSyncExternalStore } from 'react';
import { Core, Setter, Action, ActionFn } from './types';

const createStateStructure = <T>(initialState: T): Core<T> => {
  let internalState: T = initialState;
  const listeners: Set<() => void> = new Set();

  const runListeners = () => {
    for (const listener of listeners) {
      listener();
    }
  };
  
  return ({
    set: (newValueOrAction: Setter<T>) => {
      const newState = newValueOrAction instanceof Function ? newValueOrAction(internalState) : initialState;
      if (internalState !== newState) {
        internalState = newState;
        runListeners();
      }
    },
    get: () => {
      return internalState;
    },
    sub: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
};


export const createState = <T>(initialState: T): Core<T> => {
  return createStateStructure<T>(initialState);
};

export const useExternal = <T>(stateInstance: Core<T>): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const state = useSyncExternalStore(stateInstance.sub, stateInstance.get, stateInstance.get);

  const setter = useCallback((fnOrValue: Setter<T>) => {
    stateInstance.set(fnOrValue)
  }, [stateInstance]);

  return [state, setter as React.Dispatch<React.SetStateAction<T>>];
};

export const useExternalReducer = <T>(reducer: React.Reducer<T, Action>, stateInstance: Core<T>): [T, ActionFn] => {
  const state = useSyncExternalStore(stateInstance.sub, stateInstance.get, stateInstance.get);

  const setter = useCallback((action: Action) => {
    stateInstance.set(currentState => reducer(currentState, action))
  }, [stateInstance, reducer]);

  return [state, setter as React.Dispatch<React.ReducerAction<typeof reducer>>];
};