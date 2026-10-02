import { useEffect, useRef, useState } from 'react';
import Head from 'next/head'
import Script from 'next/script';
import io from 'socket.io-client';
import { Alert } from '@mui/material'
import { Device, Header, SelectUsers, SideBar, TransferRequest } from '../../Components';
import { uniqueNamesGenerator, Config, adjectives, animals } from 'unique-names-generator';
import { getDeviceType, handleUpload, askForLocationPermission } from '../functions';
import { handleDownloadFile } from '../functions/handle';
import { IncomingFile } from '@/types/file';
import { SpeedStreaks } from '../../Components/Motion';

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: '-',
};

const Home = () => {
  const [users, setUsers] = useState([] as any[]);
  const [myUsername, setMyUsername] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [mySocket, setMySocket] = useState<any>(null);
  const [onSelectUser, setOnSelectUser] = useState<boolean>(false);
  const [isInRoom, setIsInRoom] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<any>();
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const incomingFilesRef = useRef<{ [fileId: string]: IncomingFile }>({});

  const [privacyLevel, setPrivacyLevel] = useState<string>('1');

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number>(-1);
  const [ping, setPing] = useState<number>(0);

  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const pendingTransfersRef = useRef<{ [transferId: string]: any }>({});
  const [domain, setDomain] = useState<string>('');


  useEffect(() => {
    setDomain(globalThis.location.hostname);
    if (privacyLevel === '1') {
      mySocket?.emit('updatePrivacyLevel', {
        name: myUsername,
        deviceType: getDeviceType(),
        privacyLevel: privacyLevel,
        location: null,
      })
    }
    if (privacyLevel === '2') {
      askForLocationPermission(
        mySocket,
        myUsername,
        privacyLevel,
        setError,
        setPrivacyLevel,
        getDeviceType,
      )
    }
    if (privacyLevel === '3') {
      mySocket?.emit('updatePrivacyLevel', {
        name: myUsername,
        deviceType: getDeviceType(),
        privacyLevel: privacyLevel,
        location: null,
      })
    }
  }, [privacyLevel]);

  const connectToSocket = () => {
    let userName;
    userName = uniqueNamesGenerator(customConfig);
    setMyUsername(userName);
    setError(null)

    const newSocket = io("https://fastdrop-server.doctorpok.io/", {
      secure: true,
      transports: ["websocket"],
      ackTimeout: 5000,
      reconnectionDelay: 1000,
    });
    let userList = [] as any[];
    setMySocket(newSocket);

    const user = {
      name: userName,
      deviceType: getDeviceType(),
      privacyLevel: privacyLevel,
      location: null,
    }

    newSocket.on('connect', () => {
      setConnected(true);
      setUsers([]);
      newSocket.emit('join', user);

      setPing(0);
    });

    newSocket.on('wssPing', (latency: number) => {
      setPing(latency);
    });

    newSocket.on('connect_error', (err: any) => {
      setError("Connection error, please try again by refreshing the page.");
      setConnected(false);
    });

    newSocket.on('disconnect', () => {
      setSelectedDevice(null);
      setConnected(false);
      setUsers([]);
      setIsInRoom(false);
      setOnSelectUser(false);
      setError("You have been disconnected. Please refresh the page to reconnect.");
      setMySocket(null);
      setMyUsername('');
      userList = [];
      incomingFilesRef.current = {};
    });

    newSocket.on('updateUsers', (users) => {
      setUsers(
        users.map((user: any) => ({
          socketId: user.socketId,
          userName: user.name,
          userDeviceType: user.deviceType
        }))
      );
      userList = users.map((user: any) => ({
        socketId: user.socketId,
        userName: user.name,
        userDeviceType: user.deviceType
      }));
    });

    newSocket.on('removeUser', (soketId: any) => {
      const filteredUsers = userList.filter((user) => user.socketId !== soketId);
      setUsers(filteredUsers);
      setSelectedDevice((prevSelectedDevice: any) => {
        if (prevSelectedDevice && prevSelectedDevice.socketId === soketId) {
          return null;
        }
        return prevSelectedDevice;
      });
    });

    newSocket.on('fileDownloadLarge', async (file: any, username: string) => {
      let allFile = [] as any[];

      file.map((f: any) => {
        const putFiles = new File([f.file], f.fileName);
        allFile.push({
          fileName: f.fileName,
          file: putFiles,
          checked: true,
        });
      });

      handleDownloadFile(allFile);
      completeTransfer();
    });

    newSocket.on('fileDownload', async (file: any, fileName: string, username: string) => {
      const putFile = new File([file], fileName);
      handleDownloadFile([
        {
          fileName: fileName,
          file: putFile,
          checked: true,
        },
      ]);
      completeTransfer();
    });

    newSocket.on("fileDownloadChunk", (data) => {
      const { fileId, chunk, currentChunk, totalChunks, fileName, username, sender } = data;

      if (!incomingFilesRef.current[fileId]) {
        incomingFilesRef.current[fileId] = {
          chunks: new Array(totalChunks),
          totalChunks,
          fileName,
          username,
        };
      }

      const arrayBuffer =
        chunk instanceof ArrayBuffer ? chunk : new Uint8Array(chunk).buffer;

      incomingFilesRef.current[fileId].chunks[currentChunk] = arrayBuffer;

      newSocket.emit("fileDownloadChunkStatus", {
        currentChunk,
        totalChunks,
        userToRespond: sender,
      });
      setStatus(Math.floor(((currentChunk + 1) / totalChunks) * 100));
    });

    newSocket.on("fileDownloadChunkStatusAlert", (data) => {
      const { currentChunk, totalChunks, senderUsername } = data;
      setStatus(Math.floor(((currentChunk + 1) / totalChunks) * 100));
    });

    newSocket.on("fileDownloadEnd", (data) => {
      const { fileId, fileName, username, sender } = data;
      const fileData = incomingFilesRef.current[fileId];
      if (!fileData) return;

      const blob = new Blob(fileData.chunks);
      handleDownloadFile([
        {
          fileName: fileName,
          file: new File([blob], fileName),
          checked: true,
        },
      ]);
      completeTransfer();

      setStatus(200);
      setTimeout(() => {
        setStatus(-1);
      }, 3000);

      delete incomingFilesRef.current[fileId];

      newSocket.emit('fileDownloadEnd', {
        fileId,
        userToRespond: sender,
      });
    });

    newSocket.on('fileDownloadEndAlert', () => {
      setStatus(200);
      setTimeout(() => {
        setStatus(-1);
      }, 3000);
    })

    newSocket.on('textDownload', async (text: string, username: string) => {
      await navigator.clipboard.writeText(text);
    });

    newSocket.on('urlDownload', async (url: string, username: string) => {
      await navigator.clipboard.writeText(url);
    });

    newSocket.on("roomCreated", () => {
      setIsInRoom(true);
      setOnSelectUser(false);
    });

    newSocket.on('receiveTransferRequest', (data: any) => {
      const { transferId, senderName, senderSocketId, transferType, fileNames } = data;
      const newTransfer = {
        transferId,
        senderName,
        senderSocketId,
        transferType,
        fileNames,
        timestamp: Date.now(),
      };
      pendingTransfersRef.current[transferId] = newTransfer;
      setPendingTransfers([...Object.values(pendingTransfersRef.current)]);
    });

    newSocket.on('receiveTransferResponse', (data: any) => {
      const { transferId, accepted } = data;
      console.log(`Transfer ${transferId} response: ${accepted ? 'accepted' : 'declined'}`);
    });
  };

  const handleCreateRoom = (users: any[]) => {
    setOnSelectUser(false);
    setIsInRoom(true);
    mySocket.emit('createRoom', {
      users: users,
    });
  }

  const completeTransfer = () => {
    setIsDownloading(false);
    setIsComplete(true);
    setTimeout(() => {
      pendingTransfersRef.current = {};
      setPendingTransfers([]);
      setIsComplete(false);
    }, 3000);
  };

  const handleTransferResponse = (transferId: string, accepted: boolean) => {
    if (mySocket && pendingTransfersRef.current[transferId]) {
      const transfer = pendingTransfersRef.current[transferId];
      mySocket.emit('transferResponse', {
        transferId,
        accepted,
        senderSocketId: transfer.senderSocketId,
      });

      if (accepted) {
        if (transfer.transferType === 'file') {
          setIsComplete(false);
          setIsDownloading(true);
        } else {
          setIsComplete(true);
          setTimeout(() => {
            pendingTransfersRef.current = {};
            setPendingTransfers([]);
            setIsComplete(false);
          }, 3000);
        }
      } else {
        setIsDownloading(false);
        setIsComplete(false);
        delete pendingTransfersRef.current[transferId];
        setPendingTransfers(Object.values(pendingTransfersRef.current));
      }
    }
  };

  return (
    <>
      <Head>
        <title>Fastdrop</title>
        <meta name="description" content="The easiest way to transfer files across devices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#c8f53a" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-title" content="Fastdro" />
      </Head>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"
        onLoad={() => {
          connectToSocket()
        }}
      />

      <main className="max-w-7xl mx-auto">
        {error &&
          <Alert className='alert' severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        }

        {onSelectUser &&
          <SelectUsers
            users={users}
            onCreate={handleCreateRoom}
            myName={myUsername}
            onClose={() => setOnSelectUser(false)}
          />
        }

        <Header ping={ping} radio={{
          value: privacyLevel,
          onChange: (e) => setPrivacyLevel(e),
          nbOfUsers: users.length,
          onClick: () => setOnSelectUser(true),
          isActive: isInRoom
        }} />


        <section className='flex flex-wrap items-end justify-between gap-8 py-10'>
          <div className='flex-1 basis-105 min-w-0'>
            <h1 className='relative m-0 font-black italic font-stretch-125% text-[clamp(46px,8vw,112px)] leading-[0.9] tracking-[-0.045em] text-balance text-text'>
              Drop it.
              <br />
              <span className='relative inline-block px-[0.12em] mt-[.08em] bg-accent text-on-accent skew-x-highlight'>
                Already there.
              </span>
            </h1>
            <p className='m-0 mt-6 max-w-130 text-[clamp(16px,1.6vw,19px)] leading-normal text-pretty text-text-2'>
              Files, text and links between your devices over a live websocket. Nothing stored, nothing to install.
            </p>
          </div>

          <div className='flex-1 basis-105 min-w-0 relative overflow-hidden bg-surface border border-divider rounded-3xl p-6 flex flex-col gap-4.5'>
            <SpeedStreaks />

            <div className='relative flex justify-between items-center font-mono text-[12px] text-muted uppercase tracking-[0.08em]'>
              <span>You are</span>
              {users[0]?.userDeviceType && <span>{users[0].userDeviceType}</span>}
            </div>

            <div className='relative font-extrabold font-stretch-110% text-[clamp(30px,3.6vw,44px)] tracking-[-0.03em] leading-none text-text'>
              {myUsername}
            </div>

            <div className='relative flex items-center gap-2 text-[14px] text-text-2'>
              <span className='w-2 h-2 rounded-xs bg-text skew-x-mark' />
              <span>
                Visible to {privacyLevel === '1' ? 'everyone on fastdrop' : privacyLevel === '2' ? 'people close to you' : 'this network'}
              </span>
            </div>
          </div>
        </section>

        {/* Nearby Users */}
        <section className='flex flex-col gap-5 pb-5'>
          <div className='flex items-baseline justify-between gap-3 pb-3 border-b-2 border-divider-strong'>
            <h2 className='m-0 font-extrabold font-stretch-125% text-[clamp(22px,2.4vw,28px)] tracking-[-0.02em]'>
              Nearby devices
            </h2>

            <span className='text-[13px] text-neutral-700 font-mono'>
              {Math.max(0, users.length - 1)} online {users.length < 2 ? "" : "- tap one to send"}
            </span>
          </div>

          <div className='gap-4 template-grid'>
            {users.length < 2 ?
              <div className='relative overflow-hidden col-span-10 flex flex-col items-center text-center border-dashed border border-neutral-400 p-[clamp(36px,6vw,72px)_24px] rounded-[22px]'>
                <SpeedStreaks />
                <span className='flex items-center justify-center gap-2 uppercase font-mono text-[12px] text-text-2 tracking-widest'>
                  <span className='w-1.75 h-1.75 rounded-full bg-text'></span>
                  scanning
                </span>

                <p className='relative italic m-0 font-extrabold font-stretch-110% text-[clamp(24px,3.4vw,38px)] tracking-[-0.03em] leading-12 mb-4 max-w-160 text-balance'>
                  Open Fastdrop on other devices to start sending
                </p>

                <span className='relative bg-surface rounded-md border border-divider text-[14px] font-mono py-2 px-3.5'>
                  {domain}
                </span>
              </div>
              :
              users.map(device => (
                <Device
                  key={device.socketId}
                  device={device}
                  myName={myUsername}
                  setSelectedDevice={setSelectedDevice}
                />
              ))
            }
          </div>

          <SideBar
            device={selectedDevice}
            onClose={() => setSelectedDevice(null)}
            handleFileUpload={(files: File[]) => handleUpload(mySocket, 'file', myUsername, selectedDevice?.socketId, setStatus, files)}
            handleSendText={(text: string) => handleUpload(mySocket, 'txt', myUsername, selectedDevice?.socketId, setStatus, undefined, text)}
            handleUrlUpload={(url: string) => handleUpload(mySocket, 'url', myUsername, selectedDevice?.socketId, setStatus, undefined, undefined, url)}
            showPopup={!!selectedDevice}
          />

        </section>

        {pendingTransfers.length > 0 && <div className='fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-end'>
          {status !== -1 &&
            <Alert className='status' severity={
              status === 200 ? 'success' : "info"
            }>
              {status !== 200 ? `File transfering... (${status} %)` : 'File transfered successfully!'}
            </Alert>
          }

          <TransferRequest
            transfers={pendingTransfers}
            onAccept={(transferId: string) => handleTransferResponse(transferId, true)}
            onDecline={(transferId: string) => handleTransferResponse(transferId, false)}
            isComplete={isComplete}
            isDownloading={isDownloading}
          />
        </div>
        }
      </main>
    </>
  )
}

export default Home
