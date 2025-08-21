import { useCallback, useState } from "react";

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Custom hook definition
// export function useAwaitableState<T>(
//     initialValue: T
// ): [T, (value: T) => Promise<void>] {
//     const [state, setState] = useState(initialValue);

//     // Function to set the state and return a Promise
//     const setStateAsync = useCallback(
//         (value: T): Promise<void> => {
//             return new Promise((resolve) => {
//                 setState(() => {
//                     resolve();
//                     return value;
//                 });
//             });
//         },
//         [setState]
//     );

//     return [state, setStateAsync];
// }

// export function useAwaitableState<T>(
//     initialValue: T | (() => T)
// ): [T, (value: T | (() => T)) => Promise<void>] {
//     const [state, setState] = useState<T>(initialValue);

//     const setStateAsync = useCallback(
//         (value: T | (() => T)): Promise<void> => {
//             return new Promise((resolve) => {
//                 setState((prevState) => {
//                     const newValue = typeof value === "function" ? (value as () => T)() : value;
//                     resolve(); // Resolve the promise after the state is set
//                     return newValue;
//                 });
//             });
//         },
//         [setState]
//     );

//     return [state, setStateAsync];
// }

export function useAwaitableState<T>(
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => Promise<void>] {
  const [state, setState] = useState<T>(initialValue);

  const setStateAsync = useCallback(
    (value: T | ((prev: T) => T)): Promise<void> => {
      return new Promise((resolve) => {
        setState((prevState) => {
          const newValue =
            typeof value === "function"
              ? (value as (prev: T) => T)(prevState)
              : value;
          resolve(); // Resolve the promise after the state is set
          return newValue;
        });
      });
    },
    [setState]
  );

  return [state, setStateAsync];
}
