// 상품 목록
export const PRODUCTS = [
  { id: 'p1', name: '상품1', price: 10000 },
  { id: 'p2', name: '상품2', price: 20000 },
  { id: 'p3', name: '상품3', price: 30000 },
];

export const DISCOUNT_CONFIG = {
  DISCOUNT_BY_PRODUCT_ID: {
    p1: 0.1,
    p2: 0.15,
    p3: 0.2,
  },
  MINIMUM_COUNT: {
    PER_PRODUCT: 10,
    TOTAL_PRODUCT: 30,
  },
  TOTAL_DISCOUNT_RATE: 0.25,
};

export const INITIAL_COUNT = 1;
