// app/layout.tsx
import './globals.css'; // Ensure the path is correct

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>PDF Uploader</title>
        <meta name="description" content="Upload PDF files to Airtable" />
      </head>
      <body>{children}</body>
    </html>
  );
}