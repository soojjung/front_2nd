import { useState } from "react";
import { Product } from "@/types";

export const useEditingProduct = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const initProduct = () => {
    setEditingProduct(null);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
  };

  return { editingProduct, initProduct, editProduct };
};
