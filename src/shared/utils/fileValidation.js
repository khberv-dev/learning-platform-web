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

// Returns null when `file` satisfies `rules`, or {key, vars} for `t()`
// describing why not.
export function validateFile(file, rules) {
    if (!rules.mimeTypes.includes(file.type)) {
        return {key: 'upload.invalidType', vars: {types: rules.label}};
    }
    if (file.size > rules.maxBytes) {
        return {key: 'upload.tooLarge', vars: {size: formatBytes(rules.maxBytes)}};
    }
    return null;
}
