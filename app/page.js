import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Login from "./login";

const LoginPage = async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/admin/home");
  }

  return (
    <>
      <Login />
    </>
  );
};

export default LoginPage;
