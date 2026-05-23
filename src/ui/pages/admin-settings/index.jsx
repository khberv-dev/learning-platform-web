import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useHeader} from '@/providers/header.jsx'
import {useAuth} from '@/providers/auth.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {fullName} from '@/utils/lib.js'
import {toaster} from '@/services/toaster.js'

export function AdminSettingsPage() {
    const {setHeader} = useHeader()
    const {user, logout} = useAuth() ?? {}
    useEffect(() => { setHeader({title: 'Settings'}); return () => setHeader({}) }, [setHeader])

    const profile = useForm({
        defaultValues: {firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? ''},
        values: {firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? ''},
    })

    const pwd = useForm({defaultValues: {current: '', next: '', confirm: ''}})

    return (
        <>
            <Card padding={28} gap={24}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <Avatar name={fullName(user)} src={user?.avatar} size={64} fontSize={22}/>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 700}}>{fullName(user) || 'Admin User'}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Update your personal information.</div>
                    </div>
                </div>
                <div style={{height: 1, background: 'var(--it-border-row)'}}/>
                <Row>
                    <FormField label="First Name"><Input {...profile.register('firstName')}/></FormField>
                    <FormField label="Last Name"><Input {...profile.register('lastName')}/></FormField>
                </Row>
                <FormField label="Email">
                    <Input leftIcon="mail" {...profile.register('email')}/>
                </FormField>
                <div>
                    <Button size="lg" onClick={profile.handleSubmit(() => toaster.add({name: 'profile-soon', content: 'Profile update endpoint not exposed yet.', theme: 'info', timeout: 3000}))}>
                        Save Profile
                    </Button>
                </div>
            </Card>

            <Card padding={28} gap={24}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <div style={{width: 44, height: 44, borderRadius: 10, background: 'var(--it-violet-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name="key-round" color="var(--it-violet-text)" size={20}/>
                    </div>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 700}}>Change Password</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Keep your account secure with a strong password.</div>
                    </div>
                </div>
                <div style={{height: 1, background: 'var(--it-border-row)'}}/>
                <Row>
                    <FormField label="Current Password"><Input type="password" {...pwd.register('current')}/></FormField>
                    <FormField label="New Password"><Input type="password" {...pwd.register('next')}/></FormField>
                </Row>
                <FormField label="Confirm New Password"><Input type="password" {...pwd.register('confirm')}/></FormField>
                <div>
                    <Button size="lg" onClick={pwd.handleSubmit(() => toaster.add({name: 'pwd-soon', content: 'Password change endpoint not exposed yet.', theme: 'info', timeout: 3000}))}>
                        Change Password
                    </Button>
                </div>
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

export default AdminSettingsPage
