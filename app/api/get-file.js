import { Pool } from 'pg';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { fileId } = req.query;

    try {
      // Connect to the PostgreSQL database
      const pool = new Pool({
        connectionString: 'postgresql://Linkedin_owner:06XfYozAUnvu@ep-proud-sun-a54gdm27.us-east-2.aws.neon.tech/Linkedin?sslmode=require',
      });

      // Retrieve the file data from the database
      const query = {
        text: 'SELECT file_name, file_data FROM files WHERE id = $1',
        values: [fileId],
      };
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        res.status(404).json({ message: 'File not found' });
        return;
      }

      const { file_name, file_data } = result.rows[0];

      // Set the appropriate headers for the file
      res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Send the file data as the response
      res.status(200).send(file_data);
    } catch (error) {
      console.error('Error retrieving file from PostgreSQL:', error);
      res.status(500).json({ message: 'Error retrieving file from PostgreSQL' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}