"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  TextField,
  IconButton,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragDropZone from "@/components/DragDropZone";
import { handleStorageFolder } from "@/utils/supabase/handleStorageFolder";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

const EditableBlocks = ({
  label = "블록",
  bucket,
  path,
  table,
  typeKey,
  formFields,
  hideSubmitButton,
  setBlockValue, //부모 컴포넌트에서 block 따로 저장할때
  blockButtons,
  maxBlocksCount,
}) => {
  const [blocks, setBlocks] = useState([{}]);
  const prevImagesRef = useRef([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (setBlockValue) setBlockValue(blocks);
  }, [blocks]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createBrowserSupabaseClient();
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("type", typeKey)
        .maybeSingle();

      if (error) throw error;

      if (data && data.data) {
        const fetchedBlocks = data.data;

        // 이전 이미지 URL 수집
        const imagesInBlocks = fetchedBlocks.flatMap((block) =>
          formFields
            .filter((f) => f.type === "image")
            .flatMap((field) => block[field.name] || [])
        );
        prevImagesRef.current = imagesInBlocks.map((img) =>
          typeof img === "string" ? img : img.url || ""
        );

        const formattedBlocks = fetchedBlocks.map((block) => {
          const newBlock = { ...block };
          formFields.forEach((field) => {
            if (field.type === "image") {
              newBlock[field.name] = (block[field.name] || []).map((img) =>
                typeof img === "string" ? { url: img, id: img } : img
              );
            }
          });
          return newBlock;
        });

        setBlocks(formattedBlocks);
      }
    } catch (error) {
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(error);
    }
  }

  const handleAddBlock = () => {
    const emptyBlock = {};
    formFields.forEach((f) => {
      if (f.type === "image") emptyBlock[f.name] = [];
      else emptyBlock[f.name] = "";
    });
    setBlocks((prev) => [...prev, emptyBlock]);
  };

  const handleRemoveBlock = (indexToRemove) => {
    setBlocks((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleBlockChange = (index, fieldName, value) => {
    setBlocks((prev) =>
      prev.map((block, i) =>
        i === index ? { ...block, [fieldName]: value } : block
      )
    );
  };

  const handleMoveBlock = (from, to) => {
    if (to < 0 || to >= blocks.length) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, moved);
    setBlocks(newBlocks);
  };

  const validateBlocks = () => {
    return blocks.every((block) =>
      formFields.every((field) => {
        if (field.required) {
          if (field.type === "image") {
            return (block[field.name]?.length || 0) > 0;
          } else {
            return block[field.name]?.toString().trim() !== "";
          }
        }
        return true;
      })
    );
  };
  const handleSubmit = async () => {
    if (!validateBlocks()) {
      alert("필수 입력 항목을 모두 입력해주세요.");
      return;
    }
    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      console.log("📦 저장 시작");

      // 이미지 업로드 처리
      const imageUploadedBlocks = await Promise.all(
        blocks.map(async (block, blockIndex) => {
          const newBlock = { ...block };
          for (const field of formFields) {
            if (field.type === "image") {
              const images = block[field.name] || [];

              const uploadedImages = await Promise.all(
                images.map(async (img, imgIndex) => {
                  try {
                    if (img.url) return img.url;
                    const uploaded = await handleStorageFolder({
                      mode: "update",
                      bucket,
                      path,
                      files: [img],
                    });
                    if (!uploaded[0]) {
                      console.warn("⚠️ 업로드 결과가 비어있음", uploaded);
                      throw new Error("업로드 실패");
                    }
                    return uploaded[0];
                  } catch (imgErr) {
                    console.error(
                      `❌ 이미지 업로드 실패 - block[${blockIndex}], field[${field.name}], img[${imgIndex}]`,
                      img,
                      imgErr
                    );
                    throw imgErr;
                  }
                })
              );

              newBlock[field.name] = uploadedImages;
            }
          }
          return newBlock;
        })
      );

      // 삭제할 이미지 찾기
      const prevImages = prevImagesRef.current || [];
      const currentImages = imageUploadedBlocks.flatMap((block) =>
        formFields
          .filter((f) => f.type === "image")
          .flatMap((f) => block[f.name] || [])
      );

      const deletedImages = prevImages.filter(
        (url) => !currentImages.includes(url)
      );

      if (deletedImages.length > 0) {
        const deleteList = deletedImages
          .map((url) => {
            try {
              const parts = url.split(`/${bucket}/`);
              return parts[1] || "";
            } catch {
              return "";
            }
          })
          .map((fullPath) => fullPath.replace(`${path}/`, ""));

        console.log("🗑 삭제할 이미지 목록:", deleteList);

        await handleStorageFolder({
          mode: "delete",
          bucket,
          path,
          deleteList,
        });
      }

      // DB 저장
      const { error } = await supabase.from(table).upsert(
        {
          type: typeKey,
          data: imageUploadedBlocks,
        },
        {
          onConflict: "type",
        }
      );

      if (error) {
        console.error("❌ Supabase 저장 오류", error);
        alert("업로드 중 에러가 발생했습니다.");
      } else {
        console.log("✅ 저장 성공");
        prevImagesRef.current = imageUploadedBlocks.flatMap((block) =>
          formFields
            .filter((f) => f.type === "image")
            .flatMap((f) => block[f.name] || [])
        );
      }
    } catch (e) {
      console.error("❌ 전체 저장 중 오류 발생", e);
      alert("알 수 없는 오류가 발생했습니다.");
    } finally {
      console.log("🔚 저장 종료 - setIsSubmitting(false)");
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      {blocks.map((block, index) => (
        <Card key={index} variant="outlined" className="shadow-xl">
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{`${label} ${index + 1}`}</Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={() => handleMoveBlock(index, index - 1)}
                    disabled={index === 0}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleMoveBlock(index, index + 1)}
                    disabled={index === blocks.length - 1}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleRemoveBlock(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>

              {formFields.map((field) =>
                field.type === "image" ? (
                  <>
                    {field.label && (
                      <p className="font-semibold">{field.label}</p>
                    )}
                    <DragDropZone
                      key={field.name}
                      maxMB={field.maxMB || 2}
                      files={block[field.name] || []}
                      onChange={(files) =>
                        handleBlockChange(index, field.name, files)
                      }
                    />
                  </>
                ) : (
                  <TextField
                    key={field.name}
                    label={field.label}
                    size="small"
                    variant="outlined"
                    value={block[field.name] || ""}
                    onChange={(e) =>
                      handleBlockChange(index, field.name, e.target.value)
                    }
                    fullWidth
                    multiline={!!field.multiline}
                    minRows={field.minRows}
                    required={!!field.required}
                    type={field.type === "url" ? "url" : "text"}
                  />
                )
              )}

              {blockButtons?.map((item, index) => (
                <Button
                  key={index}
                  onClick={() => item.onClick(block)}
                  fullWidth
                  variant="contained"
                  className="mb-4"
                >
                  {item.text}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}

      {(!maxBlocksCount || maxBlocksCount > blocks.length) && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBlock}
          color="primary"
        >
          {label} 추가
        </Button>
      )}

      {!hideSubmitButton && (
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "전체 저장하기"}
        </Button>
      )}
    </Stack>
  );
};

export default EditableBlocks;
