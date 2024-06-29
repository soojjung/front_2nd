import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { deepEquals } from "../basic/basic";

export const memo1 = (() => {
  let res;
  return (fn) => {
    if (res) {
      return res;
    }
    res = fn();
    return res;
  };
})();

export const memo2 = (() => {
  let res;
  let n;
  return (fn, [a]) => {
    if (res && n === a) {
      return res;
    }
    res = fn();
    n = a;
    return res;
  };
})();

export const useCustomState = (initValue) => {
  const [state, setState] = useState(initValue);

  const newSetState = (newValue) => {
    if (!deepEquals(state, newValue)) {
      setState(newValue);
    }
  };

  return [state, newSetState];
};

const textContextDefaultValue = {
  user: null,
  todoItems: [],
  count: 0,
};

export const TestContext = createContext({
  value: textContextDefaultValue,
  setValue: () => null,
});

export const TestContextProvider = ({ children }) => {
  const ref = useRef(textContextDefaultValue);
  const setValue = useCallback(
    (key, newValue) => {
      ref.current = { ...ref.current, [key]: newValue };
    },
    [ref]
  );

  return (
    <TestContext.Provider value={{ value: ref.current, setValue }}>
      {children}
    </TestContext.Provider>
  );
};

const useTestContext = (key) => {
  const { value, setValue } = useContext(TestContext);
  const [state, setState] = useState(value[key]);

  useEffect(() => {
    setValue(key, state);
  }, [state]);

  return [state, setState];
};

export const useUser = () => {
  return useTestContext("user");
};

export const useCounter = () => {
  return useTestContext("count");
};

export const useTodoItems = () => {
  return useTestContext("todoItems");
};
