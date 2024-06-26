export function shallowEquals(target1, target2) {
  if (typeof target1 !== typeof target2) {
    return false;
  }

  // Check if both arguments are arrays
  if (Array.isArray(target1) && Array.isArray(target2)) {
    // Check if arrays have the same length
    if (target1.length !== target2.length) {
      return false;
    }

    // Check if all elements in both arrays are equal
    for (let i = 0; i < target1.length; i++) {
      if (target1[i] !== target2[i]) {
        return false;
      }
    }
    return true;
  }

  // Check if both arguments are objects and not null
  if (
    typeof target1 === "object" &&
    target1 !== null &&
    typeof target2 === "object" &&
    target2 !== null
  ) {
    // Special handling for boxed primitives
    if (
      (target1 instanceof String && target2 instanceof String) ||
      (target1 instanceof Number && target2 instanceof Number) ||
      (target1 instanceof Boolean && target2 instanceof Boolean)
    ) {
      return false;
    }

    // Check if the objects have the same prototype
    if (Object.getPrototypeOf(target1) !== Object.getPrototypeOf(target2)) {
      return false;
    }

    // Check if objects have the same number of keys
    const keys1 = Object.keys(target1);
    const keys2 = Object.keys(target2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    // Check if all keys and their values are equal
    for (let key of keys1) {
      if (target1[key] !== target2[key]) {
        return false;
      }
    }

    return true;
  }

  return target1 === target2;
}

export function deepEquals(target1, target2) {
  if (typeof target1 !== typeof target2) {
    return false;
  }

  // Check if both arguments are arrays
  if (Array.isArray(target1) && Array.isArray(target2)) {
    // Check if arrays have the same length
    if (target1.length !== target2.length) {
      return false;
    }

    // Check if all elements in both arrays are strictly equal
    for (let i = 0; i < target1.length; i++) {
      if (
        typeof target1[i] === "object" &&
        target1[i] !== null &&
        typeof target2[i] === "object" &&
        target2[i] !== null
      ) {
        if (!deepEquals(target1[i], target2[i])) {
          return false;
        }
      } else if (target1[i] !== target2[i]) {
        return false;
      }
    }

    return true;
  }

  // Check if both arguments are objects and not null
  if (
    typeof target1 === "object" &&
    target1 !== null &&
    typeof target2 === "object" &&
    target2 !== null
  ) {
    // Special handling for boxed primitives
    if (
      (target1 instanceof String && target2 instanceof String) ||
      (target1 instanceof Number && target2 instanceof Number) ||
      (target1 instanceof Boolean && target2 instanceof Boolean)
    ) {
      return false;
    }

    // Check if the objects have the same prototype
    if (Object.getPrototypeOf(target1) !== Object.getPrototypeOf(target2)) {
      return false;
    }

    // Check if objects have the same number of keys
    const keys1 = Object.keys(target1);
    const keys2 = Object.keys(target2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    // Check if all keys and their values are strictly equal
    for (let key of keys1) {
      if (
        typeof target1[key] === "object" &&
        target1[key] !== null &&
        typeof target2[key] === "object" &&
        target2[key] !== null
      ) {
        if (!deepEquals(target1[key], target2[key])) {
          return false;
        }
      } else if (target1[key] !== target2[key]) {
        return false;
      }
    }

    return true;
  }

  return target1 === target2;
}

export function createNumber1(n) {
  return new Number(n);
}

export function createNumber2(n) {
  return new String(n);
}

export function createNumber3(value) {
  return {
    value,
    valueOf() {
      return this.value;
    },
    toString() {
      return String(this.value);
    },
    toJSON() {
      return `this is createNumber3 => ${this.value}`;
    },
  };
}

export class CustomNumber {
  static instanceMap = new Map();

  constructor(value) {
    this.value = value;

    if (CustomNumber.instanceMap.has(value)) {
      return CustomNumber.instanceMap.get(value);
    }
    CustomNumber.instanceMap.set(value, this);
  }

  valueOf() {
    return this.value;
  }

  toString() {
    return `${this.value}`;
  }

  toJSON() {
    return `${this.value}`;
  }
}

export function createUnenumerableObject(target) {
  let newObj = {};
  for (let key in target) {
    Object.defineProperty(newObj, key, {
      value: target[key],
      enumerable: false,
    });
  }
  return newObj;
}

export function forEach(target, callback) {
  if (target instanceof NodeList) {
    for (let i = 0; i < target.length; i++) {
      callback(target[i], i);
    }
  } else if (Array.isArray(target)) {
    target.map(callback);
  } else if (typeof target === "object" && target !== null) {
    const keys = Object.getOwnPropertyNames(target);
    for (let key of keys) {
      callback(target[key], key);
    }
  }
}

export function map(target, callback) {
  if (target instanceof NodeList) {
    let arr = [];
    for (let i = 0; i < target.length; i++) {
      arr.push(callback(target[i]));
    }
    return arr;
  } else if (Array.isArray(target)) {
    return target.map(callback);
  } else if (typeof target === "object" && target !== null) {
    let obj = {};
    const keys = Object.getOwnPropertyNames(target);
    for (let key of keys) {
      obj[key] = callback(target[key]);
    }
    return obj;
  }
}

export function filter(target, callback) {
  if (target instanceof NodeList) {
    let arr = [];
    for (let i = 0; i < target.length; i++) {
      if (callback(target[i])) {
        arr.push(target[i]);
      }
    }
    return arr;
  } else if (Array.isArray(target)) {
    return target.filter(callback);
  } else if (typeof target === "object" && target !== null) {
    let obj = {};
    const keys = Object.getOwnPropertyNames(target);
    for (let key of keys) {
      if (callback(target[key])) {
        obj[key] = target[key];
      }
    }
    return obj;
  }
}

export function every(target, callback) {
  if (target instanceof NodeList) {
    for (let i = 0; i < target.length; i++) {
      if (!callback(target[i])) {
        return false;
      }
    }
    return true;
  } else if (Array.isArray(target)) {
    return target.every(callback);
  } else if (typeof target === "object" && target !== null) {
    const keys = Object.getOwnPropertyNames(target);
    for (let key of keys) {
      if (!callback(target[key])) {
        return false;
      }
    }
    return true;
  }
}

export function some(target, callback) {
  if (target instanceof NodeList) {
    for (let i = 0; i < target.length; i++) {
      if (callback(target[i])) {
        return true;
      }
    }
    return false;
  } else if (Array.isArray(target)) {
    return target.some(callback);
  } else if (typeof target === "object" && target !== null) {
    const keys = Object.getOwnPropertyNames(target);
    for (let key of keys) {
      if (callback(target[key])) {
        return true;
      }
    }
    return false;
  }
}
