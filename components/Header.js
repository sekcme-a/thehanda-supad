"use client";

import { usePathname } from "next/navigation";
import AvatarWithMenu from "./AvatarWithMenu";
import NavBar from "./NavBar";
import { useMemo } from "react";
import { MENU } from "@/data/navbar";
import { useState } from "react";
import { useEffect } from "react";

// 메뉴에서 현재 경로에 해당하는 제목 찾기
function findMenuTitle(menuList, pathname) {
  const cleanPath = pathname.replace(/^\/admin/, ""); // /admin 제거
  let exactMatch = null;
  let partialMatch = null;

  if (pathname.includes("/post/")) return "게시글 편집";

  for (const item of menuList) {
    if (item.link && item.link === cleanPath) {
      exactMatch = item.text;
    } else if (item.link && cleanPath.startsWith(item.link)) {
      partialMatch = item.text;
    }

    if (item.items) {
      const nestedMatch = findMenuTitle(item.items, pathname);
      if (nestedMatch) return nestedMatch;
    }
  }

  return exactMatch || partialMatch;
}

const Header = () => {
  const [title, setTitle] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    console.log(pathname);
    const foundTitle = findMenuTitle(MENU, pathname) ?? "";
    setTitle(foundTitle);
  }, [pathname]);

  return (
    <div
      className="
        flex justify-between items-center
        flex-1 h-14 
        border-b border-gray-300
        bg-white
        px-2
      "
    >
      <div className="flex items-center">
        <div className="block md:hidden">
          <NavBar />
        </div>
        <h1 className="ml-6 font-bold text-lg">{title}</h1>
      </div>

      <AvatarWithMenu />
    </div>
  );
};

export default Header;
