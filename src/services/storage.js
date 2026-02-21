// ─────────────────────────────────────────────────────────────────────────────
// STORAGE SERVICE – Document & Selfie Upload
// ─────────────────────────────────────────────────────────────────────────────
import DB from './db';

const BUCKET = 'kyc-documents';

/**
 * Upload a document file to Supabase Storage
 * @returns {{ url: string, path: string }}
 */
export async function uploadDocument(file, userId) {
    const ext = file.name.split('.').pop();
    const path = `${userId}/doc_${Date.now()}.${ext}`;
    return DB.uploadFile(BUCKET, path, file);
}

/**
 * Upload a selfie image to Supabase Storage
 * @returns {{ url: string, path: string }}
 */
export async function uploadSelfie(file, userId) {
    const ext = file.name.split('.').pop();
    const path = `${userId}/selfie_${Date.now()}.${ext}`;
    return DB.uploadFile(BUCKET, path, file);
}
