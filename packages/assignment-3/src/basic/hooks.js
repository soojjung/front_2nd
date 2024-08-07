export function createHooks(callback) {
  const states = [];
  let stateIndex = 0; // useState가 사용되는 횟수

  const memos = [];
  let memoIndex = 0;

  // useState는 새로운 state를 만들고 setState는 기존 state를 변경한다.
  const useState = (initState) => {
    const currentIndex = stateIndex;

    // 방법1
    if (states[stateIndex] === undefined) {
      states[stateIndex] = initState;
    }
    // 방법2 - 조건 추가해야 불필요한 states가 계속 늘어나는걸 방지한다.
    //  if (states.length === stateIndex) {
    //   states.push(initState);
    // }

    const state = states[currentIndex];

    const setState = (newValue) => {
      if (!shallowEquals(states[currentIndex], newValue)) {
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

export function shallowEquals(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}
