import {useEffect, useState} from "react";
import {Button, Switch} from "@gravity-ui/uikit";
import {useForm} from "react-hook-form";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText} from "@/ui/components/form-field/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";

const TABS = [
    {key: 'profile', label: 'Profile', icon: 'users'},
    {key: 'security', label: 'Security', icon: 'shield-check'},
    {key: 'notifications', label: 'Notifications', icon: 'bell'},
    {key: 'platform', label: 'Platform', icon: 'globe'},
]

export default function AdminSettingsPage() {
    const {setHeader} = useHeader()
    const [tab, setTab] = useState('profile')
    const {register, handleSubmit} = useForm({
        defaultValues: {
            fullName: 'Admin User',
            email: 'admin@iteach.uz',
            phoneNumber: '+998901111111',
        },
    })

    useEffect(() => {
        setHeader({title: 'Settings'})
    }, [setHeader])

    return (
        <div style={{display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20}}>
            <SectionCard padding={12} gap={4}>
                {TABS.map(t => (
                    <button
                        key={t.key}
                        type={'button'}
                        onClick={() => setTab(t.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: tab === t.key ? 'var(--it-green-tint)' : 'transparent',
                            color: tab === t.key ? 'var(--it-green)' : 'var(--it-text-primary)',
                            border: 'none',
                            fontSize: 14,
                            fontWeight: tab === t.key ? 600 : 400,
                            textAlign: 'left',
                            cursor: 'pointer',
                        }}
                    >
                        <Icon name={t.icon} size={16}
                              color={tab === t.key ? 'var(--it-green)' : 'var(--it-text-secondary)'}/>
                        {t.label}
                    </button>
                ))}
            </SectionCard>

            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                {tab === 'profile' && (
                    <>
                        <SectionCard title={'Profile'}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                                <Avatar initials={'A'} palette={'green'} size={72}/>
                                <Button view={'outlined'}>
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                                        <Icon name={'upload'} size={14}/> Upload Photo
                                    </span>
                                </Button>
                            </div>
                        </SectionCard>
                        <SectionCard>
                            <form
                                onSubmit={handleSubmit(() => {
                                })}
                                style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}
                            >
                                <FormText label={'Full Name'} {...register('fullName')}/>
                                <FormText label={'Email'} {...register('email')}/>
                                <FormText label={'Phone'} {...register('phoneNumber')}/>
                            </form>
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Button
                                    view={'action'}
                                    size={'l'}
                                >
                                    Save
                                </Button>
                            </div>
                        </SectionCard>
                    </>
                )}

                {tab === 'security' && (
                    <SectionCard title={'Change Password'}>
                        <FormText label={'Current Password'} type={'password'}/>
                        <FormText label={'New Password'} type={'password'}/>
                        <FormText label={'Confirm Password'} type={'password'}/>
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button view={'action'} size={'l'}>
                                Update Password
                            </Button>
                        </div>
                    </SectionCard>
                )}

                {tab === 'notifications' && (
                    <SectionCard title={'Email Notifications'}>
                        <ToggleRow label={'New teacher registrations'}/>
                        <ToggleRow label={'New student enrollments'}/>
                        <ToggleRow label={'Payment events'}/>
                        <ToggleRow label={'Weekly summary'}/>
                    </SectionCard>
                )}

                {tab === 'platform' && (
                    <SectionCard title={'Platform Settings'}>
                        <FormText label={'Platform Name'} value={'iTeach'} readOnly/>
                        <FormText label={'Support Email'} value={'support@iteach.uz'}/>
                        <FormText label={'Default Locale'} value={'uz'}/>
                    </SectionCard>
                )}
            </div>
        </div>
    )
}

function ToggleRow({label}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: '1px solid var(--it-border)',
            }}
        >
            <span style={{fontSize: 14}}>{label}</span>
            <Switch defaultChecked/>
        </div>
    )
}
