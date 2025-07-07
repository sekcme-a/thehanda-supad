"use client";

import {
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Collapse,
} from "@mui/material";
import { useRouter } from "next/navigation";

const Main = () => {
  const router = useRouter();

  return (
    <div className="p-4 ">
      <Button
        variant="contained"
        onClick={() => router.push("/admin/commercials/edit/profile_main")}
        fullWidth
      >
        프로필 메인 광고
      </Button>
      <Button
        variant="contained"
        onClick={() => router.push("/admin/commercials/edit/profile_mypage")}
        fullWidth
        className="mt-3"
      >
        마이페이지 광고
      </Button>
    </div>
  );
};

export default Main;
