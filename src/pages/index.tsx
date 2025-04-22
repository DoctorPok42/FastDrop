import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head'
import Script from 'next/script';
import io from 'socket.io-client';
import { Alert } from '@mui/material'
import { Device, PopupDownload, RadioButton } from '../../Components';
import { uniqueNamesGenerator, Config, adjectives, animals } from 'unique-names-generator';
import { getDeviceType, handleUpload, askForLocationPermission } from '../functions';
import { handleDownloadFile, handleGetUrl, handleDeclineFile } from '../functions/handle';
import { IncomingFile } from '@/types/file';

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: '-',
};

const Home = () => {
  const [users, setUsers] = useState([] as any[]);
  const [myUsername, setMyUsername] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [mySocket, setMySocket] = useState<any>(null);

  const [showPopupDownload, setShowPopupDownload] = useState(false);
  const [popupType, setPopupType] = useState<'file' | 'txt' | 'url' | 'none'>('none')

  const [filesToDownload, setFilesToDownload] = useState<any[]>([]);
  const incomingFilesRef = useRef<{ [fileId: string]: IncomingFile }>({});
  const [text, setText] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [userNameSender, setUserNameSender] = useState<[string, string]>(['', '']);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [privacyLevel, setPrivacyLevel] = useState<string>('1');

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number>(-1);

  useEffect(() => {
    if (privacyLevel === '1') {
      mySocket && mySocket.emit('updatePrivacyLevel', {
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
      mySocket && mySocket.emit('updatePrivacyLevel', {
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

    const newSocket = io("https://fastdrop-server.doctorpok.io/", { secure: true, transports: ["websocket"] });
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
    });

    newSocket.on('fileDownloadLarge', async (file: any,  username: string) => {
      setUserNameSender([username, myUsername]);

      let allFile = [] as any[];

      file.map((f: any) => {
        const putFiles = new File([f.file], f.fileName);
        allFile.push({
          fileName: f.fileName,
          file: putFiles,
          checked: true,
        });
      });

      setFilesToDownload(allFile);
      setShowPopupDownload(true);
      setPopupType('file');
    });

    newSocket.on('fileDownload', async (file: any, fileName: string, username: string) => {
      setUserNameSender([username, myUsername]);
      const putFile = new File([file], fileName);
      setFilesToDownload([
        {
          fileName: fileName,
          file: putFile,
          checked: true,
        },
      ]);
      const fileExtension = fileName.split('.').pop();
      if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg') {
        setPreviewUrl(URL.createObjectURL(putFile));
      } else {
        setPreviewUrl(null);
      }
      setShowPopupDownload(true);
      setPopupType('file');
    });

    newSocket.on("fileDownloadChunk", (data) => {
      const { fileId, chunk, currentChunk, totalChunks, fileName, username, sender } = data;
      setUserNameSender([username, myUsername]);

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
      setUserNameSender([senderUsername, myUsername]);
    });

    newSocket.on("fileDownloadEnd", (data) => {
      const { fileId, fileName, username, sender } = data;
      setUserNameSender(username);
      const fileData = incomingFilesRef.current[fileId];
      if (!fileData) return;

      const blob = new Blob(fileData.chunks);
      const url = URL.createObjectURL(blob);

      setFilesToDownload([
        {
          fileName: fileName,
          file: new File([blob], fileName),
          checked: true,
        },
      ]);

      const fileExtension = fileName.split('.').pop();
      if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg') {
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      setShowPopupDownload(true);
      setPopupType('file');

      setStatus(200);
      setTimeout(() => {
        setStatus(-1);
      }, 3000);

      delete incomingFilesRef.current[fileId];

      newSocket.emit('fileDownloadEnd', {
        fileId,
        userToRespond: sender,
      });

      setUserNameSender(['', '']);
      setFilesToDownload([]);
    });

    newSocket.on('fileDownloadEndAlert', (data) => {
      setStatus(200);
      setTimeout(() => {
        setStatus(-1);
      }, 3000);
    })

    newSocket.on('textDownload', async (text: string, username: string) => {
      setUserNameSender([username, myUsername]);
      setText(text);
      setShowPopupDownload(true);
      setPopupType('txt');
    });

    newSocket.on('urlDownload', async (url: string, username: string) => {
      setUserNameSender([username, myUsername]);
      setUrl(url);
      setShowPopupDownload(true);
      setPopupType('url');
    });
  };

  const animation = [1, 2, 3, 4, 5, 6];

  return (
    <>
      <Head>
        <title>Fastdrop</title>
        <meta name="description" content="The easiest way to transfer files across devices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#38b6ff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"
        onLoad={() => {
          connectToSocket()
        }}
      />

      <main className="container">
        {error &&
          <Alert className='alert' severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        }

        {status !== -1 &&
          <Alert className='status' severity={
            status === 200 ? 'success' : "info"
          }>
            {status !== 200 ? `File transfering... (${status} %)` : 'File transfered successfully!'}
          </Alert>
        }

        <RadioButton value={privacyLevel} onChange={(e) => setPrivacyLevel(e)} />
        <div>
          {!connected && <button className='buttonConnect' onClick={() => connectToSocket()} onLoad={() =>  {
              console.log('onload')
          }}>Se connecter</button>}
        </div>
        {showPopupDownload && <PopupDownload
          acceptFile={() => handleDownloadFile(filesToDownload, setShowPopupDownload, setFilesToDownload)}
          acceptUrl={(url: string) => handleGetUrl(url, setShowPopupDownload)}
          decline={() => handleDeclineFile(setShowPopupDownload, setFilesToDownload)}
          fileName={filesToDownload}
          text={text}
          url={url}
          username={myUsername}
          popupType={popupType}
          previewUrl={previewUrl}
        />}

        {users.length < 2 ?
          <div className="title">
            <h2>Open Fastdrop on other devices to send files</h2>
          </div>
        :
          <div className='devices'>
            {users.map(device => (
              <Device
                key={device.socketId}
                device={device}
                myName={myUsername}
                handleSendText={(text: string) => handleUpload(mySocket, 'txt', myUsername, device.socketId, setStatus, undefined, text)}
                handleFileUpload={(files: File[]) => handleUpload(mySocket, 'file', myUsername, device.socketId, setStatus, files)}
                handleUrlUpload={(url: string) => handleUpload(mySocket, 'url', myUsername, device.socketId, setStatus, undefined, undefined, url)}
                status={status}
                userNameSender={userNameSender}
              />
            ))}
          </div>
        }

        <div className="animation">
          <div className='testAnim' style={{
            opacity: users.length < 2 ? '1' : '0',
          }}>
          {
            animation.map((i) => (
              <span key={i} style={{ ['--i' as any]: i }} />
            ))
          }</div>
          <img src="/favicon.ico" alt="Fastdrop" style={{
            animation: users.length < 2 ? 'animate-logo 2s linear infinite' : 'none',
          }} />
        </div>

        {myUsername ?
          <h4>You are known as <span>{myUsername}</span></h4> :
          <h4>The easiest way to transfer files across devices</h4>}
        <h6>
          {privacyLevel === '3' ?
            "You can be discovered by everyone on this network"
          : privacyLevel === '2' ?
            "You can be discovered by everyone close to you"
          : "You can be discovered by everyone on this website"
          }
        </h6>
      </main>
    </>
  )
}

export default Home
