import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from './styles.module.scss'

interface FileUploadProps {
  onFileUpload: (files: File[], targetName: string) => void;
  targetName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, targetName }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles, targetName);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className={styles.inputStyle} >
      <input {...getInputProps()} />
      <div className={styles.item__icon}>
          <FontAwesomeIcon icon={faFile} style={{
              width: '2.6rem',
          }} />
      </div>

      <div className={styles.item__title}>
        <h2>File</h2>
      </div>
    </div>
  );
};

export default FileUpload;
