import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head'
import Script from 'next/script';
import io from 'socket.io-client';
import { Alert } from '@mui/material'
import { Device, PopupDownload, RadioButton, SelectUsers } from '../../Components';
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
  const [onSelectUser, setOnSelectUser] = useState<boolean>(false);
  const [isInRoom, setIsInRoom] = useState<boolean>(false);

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
    });

    newSocket.on('connect_error', (err: any) => {
      setError("Connection error, please try again by refreshing the page.");
      setConnected(false);
    });

    newSocket.on('disconnect', () => {
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

    newSocket.on("roomCreated", (data) => {
      setIsInRoom(true);
      setOnSelectUser(false);
    });
  };

  const handleCreateRoom = (users: any[]) => {
    setOnSelectUser(false);
    setIsInRoom(true);
    mySocket.emit('createRoom', {
      users: users,
    });
  }

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

        {onSelectUser &&
          <SelectUsers
          users={users}
          onCreate={handleCreateRoom}
          myName={myUsername}
          onClose={() => setOnSelectUser(false)}
          />
        }

        <RadioButton
          value={privacyLevel}
          onChange={(e) => setPrivacyLevel(e)}
          nbOfUsers={users.length}
          onClick={() => setOnSelectUser(true)}
          isActive={isInRoom}
        />
        <div className='btnConnect'>
          {(!connected && error) && <button className='buttonConnect' onClick={() => connectToSocket()} onLoad={() =>  {
              console.log('onload')
          }}>Connect to Fastdrop</button>}
        </div>

        {showPopupDownload && <PopupDownload
          acceptFile={() => handleDownloadFile(filesToDownload, setShowPopupDownload, setFilesToDownload, setUserNameSender)}
          acceptUrl={(url: string) => handleGetUrl(url, setShowPopupDownload, setUserNameSender, setFilesToDownload)}
          decline={() => handleDeclineFile(setShowPopupDownload, setFilesToDownload, setUserNameSender)}
          fileName={filesToDownload}
          text={text}
          url={url}
          username={myUsername}
          popupType={popupType}
          previewUrl={previewUrl}
        />}

        {users.length < 2 ?
          <div className="title">
            <h2>{connected ? "Open Fastdrop on other devices to send files" : error ? "Failed to connect to the server" : "Try to connect to the server..."}</h2>
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
          {connected && <div className='testAnim' style={{
            opacity: users.length < 2 ? '1' : '0',
          }}>
          {
            animation.map((i) => (
              <span key={i} style={{ ['--i' as any]: i }} />
            ))
          }</div>}
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
