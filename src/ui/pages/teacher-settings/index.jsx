import {useEffect, useState} from "react";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useAuth} from "@/providers/auth.jsx";
import {useUpdateTeacherIntroVideo} from "@/services/teacher/query.js";
import {getAvatarPalette, getFullName, getInitials} from "@/utils/user.js";

export default function TeacherSettingsPage() {
    const {setHeader} = useHeader()
    const {user} = useAuth() ?? {}
    const updateIntro = useUpdateTeacherIntroVideo()
    const [videoFile, setVideoFile] = useState(null)
    const [uploaded, setUploaded] = useState(null)

    useEffect(() => {
        setHeader({title: 'Settings'})
    }, [setHeader])

    const onUploadVideo = () => {
        if (!videoFile) return
        updateIntro.mutate(videoFile, {
            onSuccess: (teacher) => {
                setUploaded(teacher.introVideo)
                setVideoFile(null)
            },
        })
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720}}>
            <SectionCard title={'Profile'}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <Avatar
                        initials={user ? getInitials(user) : 'T'}
                        palette={getAvatarPalette(user?.id)}
                        size={72}
                    />
                    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <span style={{fontSize: 16, fontWeight: 700}}>{user ? getFullName(user) : 'Teacher'}</span>
                        <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                            {user?.email ?? user?.phoneNumber ?? ''}
                        </span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title={'Intro Video'}>
                <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                    Upload a short clip so students can get to know you. Replaces any existing intro.
                </span>

                {uploaded && (
                    <video
                        controls
                        style={{width: '100%', borderRadius: 10, background: '#000'}}
                        src={uploaded}
                    />
                )}

                <label
                    style={{
                        position: 'relative',
                        height: 140,
                        background: '#F9FAFB',
                        border: '1px dashed var(--it-border)',
                        borderRadius: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                    }}
                >
                    <input
                        type={'file'}
                        accept={'video/*'}
                        style={{display: 'none'}}
                        onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                    />
                    {videoFile ? (
                        <span style={{fontSize: 14, color: 'var(--it-text-primary)'}}>
                            Selected: {videoFile.name}
                        </span>
                    ) : (
                        <>
                            <Icon name={'upload'} size={24} color={'var(--it-text-secondary)'}/>
                            <span style={{fontSize: 14, color: 'var(--it-text-secondary)'}}>
                                Click to choose a video
                            </span>
                        </>
                    )}
                </label>

                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <Button
                        view={'action'}
                        size={'l'}
                        onClick={onUploadVideo}
                        disabled={!videoFile}
                        loading={updateIntro.isPending}
                    >
                        Upload Video
                    </Button>
                </div>
            </SectionCard>
        </div>
    )
}
