import { Button, TextField } from "@mui/material";
import { useState } from "react";

const AddCoupon = () => {
  const [coupon, setCoupon] = useState({
    code: "",
    points: "",
  });

  const handleChange = (type, e) => {
    setCoupon((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const [saving, setSaving] = useState(false);
  const handleNewCoupon = async () => {
    if (coupon.code === "" || coupon.points === "") {
      alert("모두 입력");
      return;
    }
    setSaving(true);
  };

  return (
    <>
      <TextField
        variant="outlined"
        size="small"
        label="쿠폰 코드"
        value={coupon.code}
        onChange={(e) => handleChange("code", e)}
      />
      <TextField
        variant="outlined"
        className="ml-3"
        size="small"
        label="포인트"
        value={coupon.points}
        onChange={(e) => handleChange("points", e)}
      />
      <Button
        variant="contained"
        onClick={handleNewCoupon}
        disabled={saving}
        className="ml-3"
      >
        쿠폰 생성 +
      </Button>
    </>
  );
};

export default AddCoupon;
