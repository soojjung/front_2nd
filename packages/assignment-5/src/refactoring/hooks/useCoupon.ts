import { Coupon } from "@/types";
import { useState } from "react";

export const useCoupons = (initialCoupons: Coupon[]) => {
  const [coupons, setCoupons] = useState(initialCoupons);

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons((prevCoupons) => [...prevCoupons, newCoupon]);
  };

  return {
    coupons,
    addCoupon,
  };
};
