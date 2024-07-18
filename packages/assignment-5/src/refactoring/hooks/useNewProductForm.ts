import { useState, ChangeEvent } from "react";
import { Product } from "@/types";

const DEFAULT_NEW_PRODUCT = Object.freeze({
  name: "",
  price: 0,
  stock: 0,
  discounts: [],
});

export const useNewProductForm = () => {
  const [newProduct, setNewProduct] =
    useState<Omit<Product, "id">>(DEFAULT_NEW_PRODUCT);

  const initNewProduct = () => {
    setNewProduct(DEFAULT_NEW_PRODUCT);
  };

  const updateNewProduct = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: type === "number" ? parseInt(value) : value,
    });
  };

  return {
    newProduct,
    initNewProduct,
    updateNewProduct,
  };
};
