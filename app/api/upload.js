import { IncomingForm } from 'formidable';
import fs from 'fs';
import { Pool } from 'pg';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: 'Error parsing the files' });
        return;
      }

      const file = files.file;
      const filePath = file.filepath;
      const fileData = fs.readFileSync(filePath);

      try {
        // Connect to the PostgreSQL database
        const pool = new Pool({
          connectionString: 'postgresql://Linkedin_owner:06XfYozAUnvu@ep-proud-sun-a54gdm27.us-east-2.aws.neon.tech/Linkedin?sslmode=require',
        });

        // Create a table to store the files if it doesn't exist
        await pool.query(`
          CREATE TABLE IF NOT EXISTS files (
            id SERIAL PRIMARY KEY,
            file_name TEXT,
            file_data BYTEA
          )
        `);

        // Insert the file data into the table
        const query = {
          text: 'INSERT INTO files (file_name, file_data) VALUES ($1, $2) RETURNING id',
          values: [file.originalFilename, fileData],
        };
        const result = await pool.query(query);
        const fileId = result.rows[0].id;

        // Generate the file URL
        const fileUrl = `${req.headers.origin}/api/get-file?fileId=${fileId}`;

        res.status(200).json({ message: 'File uploaded successfully', fileUrl });
      } catch (error) {
        console.error('Error uploading file to PostgreSQL:', error);
        res.status(500).json({ message: 'Error uploading file to PostgreSQL' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}