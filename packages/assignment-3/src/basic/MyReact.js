import { createHooks } from "./hooks";
import { render as updateElement } from "./render";

function MyReact() {
  let root = null;
  let newComponent = null;
  let oldComponent = null;

  const _render = () => {
    resetHookContext();
    updateElement(root, newComponent(), oldComponent);
    oldComponent = newComponent;
  };

  function render($root, rootComponent) {
    root = $root;
    newComponent = rootComponent;
    oldComponent = null;
    _render();
  }

  const {
    useState,
    useMemo,
    resetContext: resetHookContext,
  } = createHooks(_render);

  return { render, useState, useMemo };
}

export default MyReact();
