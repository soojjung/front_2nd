// 레이아웃 구성
export const createLayout = (tagName, attributes = {}, $parent) => {
  const $layout = document.createElement(tagName);
  setAttributes($layout, attributes);
  appendChildElements($parent, $layout);
  return $layout;
};

// 속성 부여 함수
export const setAttributes = (target, attributes) => {
  for (const [key, attribute] of Object.entries(attributes)) {
    if (typeof attribute === 'object') {
      setAttributes(target[key], attribute);
    } else {
      target[key] = attribute;
    }
  }
};

// 자식요소 append
const appendChildElements = (target, ...$child) => {
  return target.append(...$child.flat());
};
