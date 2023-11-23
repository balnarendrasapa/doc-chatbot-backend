import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const FileTable = require('./database');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const app = express();
const port = 3000;

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const guid = uuidv4();
  const fileData = {
    filename: req.file.originalname,
    guid: guid,
    fileData: req.file.buffer,
  };

  FileTable.create(fileData)
    .then(() => {
      res.json({ message: 'File uploaded successfully', guid: guid });
    })
    .catch((err: any) => {
      res.status(500).json({ message: 'Error uploading file', error: err });
    });
});

app.get('/showfile/:guid', (req, res) => {
  const guid = req.params.guid;

  FileTable.findOne({ where: { guid: guid } })
    .then((file: any) => {
      if (!file) {
        res.status(404).json({ message: 'File not found' });
        return;
      }

      const filename = file.filename;
      const fileGuid = file.guid;

      res.json({ message: 'File retrieved successfully', filename: filename, guid: fileGuid });

    })
    .catch((err: any) => {
      res.status(500).json({ message: 'Error retrieving file', error: err });
    });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

