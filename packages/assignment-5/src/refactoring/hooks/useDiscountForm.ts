import { useState, ChangeEvent } from "react";
import { Discount } from "@/types";

const DEFAULT_NEW_DISCOUNT = Object.freeze({
  quantity: 0,
  rate: 0,
});

export const useDiscountForm = () => {
  const [newDiscount, setNewDiscount] =
    useState<Discount>(DEFAULT_NEW_DISCOUNT);

  const initDiscount = () => {
    setNewDiscount(DEFAULT_NEW_DISCOUNT);
  };

  const updateDiscount = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDiscount({
      ...newDiscount,
      [name]: name === "rate" ? parseInt(value) / 100 : parseInt(value),
    });
  };

  return {
    newDiscount,
    initDiscount,
    updateDiscount,
  };
};
