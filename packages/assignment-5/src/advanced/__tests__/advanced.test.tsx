import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { CartItem, Coupon, Product } from "@/types";
import {
  calculateItemTotal,
  getMaxApplicableDiscount,
  calculateCartTotal,
  updateCartItemQuantity,
} from "@/refactoring/hooks/utils/cartUtils";

import { CartPage } from "@/refactoring/components/CartPage";
import { AdminPage } from "@/refactoring/components/AdminPage";
import CurrentCoupon from "@/refactoring/components/AdminPage/CouponForm/CurrentCoupon";
import NewProductForm from "@/refactoring/components/AdminPage/NewProductForm";
import EditMode from "@/refactoring/components/AdminPage/ProductItemRow/EditMode";
import ViewMode from "@/refactoring/components/AdminPage/ProductItemRow/ViewMode";

const mockProducts: Product[] = [
  {
    id: "p1",
    name: "상품1",
    price: 10000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.1 }],
  },
  {
    id: "p2",
    name: "상품2",
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }],
  },
  {
    id: "p3",
    name: "상품3",
    price: 30000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.2 }],
  },
];

const mockCoupons: Coupon[] = [
  {
    name: "5000원 할인 쿠폰",
    code: "AMOUNT5000",
    discountType: "amount",
    discountValue: 5000,
  },
  {
    name: "10% 할인 쿠폰",
    code: "PERCENT10",
    discountType: "percentage",
    discountValue: 10,
  },
];

const TestAdminPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleProductAdd = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const handleCouponAdd = (newCoupon: Coupon) => {
    setCoupons((prevCoupons) => [...prevCoupons, newCoupon]);
  };

  return (
    <AdminPage
      products={products}
      coupons={coupons}
      onProductUpdate={handleProductUpdate}
      onProductAdd={handleProductAdd}
      onCouponAdd={handleCouponAdd}
    />
  );
};

