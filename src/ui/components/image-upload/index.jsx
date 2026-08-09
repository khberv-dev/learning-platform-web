import {useRef, useState} from 'react'
import {Icon} from '@/ui/components/icon/index.jsx'
import {cdnUrl} from '@/services/config.js'

// The dropzone is a <button> rather than a <label> wrapping the input: a label
// also fires when an enclosing FormField label is clicked, which opened the file
// picker on stray clicks. The picker is now only reachable through this button.

export function ImageUpload({value, onChange, hint = 'Click to upload an image.', accept = 'image/*'}) {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState(null)

    const url = preview || (typeof value === 'string' ? cdnUrl(value) : null)

    const onPick = (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        setPreview(URL.createObjectURL(file))
        onChange?.(file)
    }

    return (
        <>
            <input ref={inputRef} type="file" accept={accept} hidden onChange={onPick}/>
            <button type="button" className="it-upload" onClick={() => inputRef.current?.click()}>
                {url ? (
                    <img src={url} alt="" style={{maxHeight: 140, borderRadius: 8, objectFit: 'cover'}}/>
                ) : (
                    <>
                        <Icon name="image-up" size={28}/>
                        <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>Upload image</span>
                    </>
                )}
                <span className="it-upload__hint">{hint}</span>
            </button>
        </>
    )
}

export function FileUpload({onChange, hint = 'Click to upload a file.', accept, icon = 'upload-cloud', label = 'Upload file'}) {
    const inputRef = useRef(null)
    const [name, setName] = useState(null)

    const onPick = (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        setName(file.name)
        onChange?.(file)
    }

    return (
        <>
            <input ref={inputRef} type="file" accept={accept} hidden onChange={onPick}/>
            <button type="button" className="it-upload" onClick={() => inputRef.current?.click()}>
                <Icon name={icon} size={28}/>
                <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>{name ?? label}</span>
                <span className="it-upload__hint">{hint}</span>
            </button>
        </>
    )
}

export default ImageUpload
