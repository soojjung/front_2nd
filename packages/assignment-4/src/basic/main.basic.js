/** 컨벤션
 * - 상수는 대문자로 작성
 * - 변수명 두 단어 이하는 축약어 사용 금지
 * - 배열 타입 변수는 -list로 작성
 * - 함수는 순수함수로 작성 (외부값을 변경하지 않고 새로운 값을 리턴)
 * - 함수는 화살표 함수로 작성 () => {}
 * - 함수 기능별로 나누고, 재사용될 수 있는 함수는 tools로 분리
 * - 상수는 constants로 분리
 */

// 상품 정보 배열
const PRODUCTS = [
  { id: 'p1', name: '상품1', price: 10000 },
  { id: 'p2', name: '상품2', price: 20000 },
  { id: 'p3', name: '상품3', price: 30000 },
];

const DISCOUNT_RATE_BY_PRODUCT = {
  p1: 0.1,
  p2: 0.15,
  p3: 0.2,
};

function main() {
  // DOM 요소 생성 및 초기화
  const app = document.getElementById('app');
  const wrapper = document.createElement('div');
  const box = document.createElement('div');
  const heading = document.createElement('h1');
  const cartItems = document.createElement('div');
  const totalText = document.createElement('div');
  const productSelect = document.createElement('select');
  const addToCartBtn = document.createElement('button');

  // DOM 요소에 ID 및 클래스 할당
  cartItems.id = 'cart-items';
  totalText.id = 'cart-total';
  productSelect.id = 'product-select';
  addToCartBtn.id = 'add-to-cart';
  wrapper.className = 'bg-gray-100 p-8';
  box.className =
    'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  heading.className = 'text-2xl font-bold mb-4';
  totalText.className = 'text-xl font-bold my-4';
  productSelect.className = 'border rounded p-2 mr-2';
  addToCartBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded';

  // 제목 및 버튼 텍스트 설정
  heading.textContent = '장바구니';
  addToCartBtn.textContent = '추가';

  // 상품 선택 옵션 추가
  PRODUCTS.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = product.name + ' - ' + product.price + '원';
    productSelect.appendChild(option);
  });

  // DOM 구조 조립
  box.appendChild(heading);
  box.appendChild(cartItems);
  box.appendChild(totalText);
  box.appendChild(productSelect);
  box.appendChild(addToCartBtn);
  wrapper.appendChild(box);
  app.appendChild(wrapper);

  // 장바구니 업데이트 함수
  function updateCart() {
    const cartItemsList = Array.from(cartItems.children); // NodeList를 배열로 변환

    const { total, totalQuantity, totalBeforeDiscount } = calculateTotalOfCart(
      cartItemsList,
      PRODUCTS,
      DISCOUNT_RATE_BY_PRODUCT,
    );

    // 할인율 계산
    const discountRate = calculateDiscountRate(
      totalQuantity,
      total,
      totalBeforeDiscount,
    );

    // 총액 및 할인 정보 업데이트
    totalText.textContent = '총액: ' + Math.round(total) + '원';
    if (discountRate > 0) {
      const discountSpan = document.createElement('span');
      discountSpan.className = 'text-green-500 ml-2';
      discountSpan.textContent =
        '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)';
      totalText.appendChild(discountSpan);
    }
  }

  // 상품 추가 버튼 클릭 시 동작
  addToCartBtn.onclick = function () {
    const selectedProduct = PRODUCTS.find(product => {
      return product.id === productSelect.value;
    });

    if (selectedProduct) {
      const existingItem = document.getElementById(selectedProduct.id);
      if (existingItem) {
        const currentQuantity =
          parseInt(
            existingItem.querySelector('span').textContent.split('x ')[1],
          ) + 1;
        existingItem.querySelector('span').textContent =
          selectedProduct.name +
          ' - ' +
          selectedProduct.price +
          '원 x ' +
          currentQuantity;
      } else {
        // 새로운 상품 아이템 생성
        const newItem = document.createElement('div');
        const span = document.createElement('span');
        const buttonDiv = document.createElement('div');
        const minusButton = document.createElement('button');
        const plusButton = document.createElement('button');
        const removeButton = document.createElement('button');
        newItem.id = selectedProduct.id;
        newItem.className = 'flex justify-between items-center mb-2';
        span.textContent =
          selectedProduct.name + ' - ' + selectedProduct.price + '원 x 1';
        minusButton.className =
          'quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1';
        minusButton.textContent = '-';
        minusButton.dataset.productId = selectedProduct.id;
        minusButton.dataset.change = '-1';
        plusButton.className =
          'quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1';
        plusButton.textContent = '+';
        plusButton.dataset.productId = selectedProduct.id;
        plusButton.dataset.change = '1';
        removeButton.className =
          'remove-item bg-red-500 text-white px-2 py-1 rounded';
        removeButton.textContent = '삭제';
        removeButton.dataset.productId = selectedProduct.id;
        buttonDiv.appendChild(minusButton);
        buttonDiv.appendChild(plusButton);
        buttonDiv.appendChild(removeButton);
        newItem.appendChild(span);
        newItem.appendChild(buttonDiv);
        cartItems.appendChild(newItem);
      }

      updateCart();
    }
  };

  // 장바구니 아이템 클릭 시 동작
  cartItems.onclick = function (event) {
    const { classList, dataset } = event.target;
    if (
      !classList.contains('quantity-change') &&
      !classList.contains('remove-item')
    ) {
      return;
    }

    const productId = dataset.productId;
    const item = document.getElementById(productId);

    if (classList.contains('quantity-change')) {
      const change = parseInt(dataset.change);
      const currentQuantity =
        parseInt(item.querySelector('span').textContent.split('x ')[1]) +
        change;
      if (currentQuantity > 0) {
        item.querySelector('span').textContent =
          item.querySelector('span').textContent.split('x ')[0] +
          'x ' +
          currentQuantity;
      } else {
        item.remove();
      }
    } else if (classList.contains('remove-item')) {
      item.remove();
    }
    updateCart();
  };
}

main();

const calculateTotalOfCart = (cartItemsList, products, discountRates) => {
  let total = 0; // 총 가격
  let totalQuantity = 0; // 총 수량
  let totalBeforeDiscount = 0; // 할인 적용 전 총 가격

  cartItemsList.forEach(cartItem => {
    const item = products.find(product => {
      return product.id === cartItem.id;
    });
    const quantity = parseInt(
      cartItem.querySelector('span').textContent.split('x ')[1],
    );

    const itemTotal = item.price * quantity;

    totalQuantity += quantity;
    totalBeforeDiscount += itemTotal;

    const discount = quantity >= 10 ? discountRates[item.id] : 0;

    total += itemTotal * (1 - discount);
  });

  return { total, totalQuantity, totalBeforeDiscount };
};

const calculateDiscountRate = (totalQuantity, total, totalBeforeDiscount) => {
  let rate = 0;
  if (totalQuantity >= 30) {
    const bulkDiscount = total * 0.25;
    const individualDiscount = totalBeforeDiscount - total;

    if (bulkDiscount > individualDiscount) {
      total = totalBeforeDiscount * 0.75;
      rate = 0.25;
    } else {
      rate = (totalBeforeDiscount - total) / totalBeforeDiscount;
    }
  } else {
    rate = (totalBeforeDiscount - total) / totalBeforeDiscount;
  }
  return rate;
};
