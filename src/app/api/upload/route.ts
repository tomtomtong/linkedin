import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  let client;
  try {
    const fileData = await file.arrayBuffer();

    client = await pool.connect();

    // Create a table to store the files if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        file_name TEXT,
        file_data BYTEA
      )
    `);

    // Insert the file data into the table
    const query = {
      text: 'INSERT INTO files (file_name, file_data) VALUES ($1, $2) RETURNING id',
      values: [file.name, Buffer.from(fileData)],
    };
    const result = await client.query(query);
    const fileId = result.rows[0].id;

    // Generate the file URL
    const fileUrl = `${req.nextUrl.origin}/api/get-file?fileId=${fileId}`;

    return NextResponse.json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error uploading file to PostgreSQL:', error);
    return NextResponse.json({ error: 'Error uploading file to PostgreSQL' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}