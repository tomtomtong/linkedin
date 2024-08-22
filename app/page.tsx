// app/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'patpBNGYBDzsqAZ9g.73721a412e8b694ef292c7bed9c58e628145611a6a0bd84cd2e41ab6d90e0640' }).base('app4VlUW2KU0yo82z');

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);

      // After successful file upload, store information in Airtable
      base('Table 1').create([
        {
          "fields": {
            "FileName": file.name,
            "UploadStatus": "Success",
            "UploadMessage": response.data.message,
          }
        }
      ], function (err, records) {
        if (err) {
          console.error(err);
          setMessage('File uploaded but failed to store information in Airtable.');
          return;
        }
        records?.forEach(function (record) {
          console.log(record.getId());
        });
        setMessage('File uploaded successfully and information stored in Airtable.');
      });

    } catch (error) {
      setMessage('Error uploading file');
    }
  };

  return (
    <div>
      <h1>PDF Uploader</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}