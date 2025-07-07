"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Collapse,
} from "@mui/material";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Image from "next/image";

export default function Login() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleError = (message) => {
    setError(message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = form;

    if (!email || !password) {
      handleError("이메일와 비밀번호를 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        switch (error.message) {
          case "Invalid login credentials":
            handleError("이메일 또는 비밀번호가 일치하지 않습니다.");
            break;
          case "Email not confirmed":
            handleError("이메일 인증이 완료되지 않았습니다.");
            break;
          default:
            handleError("로그인 중 오류가 발생했습니다: " + error.message);
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      handleError(
        "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-[100vw] h-[100dvh] md:bg-[rgb(240,240,240)] ">
      <div className="max-w-md p-6 md:shadow-2xl rounded bg-white w-full">
        <div className="flex justify-center items-center mb-7">
          <div className="w-[50%] aspect-[5/2] relative">
            <Image src="/images/logo.png" alt="대생체 로고" fill />
          </div>
        </div>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          관리자 로그인
        </Typography>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>
            {error}
          </Alert>
        </Collapse>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="이메일"
            name="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            size="small"
          />

          <TextField
            fullWidth
            size="small"
            label="비밀번호"
            name="password"
            type={passwordVisible ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            margin="dense"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    edge="end"
                  >
                    {passwordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* <div className="flex justify-end">
            <Button variant="text" onClick={() => router.push("/auth/find-pw")}>
              비밀번호 찾기
            </Button>
          </div> */}
          <Button
            variant="contained"
            fullWidth
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* <Button
          variant="outlined"
          fullWidth
          onClick={() => router.push("/auth/sign-in")}
          className="mt-3"
        >
          회원가입
        </Button> */}
      </div>
    </div>
  );
}
