import { ChangeEvent } from "react";
import { Product } from "@/types";
import { useDiscountForm, useEditingProduct } from "@/refactoring/hooks";
import EditMode from "./EditMode";
import ViewMode from "./ViewMode";

interface Props {
  index: number;
  product: Product;
  openProductIds: Set<string>;
  toggleProductAccordion: (productId: string) => void;
  onProductUpdate: (updatedProduct: Product) => void;
}

const ProductItemRow = ({
  index,
  product,
  openProductIds,
  toggleProductAccordion,
  onProductUpdate,
}: Props) => {
  const {
    newDiscount,
    initDiscount,
    updateDiscount: onDiscountUpdate,
  } = useDiscountForm();
  const {
    editingProduct,
    initProduct,
    editProduct: onProductEdit,
  } = useEditingProduct();

  // 상품의 name, price, stock 업데이트하는 로직
  const handleProductProperty = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name, type } = e.target;
    if (editingProduct && editingProduct.id === product.id) {
      const newValue = type === "number" ? parseInt(value) : value;
      const updatedProduct = { ...editingProduct, [name]: newValue };
      if (name === "stock") {
        onProductUpdate(updatedProduct);
      }
      onProductEdit(updatedProduct);
    }
  };

  const handleAddDiscount = () => {
    if (product && editingProduct) {
      const newProduct = {
        ...product,
        discounts: [...product.discounts, newDiscount],
      };
      onProductUpdate(newProduct);
      onProductEdit(newProduct);
      initDiscount();
    }
  };

  const handleRemoveDiscount = (index: number) => {
    if (product) {
      const newProduct = {
        ...product,
        discounts: product.discounts.filter((_, i) => i !== index),
      };
      onProductUpdate(newProduct);
      onProductEdit(newProduct);
    }
  };

  // 수정 완료 핸들러 함수 추가
  const handleEditComplete = () => {
    if (editingProduct) {
      onProductUpdate(editingProduct);
      initProduct();
    }
  };

  // handleEditProduct 함수 수정
  const handleEditProduct = (product: Product) => {
    onProductEdit({ ...product });
  };

  const editProps = {
    editingProduct,
    newDiscount,
    handleProductProperty,
    handleRemoveDiscount,
    onDiscountUpdate,
    handleAddDiscount,
    handleEditComplete,
  };

  return (
    <div
      data-testid={`product-${index + 1}`}
      className="bg-white p-4 rounded shadow"
    >
      <button
        data-testid="toggle-button"
        onClick={() => toggleProductAccordion(product.id)}
        className="w-full text-left font-semibold"
      >
        {product.name} - {product.price}원 (재고: {product.stock})
      </button>

      {openProductIds.has(product.id) && (
        <div className="mt-2">
          {editingProduct && editingProduct.id === product.id ? (
            <EditMode {...editProps} />
          ) : (
            <ViewMode product={product} handleEditProduct={handleEditProduct} />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductItemRow;
