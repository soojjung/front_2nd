import { ChangeEvent } from "react";
import { Product } from "@/types";

interface Props {
  newProduct: Omit<Product, "id">;
  onChangeProductInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleAddNewProduct: () => void;
}

const NewProductForm = ({
  newProduct,
  onChangeProductInput,
  handleAddNewProduct,
}: Props) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-semibold mb-2">새 상품 추가</h3>
      <div className="mb-2">
        <label
          htmlFor="productName"
          className="block text-sm font-medium text-gray-700"
        >
          상품명
        </label>
        <input
          id="productName"
          type="text"
          name="name"
          value={newProduct.name}
          onChange={(e) => onChangeProductInput(e)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-2">
        <label
          htmlFor="productPrice"
          className="block text-sm font-medium text-gray-700"
        >
          가격
        </label>
        <input
          id="productPrice"
          type="number"
          name="price"
          value={newProduct.price}
          onChange={(e) => onChangeProductInput(e)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-2">
        <label
          htmlFor="productStock"
          className="block text-sm font-medium text-gray-700"
        >
          재고
        </label>
        <input
          id="productStock"
          type="number"
          name="stock"
          value={newProduct.stock}
          onChange={(e) => onChangeProductInput(e)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={handleAddNewProduct}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        추가
      </button>
    </div>
  );
};

export default NewProductForm;
