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
        onClick={() =>
          router.push("/admin/commercials/edit/multiple/main_premium")
        }
        fullWidth
      >
        메인 프리미엄
      </Button>
      <Button
        variant="contained"
        onClick={() => router.push("/admin/commercials/edit/main_a")}
        fullWidth
        className="mt-3"
      >
        메인 A
      </Button>
      <Button
        variant="contained"
        onClick={() => router.push("/admin/commercials/edit/main_b")}
        fullWidth
        className="mt-3"
      >
        메인 B
      </Button>
      <Button
        variant="contained"
        onClick={() => router.push("/admin/commercials/edit/main_c")}
        fullWidth
        className="mt-3"
      >
        메인 C
      </Button>
    </div>
  );
};

export default Main;
