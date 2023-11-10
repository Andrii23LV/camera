'use client';

import React, { useState, useRef, useEffect } from "react";

export default function Home() {
  const [cameraList, setCameraList] = useState<any>([]);
  const [deviceList, setDeviceList] = useState<any>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const videoRef = useRef<any>();

  useEffect(() => {
    // Отримати список доступних камер під час завантаження компонента
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log(devices);
      setDeviceList(devices);

      const cameras: any = devices.filter((device) => device.kind === "videoinput");
      setCameraList(cameras);
      // Вибрати першу камеру як обрану за замовчуванням
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCamera) {
      // Перезавантажити потік відео при зміні обраної камери
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: selectedCamera.deviceId,
            facingMode: "user" // "user" for front camera, "environment" for rear camera
          }
        })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => console.error("Error accessing camera:", error));
    }
  }, [selectedCamera]);

  const switchCamera = () => {
    if (cameraList.length > 1) {
      const currentIndex = cameraList.findIndex(
        (camera: any) => camera === selectedCamera
      );
      const nextIndex = (currentIndex + 1) % cameraList.length;
      setSelectedCamera(cameraList[nextIndex]);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />

      <button onClick={switchCamera} className="border-2 p-2">Switch Camera</button>

      <p className="ml-2">{cameraList.length}</p>

      <div>{deviceList.map((item: any, i: number) => <div key={i}><p>{item.kind} - {item.label}</p></div>)}</div>
    </div >
  );
}
