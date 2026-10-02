import React, { useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import styles from './styles.module.scss'

interface FileUploadProps {
  onFileUpload: (files: File[], targetName: string) => void;
  targetName: string;
  files: File[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, targetName, files }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles, targetName);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className={`${styles.inputStyle} bg-surface`}>
      <Image
        src="/upload-icon.svg"
        alt="Upload Icon"
        width={62}
        height={62}
      />

      <input {...getInputProps()} />

      <div className={styles.item__title}>
        {files.length > 0 ? (
          <div className={styles.item__files}>
            {files.map((file, index) => (
              <div key={index}>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h2>Drop files here</h2>
            <span className={styles.item__subtitle}>
              or click to browse · large files are sent in chunks
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
