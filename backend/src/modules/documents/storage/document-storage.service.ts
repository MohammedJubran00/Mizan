import { createHash, randomUUID } from 'crypto';
import { createReadStream, type ReadStream } from 'fs';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
import path from 'path';

import { AppError } from '../../../shared/errors/AppError';

export interface StoredFile {
  storageKey: string;
  sizeBytes: number;
  checksum: string;
}

/**
 * Local-disk document storage.
 *
 * Storage keys are always server-generated (`<workspaceId>/<uuid>.pdf`) so a
 * client-supplied file name can never influence the path on disk.
 */
export class DocumentStorageService {
  constructor(private readonly rootDir: string) {}

  async save(params: {
    workspaceId: string;
    buffer: Buffer;
  }): Promise<StoredFile> {
    const storageKey = `${params.workspaceId}/${randomUUID()}.pdf`;
    const absolutePath = this.resolve(storageKey);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, params.buffer);

    return {
      storageKey,
      sizeBytes: params.buffer.byteLength,
      checksum: createHash('sha256').update(params.buffer).digest('hex'),
    };
  }

  createReadStream(storageKey: string): ReadStream {
    return createReadStream(this.resolve(storageKey));
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const stats = await stat(this.resolve(storageKey));
      return stats.isFile();
    } catch {
      return false;
    }
  }

  async remove(storageKey: string): Promise<void> {
    try {
      await unlink(this.resolve(storageKey));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      // A missing file should not block deleting the metadata row.
      if (code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /** Resolves a storage key inside the root, rejecting any traversal attempt. */
  private resolve(storageKey: string): string {
    const absolutePath = path.resolve(this.rootDir, storageKey);
    const root = path.resolve(this.rootDir);

    if (absolutePath !== root && !absolutePath.startsWith(root + path.sep)) {
      throw new AppError(400, 'Invalid document storage reference.');
    }

    return absolutePath;
  }
}
