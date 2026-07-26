import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { AppError } from '../../../shared/errors/AppError';

const PDF_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
]);

/**
 * Single-file PDF upload kept in memory.
 *
 * The global `express.json` body limit does not apply to multipart requests,
 * so the size ceiling is enforced here instead.
 */
export function createPdfUploadMiddleware(maxUploadMb: number) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxUploadMb * 1024 * 1024,
      files: 1,
    },
    fileFilter: (_req, file, callback) => {
      const isPdf =
        PDF_MIME_TYPES.has(file.mimetype) || /\.pdf$/i.test(file.originalname);

      if (!isPdf) {
        callback(new AppError(415, 'Only PDF files can be uploaded.'));
        return;
      }

      callback(null, true);
    },
  }).single('file');

  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          next(
            new AppError(413, `File exceeds the ${maxUploadMb}MB upload limit.`),
          );
          return;
        }
        next(new AppError(400, 'Invalid file upload.'));
        return;
      }

      if (error) {
        next(error);
        return;
      }

      next();
    });
  };
}
