import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const UploadPDFPage = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPdfFile(file);
  };

  const convertPdfToImage = async () => {
    if (!pdfFile) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const pdf = await pdfjs.getDocument({ data: pdfFile }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const renderContext = { canvasContext: context, viewport };
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render(renderContext);
    const imageData = canvas.toDataURL('image/png');
    setImageData(imageData);
  };

  const uploadImage = async () => {
    if (!imageData) return;

    const formData = new FormData();
    const blob = await fetch(imageData).then((res) => res.blob());
    formData.append('file', blob);

    try {
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setFileUrl(data.fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <h1>Upload PDF and Convert to Image</h1>
      <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
      <button onClick={convertPdfToImage} disabled={!pdfFile}>
        Convert PDF to Image
      </button>
      {imageData && (
        <div>
          <h2>Converted Image Preview</h2>
          <img src={imageData} alt="Converted PDF" />
          <button onClick={uploadImage}>Upload Image</button>
        </div>
      )}
      {fileUrl && (
        <div>
          <h2>Uploaded Image URL</h2>
          <p>{fileUrl}</p>
        </div>
      )}
    </div>
  );
};

export default UploadPDFPage;