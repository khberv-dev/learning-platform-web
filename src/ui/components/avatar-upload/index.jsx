import {useRef, useState} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {useUploadAvatar} from '@/services/user/query.js'
import {fullName} from '@/utils/lib.js'
import {toaster} from '@/services/toaster.js'

export function AvatarUpload({user, size = 64}) {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState(null)
    const [progress, setProgress] = useState(null)
    const queryClient = useQueryClient()

    const upload = useUploadAvatar({
        onSuccess: () => {
            setProgress(null)
            queryClient.invalidateQueries({queryKey: ['user'], exact: false})
            toaster.add({name: `avatar-up-${Date.now()}`, content: 'Photo updated.', theme: 'success', timeout: 3000})
        },
    })

    const onPick = (e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (!f) return
        if (!f.type.startsWith('image/')) {
            toaster.add({name: 'avatar-type', content: 'Please choose an image file.', theme: 'danger', timeout: 4000})
            return
        }
        setPreview(URL.createObjectURL(f))
        upload.mutate({file: f, onProgress: setProgress})
    }

    const badge = Math.max(22, Math.round(size * 0.34))

    return (
        <div
            style={{position: 'relative', width: size, height: size, flexShrink: 0, cursor: upload.isPending ? 'wait' : 'pointer'}}
            onClick={(e) => { if (e.target === inputRef.current) return; !upload.isPending && inputRef.current?.click() }}
            title="Change photo"
        >
            <Avatar name={fullName(user)} src={preview ?? user?.avatar} size={size} fontSize={Math.round(size * 0.34)}/>
            {upload.isPending && progress != null && (
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: Math.max(10, Math.round(size * 0.18)), fontWeight: 700,
                }}>
                    {progress}%
                </div>
            )}
            <span
                style={{
                    position: 'absolute', right: -2, bottom: -2,
                    width: badge, height: badge, borderRadius: 999,
                    background: 'var(--it-green)', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--it-surface)',
                    boxShadow: 'var(--it-shadow-sm)',
                }}
            >
                <Icon name={upload.isPending ? 'loader' : 'camera'} size={Math.round(badge * 0.55)}/>
            </span>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick}/>
        </div>
    )
}

export default AvatarUpload
