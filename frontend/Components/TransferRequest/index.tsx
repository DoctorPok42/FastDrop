import React from 'react';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material/';
import { useClickAway } from "@uidotdev/usehooks";

import styles from './styles.module.scss';

interface TransferRequestProps {
  transfers: any[];
  onAccept: (transferId: string) => void;
  onDecline: (transferId: string) => void;
}

const TransferRequest: React.FC<TransferRequestProps> = ({
  transfers,
  onAccept,
  onDecline,
}) => {
  const transfer = transfers[0];

  const ref = useClickAway(() => {
    onDecline(transfer.transferId);
  }) as React.MutableRefObject<HTMLDivElement>;

  if (transfers.length === 0) return null;

  const getTransferDescription = () => {
    if (transfer.transferType === 'file') {
      return `wants to send you ${transfer.fileNames.length} file(s): ${transfer.fileNames.join(', ')}`;
    } else if (transfer.transferType === 'txt') {
      return 'wants to send you a text message';
    } else if (transfer.transferType === 'url') {
      return 'wants to send you a URL';
    }
    return 'wants to send you something';
  };

  return (
    <div className={styles.overlay}>
      <div ref={ref} className={styles.modal}>
        <div className={styles.header}>
          <h2>Transfer Request</h2>
          <IconButton 
            size="small"
            onClick={() => onDecline(transfer.transferId)}
          >
            <Close style={{ color: 'var(--white)' }} />
          </IconButton>
        </div>
        
        <div className={styles.content}>
          <p>
            <strong>{transfer.senderName}</strong> {getTransferDescription()}
          </p>
        </div>

        <div className={styles.buttons}>
          <button 
            className={styles.btnDecline}
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
      </div>
    </div>
  );
};

export default TransferRequest;
