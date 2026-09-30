import {formatBytes} from '@/shared/utils/format.js';

// Upload constraints enforced client-side. The API accepts anything of the
// right MIME family (image/*, video/*) with no size cap of its own, so a bad
// pick here would otherwise only be caught by a slow failed upload.
export const IMAGE_RULES = {
    mimeTypes: ['image/png', 'image/jpeg'],
    maxBytes: 1.5 * 1024 * 1024,
    label: 'PNG, JPG',
};

export const VIDEO_RULES = {
    mimeTypes: ['video/mp4'],
    maxBytes: 2 * 1024 * 1024 * 1024,
    label: 'MP4',
};

// Lesson materials. The API accepts exactly these (by MIME, falling back to
// the extension) and caps nothing, so the size limit is ours. `extensions`
// covers browsers that report an empty or generic MIME for Word files.
export const DOCUMENT_RULES = {
    mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['.pdf', '.doc', '.docx'],
    maxBytes: 50 * 1024 * 1024,
    label: 'PDF, DOC, DOCX',
};

// Returns null when `file` satisfies `rules`, or {key, vars} for `t()`
// describing why not.
export function validateFile(file, rules) {
    const name = file.name.toLowerCase();
    const typeAccepted =
        rules.mimeTypes.includes(file.type) || Boolean(rules.extensions?.some((ext) => name.endsWith(ext)));
    if (!typeAccepted) {
        return {key: 'upload.invalidType', vars: {types: rules.label}};
    }
    if (file.size > rules.maxBytes) {
        return {key: 'upload.tooLarge', vars: {size: formatBytes(rules.maxBytes)}};
    }
    return null;
}
