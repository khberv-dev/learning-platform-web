import {useRef, useState} from 'react';
import {Button, Progress} from '@gravity-ui/uikit';
import {File as FileIcon, Upload, X} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {formatBytes} from '@/shared/utils/format.js';
import {validateFile} from '@/shared/utils/fileValidation.js';

// The single-file picker used everywhere a form takes an image or video: a
// dashed drop card in place of a bare `<input type="file">`. Idle, it shows an
// upload button and (if `rules` is given) what's accepted; holding a file, it
// shows that file's name and size with a way to remove it; uploading, it
// shows a progress bar instead and locks the card until the request settles.
//
// Fully controlled (`value`/`onChange`), so it fits both an immediate-upload
// handler and a field sitting in form state until the surrounding form saves.
// `rules` (IMAGE_RULES/VIDEO_RULES from fileValidation.js) is optional - when
// given, a picked file is validated here and rejected inline rather than
// reaching `onChange` at all, so callers no longer need their own toast for it.
function FileDropCard({value, onChange, accept, rules, progress, disabled}) {
    const {t} = useI18n();
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState(null);

    const uploading = progress !== null && progress !== undefined;
    const locked = disabled || uploading;

    const pick = (fileList) => {
        const file = fileList?.[0];
        if (!file) return;

        if (rules) {
            const invalid = validateFile(file, rules);
            if (invalid) {
                setError(t(invalid.key, invalid.vars));
                return;
            }
        }
        setError(null);
        onChange(file);
    };

    const hint = rules ? `${rules.label} · ${t('upload.maxSize', {size: formatBytes(rules.maxBytes)})}` : undefined;

    return (
        <div
            style={{
                border: `1px dashed ${dragOver ? 'var(--g-color-base-brand)' : 'var(--g-color-line-generic)'}`,
                borderRadius: 8,
                padding: 16,
                background: dragOver ? 'var(--g-color-base-selection)' : 'var(--g-color-base-generic-ultralight)',
                transition: 'border-color 0.15s, background 0.15s',
            }}
            onDragOver={(event) => {
                if (locked) return;
                event.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                if (!locked) pick(event.dataTransfer.files);
            }}
        >
            {value ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <FileIcon size={28} style={{flexShrink: 0, color: 'var(--g-color-text-secondary)'}}/>
                    <div style={{flex: 1, minWidth: 0}}>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {value.name}
                        </div>
                        <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                            {formatBytes(value.size)}
                        </div>
                        {uploading && (
                            <Progress value={progress} size="xs" theme="info" style={{marginTop: 6}}/>
                        )}
                    </div>
                    {!locked && (
                        <Button
                            view="flat"
                            size="s"
                            onClick={() => onChange(null)}
                            aria-label={t('common.delete')}
                        >
                            <Button.Icon>
                                <X size={14}/>
                            </Button.Icon>
                        </Button>
                    )}
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
                    <Upload size={22} style={{color: 'var(--g-color-text-secondary)'}}/>
                    <Button size="s" onClick={() => inputRef.current?.click()} disabled={locked}>
                        {t('upload.choose')}
                    </Button>
                    {hint && (
                        <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>{hint}</div>
                    )}
                    {error && (
                        <div style={{fontSize: 12, color: 'var(--g-color-text-danger)'}}>{error}</div>
                    )}
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{display: 'none'}}
                onChange={(event) => {
                    pick(event.target.files);
                    event.target.value = '';
                }}
            />
        </div>
    );
}

export default FileDropCard;
