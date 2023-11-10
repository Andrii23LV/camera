'use client';

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
// ... (залиште інші імпорти)

export default function Home() {
  const [cameraList, setCameraList] = useState<any>([]);
  const [deviceList, setDeviceList] = useState<any>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [videoStream, setVideoStream] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null); // Додано стейт для зберігання фотографії

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
          setVideoStream(stream); // Зберегти потік відео у стейт
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

  const takePhoto = () => {
    if (videoStream) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Встановити розміри canvas відповідно до розмірів відео
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Намалювати відео на canvas
      context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Отримати дані зображення у форматі base64
      const dataUrl = canvas.toDataURL("image/png");
      setImage(dataUrl);
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImage(dataUrl);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {cameraList.length > 1 ?
        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div> : <div>
          <video ref={videoRef} autoPlay playsInline />

          <button onClick={takePhoto} className="border-2 p-2">Take Photo</button>
        </div>}

      <div>{deviceList.map((item: any, i: number) => <div key={i}><p>{item.kind} - {item.label}</p></div>)}</div>

      {image && <Image src={image} alt="Captured" />}

    </div>
  );
}
