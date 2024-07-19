import { Coupon } from "@/types.ts";
import { useCouponForm } from "@/refactoring/hooks/useCouponForm.ts";
import CurrentCoupon from "./CurrentCoupon";

interface Props {
  coupons: Coupon[];
  onCouponAdd: (newCoupon: Coupon) => void;
}

const CouponForm = ({ coupons, onCouponAdd }: Props) => {
  const {
    newCoupon,
    updateNewCoupon: onNewCouponUpdate,
    initNewCoupon,
  } = useCouponForm();

  const handleAddCoupon = () => {
    onCouponAdd(newCoupon);
    initNewCoupon();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">쿠폰 관리</h2>
      <div className="bg-white p-4 rounded shadow">
        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="쿠폰 이름"
            name="name"
            value={newCoupon.name}
            onChange={(e) => onNewCouponUpdate(e)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="쿠폰 코드"
            name="code"
            value={newCoupon.code}
            onChange={(e) => onNewCouponUpdate(e)}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <select
              name="discountType"
              value={newCoupon.discountType}
              onChange={(e) => onNewCouponUpdate(e)}
              className="w-full p-2 border rounded"
            >
              <option value="amount">금액(원)</option>
              <option value="percentage">할인율(%)</option>
            </select>
            <input
              type="number"
              placeholder="할인 값"
              name="discountValue"
              value={newCoupon.discountValue}
              onChange={(e) => onNewCouponUpdate(e)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleAddCoupon}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            쿠폰 추가
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">현재 쿠폰 목록</h3>
          <div className="space-y-2">
            {coupons.map((coupon, index) => (
              <CurrentCoupon key={index} coupon={coupon} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponForm;
