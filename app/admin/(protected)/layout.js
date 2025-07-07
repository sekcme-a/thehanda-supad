import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import NavBar from "@/components/NavBar";
import Header from "@/components/Header";
// import NavBar from "./components/NavBar";
// import Header from "./components/Header";

export default async function AdminLayout({ children }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  // 관리자 권한 확인
  const { data: profile, error } = await supabase
    .from("super_admins")
    .select()
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <div className="p-10 text-center text-red-600">
        관리자 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="bg-gray-100 hidden md:block">
        <NavBar />
      </div>
      <div className="flex-1">
        <Header />
        {children}
      </div>
    </div>
  );
}
