'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploadedFileUrl(data.fileUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Image Upload App</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit" disabled={!file}>
          Upload
        </button>
      </form>
      {uploadedFileUrl && (
        <div>
          <h2>Uploaded Image:</h2>
          <img src={uploadedFileUrl} alt="Uploaded file" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}