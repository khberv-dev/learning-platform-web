import {useRef, useState} from 'react'
import {Icon} from '@/ui/components/icon/index.jsx'
import {cdnUrl} from '@/services/config.js'

export function ImageUpload({value, onChange, hint = 'Click to upload an image.', accept = 'image/*'}) {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState(null)

    const url = preview || (typeof value === 'string' ? cdnUrl(value) : null)

    const onPick = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPreview(URL.createObjectURL(file))
        onChange?.(file)
    }

    return (
        <div className="it-upload" onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept={accept} hidden onChange={onPick}/>
            {url ? (
                <img src={url} alt="" style={{maxHeight: 140, borderRadius: 8, objectFit: 'cover'}}/>
            ) : (
                <>
                    <Icon name="image-up" size={28}/>
                    <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>Upload image</span>
                </>
            )}
            <span className="it-upload__hint">{hint}</span>
        </div>
    )
}

export function FileUpload({onChange, hint = 'Click to upload a file.', accept, icon = 'upload-cloud', label = 'Upload file'}) {
    const inputRef = useRef(null)
    const [name, setName] = useState(null)

    const onPick = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setName(file.name)
        onChange?.(file)
    }

    return (
        <div className="it-upload" onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept={accept} hidden onChange={onPick}/>
            <Icon name={icon} size={28}/>
            <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>{name ?? label}</span>
            <span className="it-upload__hint">{hint}</span>
        </div>
    )
}

export default ImageUpload
