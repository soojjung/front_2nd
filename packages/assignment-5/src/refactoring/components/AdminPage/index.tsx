import { useState } from "react";
import { Coupon, Product } from "@/types";
import { useProductAccordian, useNewProductForm } from "@/refactoring/hooks";
import NewProductForm from "./NewProductForm";
import ProductItemRow from "./ProductItemRow";
import CouponForm from "./CouponForm";

interface Props {
  products: Product[];
  coupons: Coupon[];
  onProductUpdate: (updatedProduct: Product) => void;
  onProductAdd: (newProduct: Product) => void;
  onCouponAdd: (newCoupon: Coupon) => void;
}

export const AdminPage = ({
  products,
  coupons,
  onProductUpdate,
  onProductAdd,
  onCouponAdd,
}: Props) => {
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const { openProductIds, toggleProductAccordion } = useProductAccordian();
  const {
    newProduct,
    initNewProduct,
    updateNewProduct: onNewProductUpdate,
  } = useNewProductForm();

  const handleAddNewProduct = () => {
    const productWithId = { ...newProduct, id: Date.now().toString() };
    onProductAdd(productWithId);
    initNewProduct();
    setShowNewProductForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">상품 관리</h2>
          <button
            onClick={() => setShowNewProductForm(!showNewProductForm)}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
          >
            {showNewProductForm ? "취소" : "새 상품 추가"}
          </button>
          {showNewProductForm && (
            <NewProductForm
              newProduct={newProduct}
              onChangeProductInput={onNewProductUpdate}
              handleAddNewProduct={handleAddNewProduct}
            />
          )}
          <div className="space-y-2">
            {products.map((product, index) => (
              <ProductItemRow
                key={product.id}
                index={index}
                product={product}
                openProductIds={openProductIds}
                toggleProductAccordion={toggleProductAccordion}
                onProductUpdate={onProductUpdate}
              />
            ))}
          </div>
        </div>

        <CouponForm coupons={coupons} onCouponAdd={onCouponAdd} />
      </div>
    </div>
  );
};
