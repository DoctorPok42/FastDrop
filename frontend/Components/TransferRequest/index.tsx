import React from 'react';
import { useClickAway } from "@uidotdev/usehooks";

import styles from './styles.module.scss';

interface TransferRequestProps {
  transfers: any[];
  onAccept: (transferId: string) => void;
  onDecline: (transferId: string) => void;
  isComplete: boolean;
  isDownloading: boolean;
}

const TransferRequest: React.FC<TransferRequestProps> = ({
  transfers,
  onAccept,
  onDecline,
  isComplete,
  isDownloading
}) => {
  const transfer = transfers[0];

  const ref = useClickAway(() => {
    onDecline(transfer.transferId);
  }) as React.MutableRefObject<HTMLDivElement>;

  if (transfers.length === 0) return null;

  const getTransferDescription = () => {
    if (transfer.transferType === 'file') {
      return `wants to send you a file.`;
    } else if (transfer.transferType === 'txt') {
      return 'wants to send you a text message.';
    } else if (transfer.transferType === 'url') {
      return 'wants to send you an URL.';
    }
    return 'wants to send you something';
  };

  const getTransferCompleteDescription = () => {
    if (transfer.transferType === 'file') {
      return 'File transfer completed.';
    }
    if (transfer.transferType === 'txt') {
      return 'Text message has been copied to your clipboard.';
    }
    if (transfer.transferType === 'url') {
      return 'URL has been copied to your clipboard.';
    }
    return 'Transfer completed.';
  };

  return (
    <div className={styles.overlay}>
      <div ref={ref} className={`${styles.modal} bg-inverse text-inverse-text lg:w-125 w-full lg:translate-y-0 translate-y-7`}>
        <div className={styles.header}>
          <span></span>
          Incoming Transfer
        </div>

        <div className={styles.message}>
          <strong>{transfer.senderName}</strong> {getTransferDescription()}
        </div>

        {transfer.transferType === 'file' && transfer.fileNames.map((e: string, index: number) => (
          <div className={styles.transferDetails} key={index}>
            <span className={styles.fileIcon}>
              {e.split('.').pop()?.toLocaleUpperCase()}
            </span>

            <span className={styles.fileName}>
              {e}
            </span>
          </div>
        ))}

        {isDownloading ? (
          <div className={styles.message}>
            Downloading file...
          </div>
        ) : isComplete ? (
          <div className={styles.message}>
            {getTransferCompleteDescription()}
          </div>
        ) : (
          <div className={styles.buttons}>
            <button
              className={`${styles.btnDecline} border border-divider`}
              onClick={() => onDecline(transfer.transferId)}
            >
              Decline
            </button>
            <button
              className={styles.btnAccept}
              onClick={() => onAccept(transfer.transferId)}
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferRequest;
