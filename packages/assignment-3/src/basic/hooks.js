export function createHooks(callback) {
  const states = [];
  let stateIndex = 0; // useState가 사용되는 횟수

  const memos = [];
  let memoIndex = 0;

  // useState는 새로운 state를 만들고 setState는 기존 state를 변경한다.
  const useState = (initState) => {
    const currentIndex = stateIndex;
    if (states.length === stateIndex) {
      // 조건 추가하여 불필요한 states가 계속 늘어나는걸 방지
      states.push(initState);
    }

    const state = states[currentIndex];

    const setState = (newValue) => {
      if (!deepEquals(states[currentIndex], newValue)) {
        states[currentIndex] = newValue;

        if (!!callback && typeof callback === "function") {
          callback(); // setState를 실행하면 render가 실행된다.
        }
      }
    };

    stateIndex += 1;
    return [state, setState];
  };

  const useMemo = (fn, refs) => {
    const currentIndex = memoIndex;
    if (!memos[currentIndex] || !deepEquals(memos[currentIndex].deps, refs)) {
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

function deepEquals(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null)
    return false;
  const keysA = Object.keys(a),
    keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEquals(a[key], b[key])) return false;
  }
  return true;
}
