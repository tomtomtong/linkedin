'use client';

import { useState } from 'react';
import axios from 'axios';
import { PDFImage } from 'pdf-image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' && selectedFile.size <= 10 * 1024 * 1024) { // 10MB limit
        setFile(selectedFile);
      } else {
        setMessage('Please select a valid PDF file (up to 10MB).');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file');
      return;
    }

    const pdfImage = new PDFImage(file, {
      outputDirectory: '/tmp',
      convertOptions: {
        '-quality': '100',
      },
    });

    try {
      const imagePaths = await pdfImage.convertFile();
      const imageFile = await fetch(imagePaths[0]).then(res => res.blob());
      const imageFileName = imagePaths[0].split('/').pop();

      const formData = new FormData();
      formData.append('file', new File([imageFile], imageFileName!, { type: 'image/jpeg' }));

      // Upload image to your server to get the URL
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadResponse.data.url; // Assuming your server returns the URL of the uploaded image

      // Upload image to Wordware API
      const wordwareResponse = await axios.post(
        'https://app.wordware.ai/api/released-app/6de040fa-108d-4f32-93b4-d7c33a19d250/run',
        {
          inputs: {
            "input image": {
              type: "image",
              url: imageUrl,
            },
          },
          version: "^1.0",
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WORDWARE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage('Image uploaded successfully to Wordware API.');
    } catch (error) {
      setMessage('Error converting or uploading file');
    }
  };

  return (
    <div>
      <h1>PDF to Image Uploader</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}