import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    const query = {
      text: 'SELECT file_data, file_name FROM files WHERE id = $1',
      values: [fileId],
    };
    const result = await client.query(query);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { file_data, file_name } = result.rows[0];
    
    return new NextResponse(file_data, {
      headers: {
        'Content-Type': 'image/jpeg', // Adjust content type based on your file types
        'Content-Disposition': `inline; filename="${file_name}"`,
      },
    });
  } catch (error) {
    console.error('Error retrieving file from PostgreSQL:', error);
    return NextResponse.json({ error: 'Error retrieving file from PostgreSQL' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}