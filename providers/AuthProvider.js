"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
});

export const AuthProvider = ({ children }) => {
  const supabase = createBrowserSupabaseClient();

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 전체 로딩 관리

  // 최초 세션 정보 가져오기
  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Failed to get session:", error);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(_event);
      console.log(session);
      setSession(session);
      setUser(session?.user ?? null);
      setProfile(null); // 유저 바뀌면 프로필 초기화
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 프로필 가져오기 (user가 있을 때만, 중복 방지)
  useEffect(() => {
    if (!user || profile) {
      setIsLoading(false); // user가 없거나 profile 이미 있음
      return;
    }

    console.log(user.id);
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("uid", user.id)
        .single();

      if (error) {
        console.error("Failed to fetch profile:", error);
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [user, profile, supabase]); // 👈 profile이 없을 때만 실행

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
