// ClientComponent.jsx
'use client'; // Add this directive at the top of the file

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileUrl(data.fileUrl);
      } else {
        throw new Error('Error uploading file');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Upload PDF</h1>
        <form onSubmit={handleSubmit} className="mb-4 w-full max-w-md">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full py-2 px-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {fileUrl && (
          <div className="mb-4">
            <p className="text-lg font-semibold mb-2">File URL:</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              {fileUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}