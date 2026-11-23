import { useState } from "react";
import "./FileDropzone.css";
import { X } from "react-feather";

// Single-file drop area that replaces react-dropzone-uploader on this screen.
// That package bundles its own copy of React and breaks on React 19. Same
// `dzu-*` class names, so the app's overrides in _react-plugin.scss still apply.

const matchesAccept = (file, accept) => {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase())
    .some((ext) => ext && name.endsWith(ext));
};

const formatBytes = (bytes) => {
  const units = ["bytes", "kB", "MB", "GB", "TB"];
  let level = 0;
  let size = bytes;
  while (size >= 1024 && level < units.length - 1) {
    size /= 1024;
    level += 1;
  }
  return `${size.toFixed(size >= 10 || level < 1 ? 0 : 1)}${units[level]}`;
};

const FileDropzone = ({ accept, label, disabled, onFile, style }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file || disabled || !matchesAccept(file, accept)) return;
    setSelected({ name: file.name, size: file.size });
    onFile(file);
  };

  const className = [
    "dzu-dropzone",
    isDragging && !disabled ? "dzu-dropzoneActive" : "",
    disabled ? "dzu-dropzoneDisabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const removeFile = () => {
    setSelected(null);
    onFile(null);
  };
  return (
    <div
      className={className}
      style={style}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      {selected ? (
        <div className="dzu-previewContainer">
          <span className="dzu-previewFileName">{`${selected.name}, ${formatBytes(selected.size)}`}</span>
          <div className="dzu-previewStatusContainer">
            <X className="dzu-previewButton" onClick={removeFile} />
          </div>
        </div>
      ) : (
        <label className="dzu-inputLabel">
          {label}
          <input
            className="dzu-input"
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
};

export default FileDropzone;
