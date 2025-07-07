import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

export const useDragDropZone = ({ initialFiles = [], onChange, maxMB = 1 }) => {
  const [files, setFiles] = useState(
    initialFiles.map((file) => ({ ...file, id: uuidv4() }))
  );
  const [statusText, setStatusText] = useState("");

  const compressIfNeeded = async (file, index) => {
    if (file.size / 1024 / 1024 <= maxMB) return file;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: maxMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      return compressed;
    } catch (error) {
      console.error("압축 실패:", error);
      return file;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setStatusText(
        `이미지를 받아오는 중입니다...\n${maxMB}MB 이상의 이미지는 자동으로 압축됩니다.`
      );
      const newFiles = await Promise.all(
        acceptedFiles.map(async (file, index) => {
          console.log(index);
          const compressedFile = await compressIfNeeded(file, index);
          return {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            id: uuidv4(),
          };
        })
      );
      setStatusText("");
      const updated = [...files, ...newFiles];
      setFiles(updated);
      onChange?.(updated);
    },
    [files, onChange, maxMB]
  );

  const onRemove = useCallback(
    (index) => {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      onChange?.(updated);
    },
    [files, onChange]
  );

  const onDragEnd = useCallback(
    (from, to) => {
      if (from === to || to === undefined) return;
      const updated = [...files];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      setFiles(updated);
      onChange?.(updated);
    },
    [files, onChange]
  );

  return { files, onDrop, onRemove, onDragEnd, statusText };
};
