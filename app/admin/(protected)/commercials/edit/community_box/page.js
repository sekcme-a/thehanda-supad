"use client";

import EditableBlocks from "@/components/EditableBlocks";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

const CommunityBox = () => {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const { data } = await supabase
      .from("commercials")
      .select("data")
      .eq("type", "community_line")
      .maybeSingle();

    setData(data ?? {});
  };

  if (data === null) {
    return (
      <div className="flex justify-center mt-10">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-5">
      <EditableBlocks
        label="community_box"
        bucket="images"
        path={`admin/commercials/community_box`}
        table="commercials"
        typeKey="community_box"
        formFields={[
          {
            name: "type",
            label: `타입("이미지" 혹은 "텍스트")`,
            type: "text",
            required: true,
          },
          { name: "title", label: "제목", type: "text" },
          {
            name: "thumbnail_image",
            label: "썸네일 이미지",
            type: "image",
          },
          {
            name: "link",
            label:
              "바로 링크(배너 클릭 시 별도 페이지가 아닌 url로 이동할 경우)",
            type: "text",
          },
          {
            name: "category",
            label: "카테고리(이벤트, AD 등)",
            type: "text",
            required: true,
          },
          { name: "text", label: "내용", type: "text", multiline: true },
          {
            name: "images",
            label: "이미지 업로드",
            type: "image",
            maxMB: 5,
          },
          { name: "button1_title", label: "버튼1 제목", type: "text" },
          { name: "button1_link", label: "버튼1 링크", type: "text" },
          { name: "button2_title", label: "버튼2 제목", type: "text" },
          { name: "button2_link", label: "버튼2 링크", type: "text" },
        ]}
      />
    </div>
  );
};

export default CommunityBox;
