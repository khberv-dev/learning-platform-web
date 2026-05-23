import {useEffect, useRef} from 'react'
import {useForm} from 'react-hook-form'
import {useHeader} from '@/providers/header.jsx'
import {useAuth} from '@/providers/auth.jsx'
import {useUploadTeacherIntro} from '@/services/teacher/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {fullName} from '@/utils/lib.js'
import {toaster} from '@/services/toaster.js'

export function TeacherSettingsPage() {
    const {setHeader} = useHeader()
    const {user, logout} = useAuth() ?? {}
    const introInput = useRef(null)
    const upload = useUploadTeacherIntro({
        onSuccess: () => toaster.add({name: 'video-up', content: 'Intro video updated.', theme: 'success', timeout: 3000}),
    })

    useEffect(() => { setHeader({title: 'Settings'}); return () => setHeader({}) }, [setHeader])

    const profile = useForm({
        defaultValues: {firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', profession: ''},
        values: {firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', profession: user?.teacher?.profession ?? ''},
    })

    const onIntroChange = (e) => {
        const f = e.target.files?.[0]
        if (f) upload.mutate(f)
    }

    return (
        <>
            <Card padding={28} gap={24}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <Avatar name={fullName(user)} src={user?.avatar} size={64} fontSize={22}/>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 700}}>{fullName(user) || 'Teacher'}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Update your public profile.</div>
                    </div>
                </div>
                <div style={{height: 1, background: 'var(--it-border-row)'}}/>
                <Row>
                    <FormField label="First Name"><Input {...profile.register('firstName')}/></FormField>
                    <FormField label="Last Name"><Input {...profile.register('lastName')}/></FormField>
                </Row>
                <Row>
                    <FormField label="Email"><Input leftIcon="mail" {...profile.register('email')}/></FormField>
                    <FormField label="Profession"><Input leftIcon="book-open" {...profile.register('profession')}/></FormField>
                </Row>
                <FormField label="Bio (Optional)">
                    <Textarea rows={3} placeholder="Tell students about yourself..."/>
                </FormField>
                <div>
                    <Button size="lg" onClick={() => toaster.add({name: 'me-soon', content: 'Self-edit endpoint pending.', theme: 'info', timeout: 3000})}>
                        Save Profile
                    </Button>
                </div>
            </Card>

            <Card padding={28} gap={16}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <div style={{width: 44, height: 44, borderRadius: 10, background: 'var(--it-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name="video" color="var(--it-info-text)" size={20}/>
                    </div>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 700}}>Intro Video</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>A short clip students see on your profile.</div>
                    </div>
                </div>
                <input ref={introInput} type="file" accept="video/*" hidden onChange={onIntroChange}/>
                <Button variant="secondary" size="md" leftIcon="upload" onClick={() => introInput.current?.click()} disabled={upload.isPending}>
                    {upload.isPending ? 'Uploading…' : 'Upload Intro Video'}
                </Button>
            </Card>

            <Card padding={[20, 24]} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderColor: 'var(--it-danger-soft)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: 10, background: 'var(--it-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name="log-out" color="var(--it-danger-text)" size={20}/>
                    </div>
                    <div>
                        <div style={{fontSize: 14, fontWeight: 700}}>Sign Out</div>
                        <div style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>You will need to sign in again.</div>
                    </div>
                </div>
                <Button variant="danger" size="md" onClick={logout}>Sign Out</Button>
            </Card>
        </>
    )
}
function Row({children}) {
    return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>{children}</div>
}

export default TeacherSettingsPage
