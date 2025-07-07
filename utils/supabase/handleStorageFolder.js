import { createBrowserSupabaseClient } from "./client";

/**
 * Supabase Storage의 특정 경로에 대해 다음 작업을 수행:
 * - "insert": 기존 파일 삭제 후 새 파일 업로드
 * - "update": 기존 파일 유지하고 새 파일 업로드
 * - "delete": 전체 또는 특정 파일만 삭제
 */
export async function handleStorageFolder({
  mode, // "insert" | "update" | "delete"
  bucket, // Supabase Storage 버킷 이름
  path, // 대상 경로 (예: "images/1234")
  files = [], // 업로드할 파일 리스트 [{ file: File }]
  recursive = false, // 삭제 시 하위 폴더 포함 여부
  deleteList = null, // delete 모드에서 선택 삭제할 파일 리스트 (상대 경로 배열)
}) {
  const supabase = createBrowserSupabaseClient();

  // ------------------------------------------------------------
  // insert 모드: 업로드 전에 기존 파일 전체 삭제
  // ------------------------------------------------------------
  if (mode === "insert") {
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(bucket)
      .list(path, { recursive });

    if (listError) {
      console.error("List error:", listError.message);
    } else if (existingFiles && existingFiles.length > 0) {
      const pathsToRemove = existingFiles.map((file) => `${path}/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(pathsToRemove);

      if (removeError) {
        console.error("Remove error:", removeError.message);
      }
    }
  }

  // ------------------------------------------------------------
  // delete 모드: 전체 삭제 또는 deleteList 기반 선택 삭제
  // ------------------------------------------------------------
  if (mode === "delete") {
    let pathsToRemove = [];

    if (Array.isArray(deleteList) && deleteList.length > 0) {
      // deleteList가 제공된 경우: 해당 경로만 삭제
      pathsToRemove = deleteList.map((name) => `${path}/${name}`);
    } else {
      // 전체 삭제 (기존 방식)
      const { data: existingFiles, error: listError } = await supabase.storage
        .from(bucket)
        .list(path, { recursive });

      if (listError) {
        console.error("List error:", listError.message);
      } else if (existingFiles && existingFiles.length > 0) {
        pathsToRemove = existingFiles.map((file) => `${path}/${file.name}`);
      }
    }

    if (pathsToRemove.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(pathsToRemove);

      if (removeError) {
        console.error("Remove error:", removeError.message);
      }
    }

    return [];
  }

  // ------------------------------------------------------------
  // update 또는 insert 후 파일 업로드 처리
  // ------------------------------------------------------------
  const uploadedUrls = [];

  for (const item of files) {
    const file = item.file;
    if (!file) {
      console.warn("No file property found in item:", item);
      continue;
    }

    const fileExt = getFileExtension(file);
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const fullPath = `${path}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        `Upload failed for ${file.name || "unnamed file"}:`,
        uploadError.message
      );
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);
    uploadedUrls.push(urlData.publicUrl);
  }

  return uploadedUrls;
}

/**
 * 파일 확장자를 추출하는 유틸 함수
 */
function getFileExtension(file) {
  if (typeof file.name === "string" && file.name.includes(".")) {
    return file.name.split(".").pop();
  }
  return "bin";
}
