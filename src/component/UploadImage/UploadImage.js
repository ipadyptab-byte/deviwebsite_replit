import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { imagesAPI } from '../../api/client';
import './UploadImage.css';

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setStatus('');
    }
  };

  const handleUpload = () => {
    if (!image) {
      setStatus('Please select an image first.');
      return;
    }

    const storage = getStorage();
    const timestamp = new Date().getTime(); // Generate a timestamp
    const fileName = `${timestamp}_${image.name}`; // Include timestamp in the file name
    const storageRef = ref(storage, `images/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
        setStatus(`Uploading... ${progress}%`);
      },
      (error) => {
        console.error(error);
        setStatus('Upload failed. Please try again.');
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await imagesAPI.saveImage(fileName, downloadURL);
          console.log('File available at', downloadURL);
          setStatus('Upload successful!');
        } catch (error) {
          console.error('Error saving image metadata:', error);
          setStatus('Upload completed but failed to save metadata.');
        }
      }
    );
  };

  return (
    <div className="upload-container">
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
      <progress value={progress} max="100" />
      <p>{status}</p>
    </div>
  );
};

export default UploadImage;
