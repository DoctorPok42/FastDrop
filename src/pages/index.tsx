import React, { useEffect, useState } from 'react';
import Head from 'next/head'
import Script from 'next/script';
import io from 'socket.io-client';
import { Alert } from '@mui/material'
import { Device, PopupDownload, RadioButton } from '../../Components';
import { uniqueNamesGenerator, Config, adjectives, animals } from 'unique-names-generator';
import { getDeviceType, handleUpload, askForLocationPermission } from '../functions';
import { handleDownloadFile, handleGetUrl, handleDeclineFile } from '../functions/handle';

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: '-',
};

const Home = () => {
  const [users, setUsers] = useState([] as any[]);
  const [username, setUsername] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [mySocket, setMySocket] = useState<any>(null);

  const [showPopupDownload, setShowPopupDownload] = useState(false);
  const [popupType, setPopupType] = useState<'file' | 'txt' | 'url' | 'none'>('none')

  const [filesToDownload, setFilesToDownload] = useState<any[]>([]);
  const [text, setText] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [userNameSender, setUserNameSender] = useState<string>('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [privacyLevel, setPrivacyLevel] = useState<string>('1');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (privacyLevel === '1') {
      mySocket && mySocket.emit('updatePrivacyLevel', {
        name: username,
        deviceType: getDeviceType(),
        privacyLevel: privacyLevel,
        location: null,
      })
    }
    if (privacyLevel === '2') {
      askForLocationPermission(
        mySocket,
        username,
        privacyLevel,
        setError,
        setPrivacyLevel,
        getDeviceType,
      )
    }
    if (privacyLevel === '3') {
      mySocket && mySocket.emit('updatePrivacyLevel', {
        name: username,
        deviceType: getDeviceType(),
        privacyLevel: privacyLevel,
        location: null,
      })
    }
  }, [privacyLevel]);

  const connectToSocket = () => {
    var userName;
    userName = uniqueNamesGenerator(customConfig);
    setUsername(userName);

    var userList = [] as any[];
    const newSocket = io("http://localhost:3001", { secure: true, transports: ["websocket"] });
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
      setUserNameSender(username);

      var allFile = [] as any[];

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
      setUserNameSender(username);
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

    newSocket.on('textDownload', async (text: string, username: string) => {
      setUserNameSender(username);
      setText(text);
      setShowPopupDownload(true);
      setPopupType('txt');
    });

    newSocket.on('urlDownload', async (url: string, username: string) => {
      setUserNameSender(username);
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
          username={userNameSender}
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
                myName={username}
                handleSendText={(text: string) => handleUpload(mySocket, 'txt', username, device.socketId, undefined, text)}
                handleFileUpload={(files: File[]) => handleUpload(mySocket, 'file', username, device.socketId, files)}
                handleUrlUpload={(url: string) => handleUpload(mySocket, 'url', username, device.socketId, undefined, undefined, url)}
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

        {username ?
          <h4>You are known as <span>{username}</span></h4> :
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
