import { Coupon } from "@/types.ts";

interface Props {
  coupon: Coupon;
  index: number;
}

const CurrentCoupon = ({ coupon, index }: Props) => {
  const { name, code, discountType, discountValue } = coupon;

  return (
    <div
      key={index}
      data-testid={`coupon-${index + 1}`}
      className="bg-gray-100 p-2 rounded"
    >
      {name} ({code}):
      {discountType === "amount"
        ? `${discountValue}원`
        : `${discountValue}%`}{" "}
      할인
    </div>
  );
};

export default CurrentCoupon;
