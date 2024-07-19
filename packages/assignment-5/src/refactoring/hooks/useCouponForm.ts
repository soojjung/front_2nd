import { useState, ChangeEvent } from "react";
import { Coupon } from "@/types";

const DEFAULT_NEW_COUPON = Object.freeze({
  name: "",
  code: "",
  discountType: "percentage",
  discountValue: 0,
});

export const useCouponForm = () => {
  const [newCoupon, setNewCoupon] = useState<Coupon>(DEFAULT_NEW_COUPON);

  const initNewCoupon = () => {
    setNewCoupon(DEFAULT_NEW_COUPON);
  };

  const updateNewCoupon = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Type guard to differentiate between HTMLInputElement and HTMLSelectElement
    if (e.target instanceof HTMLInputElement) {
      setNewCoupon({
        ...newCoupon,
        [name]: type === "number" ? parseInt(value) : value,
      });
    } else if (e.target instanceof HTMLSelectElement) {
      setNewCoupon({
        ...newCoupon,
        [name]: value,
      });
    }
  };

  return {
    newCoupon,
    updateNewCoupon,
    initNewCoupon,
  };
};
