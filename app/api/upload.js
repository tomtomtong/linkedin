import axios from 'axios';
import FormData from 'form-data';
import { IncomingForm } from 'formidable';
import fs from 'fs';

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

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('type', 'upload');

      try {
        const response = await axios.post('https://api.airtable.com/v0/app4VlUW2KU0yo82z/Attachments', formData, {
          headers: {
            'Authorization': `patpBNGYBDzsqAZ9g.73721a412e8b694ef292c7bed9c58e628145611a6a0bd84cd2e41ab6d90e0640`,
            ...formData.getHeaders(),
          },
        });

        res.status(200).json({ message: 'File uploaded successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error uploading file to Airtable' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}