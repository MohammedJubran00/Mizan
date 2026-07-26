import type { Request, Response } from 'express';

import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import {
  createDocumentSchema,
  listDocumentsSchema,
  updateDocumentSchema,
} from '../dto/document-request.dto';
import type { DocumentService } from '../services/document.service';

export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = requireAuth(req);
    const query = listDocumentsSchema.parse(req.query);
    const result = await this.documentService.list(auth, query);

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Authorization, X-Workspace-Id');
    res.status(200).json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = requireAuth(req);
    const document = await this.documentService.getById(auth, documentId(req));

    res.status(200).json({ success: true, document });
  });

  upload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = requireAuth(req);

    if (!req.file) {
      throw new AppError(400, 'A PDF file is required.');
    }

    const input = createDocumentSchema.parse(req.body ?? {});
    const document = await this.documentService.upload(
      auth,
      {
        originalName: decodeFileName(req.file.originalname),
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
      },
      input,
    );

    res.status(201).json({ success: true, document });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = requireAuth(req);
    const input = updateDocumentSchema.parse(req.body);
    const document = await this.documentService.update(
      auth,
      documentId(req),
      input,
    );

    res.status(200).json({ success: true, document });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = requireAuth(req);
    await this.documentService.delete(auth, documentId(req));

    res.status(200).json({ success: true, message: 'Document deleted.' });
  });

  /**
   * Streams the stored PDF. Browsers render it inline by default so the SPA can
   * preview it; `?download=1` switches to an attachment download.
   */
  streamFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = requireAuth(req);
    const { stream, document, checksum } = await this.documentService.openFile(
      auth,
      documentId(req),
    );

    const asAttachment =
      req.query.download === '1' || req.query.disposition === 'attachment';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', document.sizeBytes.toString());
    res.setHeader(
      'Content-Disposition',
      buildContentDisposition(
        asAttachment ? 'attachment' : 'inline',
        ensurePdfExtension(document.fileName || document.title),
      ),
    );
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.setHeader('Vary', 'Authorization, X-Workspace-Id');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (checksum) {
      res.setHeader('ETag', `"${checksum.slice(0, 32)}"`);
    }

    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Unable to read document file.',
        });
        return;
      }
      res.destroy();
    });

    stream.pipe(res);
  });
}

function requireAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw new AppError(401, 'Authentication required.');
  }
  return req.auth;
}

function documentId(req: Request): string {
  const value = req.params.id;
  const id = Array.isArray(value) ? value[0] : value;

  if (!id) {
    throw new AppError(400, 'Document id is required.');
  }

  return id;
}

/** Multer reports latin1 bytes for multipart field names — restore UTF-8. */
function decodeFileName(originalName: string): string {
  return Buffer.from(originalName, 'latin1').toString('utf8');
}

function ensurePdfExtension(name: string): string {
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
}

function buildContentDisposition(
  type: 'inline' | 'attachment',
  fileName: string,
): string {
  const asciiFallback =
    fileName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_') ||
    'document.pdf';

  return `${type}; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
