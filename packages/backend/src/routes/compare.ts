import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPDF } from '../services/pdfService.js';
import { compareDocuments } from '../services/comparisonService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post(
  '/',
  upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'heroFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.pdfFile || !files.heroFile) {
        return res.status(400).json({ error: 'Both PDF and Hero files are required' });
      }

      const pdfFile = files.pdfFile[0];
      const heroFile = files.heroFile[0];

      // Extract text from PDF
      const pdfText = await extractTextFromPDF(pdfFile.path);

      // TODO: Parse Hero file (currently reading as text)
      const heroText = ''; // This will be implemented based on Hero file format

      // Compare documents
      const comparisonResult = compareDocuments(pdfText, heroText);

      res.json({
        message: 'Documents compared successfully',
        result: comparisonResult,
        files: {
          pdf: pdfFile.originalname,
          hero: heroFile.originalname,
        },
      });
    } catch (error) {
      console.error('Comparison error:', error);
      res.status(500).json({
        error: 'Comparison failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
