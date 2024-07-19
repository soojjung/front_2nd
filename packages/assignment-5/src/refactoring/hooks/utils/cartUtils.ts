import { CartItem, Coupon } from "@/types";

export const calculateItemTotal = (item: CartItem) => {
  const {
    product: { price },
    quantity,
  } = item;

  const afterDiscount = price * quantity * (1 - getMaxApplicableDiscount(item));
  return afterDiscount;
};

export const getMaxApplicableDiscount = (item: CartItem) => {
  // 적용 가능한 가장 높은 할인율
  const {
    product: { discounts },
    quantity,
  } = item;

  const discountRate = discounts.reduce((maxDiscount, discount) => {
    return quantity >= discount.quantity && discount.rate > maxDiscount
      ? discount.rate
      : maxDiscount;
  }, 0);

  return discountRate;
};

export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
) => {
  let totalBeforeDiscount = 0;
  let totalAfterDiscount = 0;

  cart.forEach((item) => {
    const {
      product: { price },
      quantity,
    } = item;

    totalBeforeDiscount += price * quantity;
    totalAfterDiscount += calculateItemTotal(item);
  });

  // 쿠폰 적용
  if (selectedCoupon) {
    totalAfterDiscount = applyCoupon(selectedCoupon, totalAfterDiscount);
  }

  const totalDiscount = totalBeforeDiscount - totalAfterDiscount;

  return {
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    totalAfterDiscount: Math.round(totalAfterDiscount),
    totalDiscount: Math.round(totalDiscount),
  };
};

const applyCoupon = (selectedCoupon: Coupon, totalAfterDiscount: number) => {
  const { discountType, discountValue } = selectedCoupon;
  let totalAfterCoupon = totalAfterDiscount;

  if (discountType === "amount") {
    totalAfterCoupon = Math.max(0, totalAfterCoupon - discountValue);
  }
  if (discountType === "percentage") {
    totalAfterCoupon *= 1 - discountValue / 100;
  }

  return totalAfterCoupon;
};

export const updateCartItemQuantity = (
  cart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] => {
  return cart
    .map((item) => {
      if (item.product.id === productId) {
        const maxQuantity = item.product.stock;
        const updatedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));
        return updatedQuantity > 0
          ? { ...item, quantity: updatedQuantity }
          : null;
      }
      return item;
    })
    .filter((item): item is CartItem => item !== null); // type guard
};
