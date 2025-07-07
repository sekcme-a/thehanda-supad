import React, { useRef } from "react";

const ImagePreviewItem = ({ file, index, onRemove, onDragEnd }) => {
  const ref = useRef();

  const handleDragStart = (e) => {
    e.dataTransfer.setData("index", index);
  };

  const handleDrop = (e) => {
    const fromIndex = parseInt(e.dataTransfer.getData("index"), 10);
    onDragEnd(fromIndex, index);
  };

  return (
    <div
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative border rounded overflow-hidden group"
    >
      <img
        src={file.preview || file.url}
        alt="preview"
        className="w-full h-32 object-cover"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 text-xs px-2 py-1 bg-black bg-opacity-50 text-white rounded hidden group-hover:block"
      >
        삭제
      </button>
    </div>
  );
};

export default ImagePreviewItem;
