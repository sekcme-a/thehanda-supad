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
        onClick={() => router.push("/admin/commercials/edit/community_line")}
        fullWidth
      >
        줄 광고
      </Button>
      <Button
        variant="contained"
        onClick={() => router.push("/admin/commercials/edit/community_box")}
        fullWidth
        className="mt-3"
      >
        게시물 사이 광고
      </Button>
    </div>
  );
};

export default Main;
