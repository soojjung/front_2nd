import { shallowEquals } from "../basic/hooks";

export function createHooks(callback) {
  const states = [];
  let stateIndex = 0;
  let rAFId = null;

  const memos = [];
  let memoIndex = 0;

  const useState = (initState) => {
    const currentIndex = stateIndex;

    if (states[stateIndex] === undefined) {
      states[stateIndex] = initState;
    }

    const state = states[currentIndex];

    const setState = async (newValue) => {
      if (!shallowEquals(states[currentIndex], newValue)) {
        states[currentIndex] = newValue;

        // 방법1 - cancelAnimationFrame 사용
        if (rAFId) {
          cancelAnimationFrame(rAFId);
        }

        rAFId = requestAnimationFrame(() => {
          if (typeof callback === "function") {
            callback();
          }
          rAFId = null;
        });

        // 방법2 - Promise 사용
        // if (rAFId === null) {
        //   rAFId = new Promise((resolve) =>
        //     requestAnimationFrame(() => {
        //       if (typeof callback === "function") {
        //         resolve(callback());
        //       }
        //     })
        //   );
        //   await rAFId;
        //   // cancelAnimationFrame(rAFId); // resolve된 후이기 때문에 background task queue에 해당 함수가 제거되어 cancelAnimationFrame을 해줄 필요가 없다.
        //   rAFId = null;
        // }
      }
    };

    stateIndex += 1;
    return [state, setState];
  };

  const useMemo = (fn, refs) => {
    const currentIndex = memoIndex;
    if (
      !memos[currentIndex] ||
      !shallowEquals(memos[currentIndex].deps, refs)
    ) {
      memos[currentIndex] = { value: fn(), deps: refs };
    }

    memoIndex += 1;
    return memos[currentIndex].value;
  };

  const resetContext = () => {
    stateIndex = 0;
    memoIndex = 0;
  };

  return { useState, useMemo, resetContext };
}