describe("advanced > ", () => {
  describe("시나리오 테스트 > ", () => {
    test("장바구니 페이지 테스트 > ", async () => {
      render(<CartPage products={mockProducts} coupons={mockCoupons} />);
      const product1 = screen.getByTestId("product-p1");
      const product2 = screen.getByTestId("product-p2");
      const product3 = screen.getByTestId("product-p3");
      const addToCartButtonsAtProduct1 =
        within(product1).getByText("장바구니에 추가");
      const addToCartButtonsAtProduct2 =
        within(product2).getByText("장바구니에 추가");
      const addToCartButtonsAtProduct3 =
        within(product3).getByText("장바구니에 추가");

      // 1. 상품 정보 표시
      expect(product1).toHaveTextContent("상품1");
      expect(product1).toHaveTextContent("10,000원");
      expect(product1).toHaveTextContent("재고: 20개");
      expect(product2).toHaveTextContent("상품2");
      expect(product2).toHaveTextContent("20,000원");
      expect(product2).toHaveTextContent("재고: 20개");
      expect(product3).toHaveTextContent("상품3");
      expect(product3).toHaveTextContent("30,000원");
      expect(product3).toHaveTextContent("재고: 20개");

      // 2. 할인 정보 표시
      expect(screen.getByText("10개 이상: 10% 할인")).toBeInTheDocument();

      // 3. 상품1 장바구니에 상품 추가
      fireEvent.click(addToCartButtonsAtProduct1); // 상품1 추가

      // 4. 할인율 계산
      expect(screen.getByText("상품 금액: 10,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 0원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 10,000원")).toBeInTheDocument();

      // 5. 상품 품절 상태로 만들기
      for (let i = 0; i < 19; i++) {
        fireEvent.click(addToCartButtonsAtProduct1);
      }

      // 6. 품절일 때 상품 추가 안 되는지 확인하기
      expect(product1).toHaveTextContent("재고: 0개");
      fireEvent.click(addToCartButtonsAtProduct1);
      expect(product1).toHaveTextContent("재고: 0개");

      // 7. 할인율 계산
      expect(screen.getByText("상품 금액: 200,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 20,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 180,000원")).toBeInTheDocument();

      // 8. 상품을 각각 10개씩 추가하기
      fireEvent.click(addToCartButtonsAtProduct2); // 상품2 추가
      fireEvent.click(addToCartButtonsAtProduct3); // 상품3 추가

      const increaseButtons = screen.getAllByText("+");
      for (let i = 0; i < 9; i++) {
        fireEvent.click(increaseButtons[1]); // 상품2
        fireEvent.click(increaseButtons[2]); // 상품3
      }

      // 9. 할인율 계산
      expect(screen.getByText("상품 금액: 700,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 110,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 590,000원")).toBeInTheDocument();

      // 10. 쿠폰 적용하기
      const couponSelect = screen.getByRole("combobox");
      fireEvent.change(couponSelect, { target: { value: "1" } }); // 10% 할인 쿠폰 선택

      // 11. 할인율 계산
      expect(screen.getByText("상품 금액: 700,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 169,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 531,000원")).toBeInTheDocument();

      // 12. 다른 할인 쿠폰 적용하기
      fireEvent.change(couponSelect, { target: { value: "0" } }); // 5000원 할인 쿠폰
      expect(screen.getByText("상품 금액: 700,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 115,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 585,000원")).toBeInTheDocument();
    });

    test("관리자 페이지 테스트 > ", async () => {
      render(<TestAdminPage />);

      const $product1 = screen.getByTestId("product-1");

      // 1. 새로운 상품 추가
      fireEvent.click(screen.getByText("새 상품 추가"));

      fireEvent.change(screen.getByLabelText("상품명"), {
        target: { value: "상품4" },
      });
      fireEvent.change(screen.getByLabelText("가격"), {
        target: { value: "15000" },
      });
      fireEvent.change(screen.getByLabelText("재고"), {
        target: { value: "30" },
      });

      fireEvent.click(screen.getByText("추가"));

      const $product4 = screen.getByTestId("product-4");

      expect($product4).toHaveTextContent("상품4");
      expect($product4).toHaveTextContent("15000원");
      expect($product4).toHaveTextContent("재고: 30");

      // 2. 상품 선택 및 수정
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId("toggle-button"));
      fireEvent.click(within($product1).getByTestId("modify-button"));

      act(() => {
        fireEvent.change(within($product1).getByDisplayValue("20"), {
          target: { value: "25" },
        });
        fireEvent.change(within($product1).getByDisplayValue("10000"), {
          target: { value: "12000" },
        });
        fireEvent.change(within($product1).getByDisplayValue("상품1"), {
          target: { value: "수정된 상품1" },
        });
      });

      fireEvent.click(within($product1).getByText("수정 완료"));

      expect($product1).toHaveTextContent("수정된 상품1");
      expect($product1).toHaveTextContent("12000원");
      expect($product1).toHaveTextContent("재고: 25");

      // 3. 상품 할인율 추가 및 삭제
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId("modify-button"));

      // 할인 추가
      act(() => {
        fireEvent.change(screen.getByPlaceholderText("수량"), {
          target: { value: "5" },
        });
        fireEvent.change(screen.getByPlaceholderText("할인율 (%)"), {
          target: { value: "5" },
        });
      });
      fireEvent.click(screen.getByText("할인 추가"));

      expect(
        screen.queryByText("5개 이상 구매 시 5% 할인")
      ).toBeInTheDocument();

      // 할인 삭제
      fireEvent.click(screen.getAllByText("삭제")[0]);
      expect(
        screen.queryByText("10개 이상 구매 시 10% 할인")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("5개 이상 구매 시 5% 할인")
      ).toBeInTheDocument();

      fireEvent.click(screen.getAllByText("삭제")[0]);
      expect(
        screen.queryByText("10개 이상 구매 시 10% 할인")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("5개 이상 구매 시 5% 할인")
      ).not.toBeInTheDocument();

      // 4. 쿠폰 추가
      fireEvent.change(screen.getByPlaceholderText("쿠폰 이름"), {
        target: { value: "새 쿠폰" },
      });
      fireEvent.change(screen.getByPlaceholderText("쿠폰 코드"), {
        target: { value: "NEW10" },
      });
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "percentage" },
      });
      fireEvent.change(screen.getByPlaceholderText("할인 값"), {
        target: { value: "10" },
      });

      fireEvent.click(screen.getByText("쿠폰 추가"));

      const $newCoupon = screen.getByTestId("coupon-3");

      expect($newCoupon).toHaveTextContent("새 쿠폰 (NEW10):10% 할인");
    });
  });

  /** 추가 작성한 테스트코드 */
  describe("CurrentCoupon", () => {
    const coupon: Coupon = {
      name: "Summer Sale",
      code: "SUMMER2024",
      discountType: "amount",
      discountValue: 5000,
    };

    const renderComponent = (coupon: Coupon, index: number) =>
      render(<CurrentCoupon coupon={coupon} index={index} />);

    test("쿠폰 정보 렌더링 테스트: 쿠폰의 이름과 코드가 올바르게 렌더링되는지 확인", () => {
      renderComponent(coupon, 0);

      const couponElement = screen.getByTestId("coupon-1");
      expect(couponElement).toBeInTheDocument();
      expect(couponElement).toHaveTextContent("Summer Sale (SUMMER2024)");
    });

    test("금액 할인 렌더링 테스트: 금액 할인이 올바르게 표시되는지 확인", () => {
      renderComponent(coupon, 0);

      const couponElement = screen.getByTestId("coupon-1");
      expect(couponElement).toHaveTextContent("5000원 할인");
    });

    test("퍼센트 할인 렌더링 테스트: 퍼센트 할인이 올바르게 표시되는지 확인", () => {
      const percentageCoupon: Coupon = {
        name: "Black Friday",
        code: "BLACKFRIDAY",
        discountType: "percentage",
        discountValue: 20,
      };

      renderComponent(percentageCoupon, 1);

      const couponElement = screen.getByTestId("coupon-2");
      expect(couponElement).toBeInTheDocument();
      expect(couponElement).toHaveTextContent("Black Friday (BLACKFRIDAY)");
      expect(couponElement).toHaveTextContent("20% 할인");
    });
  });

  describe("EditMode Component", () => {
    const editingProductMock = {
      id: "p1",
      name: "Test Product",
      price: 100,
      stock: 10,
      discounts: [
        { quantity: 5, rate: 0.1 },
        { quantity: 10, rate: 0.2 },
      ],
    };

    const newDiscountMock = {
      quantity: 5,
      rate: 0.1,
    };

    const handleProductPropertyMock = vi.fn();
    const handleRemoveDiscountMock = vi.fn();
    const onDiscountUpdateMock = vi.fn();
    const handleAddDiscountMock = vi.fn();
    const handleEditCompleteMock = vi.fn();

    test('버튼 클릭 테스트: "할인 추가" 버튼이 클릭될 때 handleAddDiscount 함수가 호출되는지 확인', () => {
      render(
        <EditMode
          editingProduct={editingProductMock}
          newDiscount={newDiscountMock}
          handleProductProperty={handleProductPropertyMock}
          handleRemoveDiscount={handleRemoveDiscountMock}
          onDiscountUpdate={onDiscountUpdateMock}
          handleAddDiscount={handleAddDiscountMock}
          handleEditComplete={handleEditCompleteMock}
        />
      );

      // Trigger click on the "할인 추가" button
      const addButton = screen.getByText("할인 추가");
      fireEvent.click(addButton);

      // Assert that handleAddDiscount has been called
      expect(handleAddDiscountMock).toHaveBeenCalled();
    });

    // Add more tests as needed for other functionalities like removing discounts, completing edit, etc.
  });

  describe("ViewMode Component", () => {
    const productMock = {
      id: "1",
      name: "Test Product",
      price: 100,
      stock: 10,
      discounts: [
        { quantity: 5, rate: 0.1 },
        { quantity: 10, rate: 0.2 },
      ],
    };

    const handleEditProductMock = vi.fn();

    test("할인 정보 렌더링 테스트: 할인 정보가 올바르게 렌더링되는지 확인", () => {
      render(
        <ViewMode
          product={productMock}
          handleEditProduct={handleEditProductMock}
        />
      );

      const discountElements = screen.getAllByText(/개 이상 구매 시/);
      expect(discountElements).toHaveLength(2); // Assuming there are two discounts in mock data
      expect(screen.getByText("5개 이상 구매 시 10% 할인")).toBeInTheDocument();
      expect(
        screen.getByText("10개 이상 구매 시 20% 할인")
      ).toBeInTheDocument();
    });

    test('버튼 클릭 테스트: "수정" 버튼을 클릭하고, handleEditProduct 함수가 올바르게 호출되는지 확인', () => {
      render(
        <ViewMode
          product={productMock}
          handleEditProduct={handleEditProductMock}
        />
      );

      const modifyButton = screen.getByTestId("modify-button");
      fireEvent.click(modifyButton);

      expect(handleEditProductMock).toHaveBeenCalled();
      expect(handleEditProductMock.mock.calls[0][0]).toEqual(productMock);
    });
  });

  describe("NewProductForm", () => {
    const newProduct = {
      name: "",
      price: 0,
      stock: 0,
      discounts: [{ quantity: 0, rate: 0 }],
    };

    const onChangeProductInput = vi.fn();
    const handleAddNewProduct = vi.fn();

    const renderComponent = () =>
      render(
        <NewProductForm
          newProduct={newProduct}
          onChangeProductInput={onChangeProductInput}
          handleAddNewProduct={handleAddNewProduct}
        />
      );

    test("폼 렌더링 테스트: 모든 입력 필드(상품명, 가격, 재고)와 버튼이 화면에 제대로 렌더링되는지 확인", () => {
      renderComponent();

      expect(screen.getByLabelText(/상품명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/가격/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/재고/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /추가/i })).toBeInTheDocument();
    });

    test("입력 필드 변경 테스트: 입력 필드가 변경될 때 onChangeProductInput 함수가 호출되는지 확인", () => {
      renderComponent();

      const nameInput = screen.getByLabelText(/상품명/i);
      const priceInput = screen.getByLabelText(/가격/i);
      const stockInput = screen.getByLabelText(/재고/i);

      fireEvent.change(nameInput, { target: { value: "New Product" } });
      fireEvent.change(priceInput, { target: { value: 1000 } });
      fireEvent.change(stockInput, { target: { value: 50 } });

      expect(onChangeProductInput).toHaveBeenCalledTimes(3);
    });

    test("버튼 클릭 테스트: '추가' 버튼이 클릭될 때 handleAddNewProduct 함수가 호출되는지 확인", () => {
      renderComponent();

      const addButton = screen.getByRole("button", { name: /추가/i });
      fireEvent.click(addButton);

      expect(handleAddNewProduct).toHaveBeenCalledTimes(1);
    });
  });

  describe("Cart functions", () => {
    const productMock = {
      id: "1",
      name: "테스트 상품",
      price: 100,
      stock: 10,
      discounts: [
        { quantity: 5, rate: 0.1 },
        { quantity: 10, rate: 0.2 },
      ],
    };

    const cartItemMock: CartItem = {
      product: productMock,
      quantity: 5,
    };

    describe("calculateItemTotal", () => {
      test("할인이 없는 경우 총 가격 계산", () => {
        const item = { ...cartItemMock, quantity: 1 };
        const total = calculateItemTotal(item);
        expect(total).toBe(100);
      });

      test("할인이 있는 경우 총 가격 계산", () => {
        const total = calculateItemTotal(cartItemMock);
        expect(total).toBe(450); // 5 * 100 * (1 - 0.1)
      });
    });

    describe("getMaxApplicableDiscount", () => {
      test("적용 가능한 할인이 없는 경우 0 반환", () => {
        const item = { ...cartItemMock, quantity: 1 };
        const discount = getMaxApplicableDiscount(item);
        expect(discount).toBe(0);
      });

      test("적용 가능한 최대 할인율 반환", () => {
        const discount = getMaxApplicableDiscount(cartItemMock);
        expect(discount).toBe(0.1);
      });
    });

    describe("calculateCartTotal", () => {
      const cartMock: CartItem[] = [cartItemMock];
      const amountCoupon: Coupon = {
        name: "금액 쿠폰",
        code: "AMT50",
        discountType: "amount",
        discountValue: 50,
      };
      const percentageCoupon: Coupon = {
        name: "퍼센트 쿠폰",
        code: "PCT10",
        discountType: "percentage",
        discountValue: 10,
      };

      test("쿠폰이 없는 경우 총 가격 계산", () => {
        const total = calculateCartTotal(cartMock, null);
        expect(total.totalBeforeDiscount).toBe(500);
        expect(total.totalAfterDiscount).toBe(450);
        expect(total.totalDiscount).toBe(50);
      });

      test("금액 쿠폰이 적용된 경우 총 가격 계산", () => {
        const total = calculateCartTotal(cartMock, amountCoupon);
        expect(total.totalBeforeDiscount).toBe(500);
        expect(total.totalAfterDiscount).toBe(400);
        expect(total.totalDiscount).toBe(100);
      });

      test("퍼센트 쿠폰이 적용된 경우 총 가격 계산", () => {
        const total = calculateCartTotal(cartMock, percentageCoupon);
        expect(total.totalBeforeDiscount).toBe(500);
        expect(total.totalAfterDiscount).toBe(405); // 450 * 0.9
        expect(total.totalDiscount).toBe(95);
      });
    });

    describe("updateCartItemQuantity", () => {
      const cartMock: CartItem[] = [cartItemMock];

      test("수량이 정상적으로 업데이트되는 경우", () => {
        const updatedCart = updateCartItemQuantity(cartMock, "1", 8);
        expect(updatedCart[0].quantity).toBe(8);
      });

      test("수량이 재고를 초과하는 경우", () => {
        const updatedCart = updateCartItemQuantity(cartMock, "1", 20);
        expect(updatedCart[0].quantity).toBe(10);
      });

      test("수량이 0인 경우 아이템 제거", () => {
        const updatedCart = updateCartItemQuantity(cartMock, "1", 0);
        expect(updatedCart.length).toBe(0);
      });
    });
  });
});
