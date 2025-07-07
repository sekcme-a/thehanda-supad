"use client";

import EditableBlocks from "@/components/EditableBlocks";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

const Edit = () => {
  const { type } = useParams();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (type) fetchData();
  }, [type]);
  const fetchData = async () => {
    const { data } = await supabase
      .from("commercials")
      .select("data")
      .eq("type", type)
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
        label={type}
        bucket="images"
        path={`admin/commercials/${type}`}
        table="commercials"
        typeKey={type}
        formFields={[
          { name: "link", label: "링크", type: "text" },
          { name: "width", label: "가로", type: "text" },
          { name: "height", label: "세로", type: "text" },
          {
            name: "images",
            label: "이미지 업로드",
            type: "image",
            maxMB: 5,
            required: true,
          },
        ]}
      />
    </div>
  );
};

export default Edit;
