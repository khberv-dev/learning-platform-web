import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {useSignIn} from '@/services/auth/query.js'

export function LoginPage() {
    const [mode, setMode] = useState('email')
    const navigate = useNavigate()

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        defaultValues: {email: '', phoneNumber: '', password: ''},
    })

    const signIn = useSignIn({
        onSuccess: () => navigate('/'),
    })

    const onSubmit = (values) => {
        const payload = mode === 'email'
            ? {email: values.email, password: values.password}
            : {phoneNumber: '998' + String(values.phoneNumber).replace(/\D/g, '').slice(-9), password: values.password}
        signIn.mutate(payload)
    }

    const switchMode = (next) => {
        if (next === mode) return
        reset({email: '', phoneNumber: '', password: ''})
        setMode(next)
    }

    return (
        <div style={{display: 'flex', minHeight: '100vh', background: '#FFFFFF'}}>
            <LeftPanel/>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24}}>
                <form onSubmit={handleSubmit(onSubmit)} style={{width: 420, display: 'flex', flexDirection: 'column', gap: 36}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <h1 style={{fontSize: 32, fontWeight: 700, color: 'var(--it-text-primary)'}}>Welcome back</h1>
                        <p style={{fontSize: 15, color: 'var(--it-text-secondary)'}}>
                            Sign in with your {mode === 'email' ? 'email address' : 'phone number'}
                        </p>
                    </div>
                    <div className="it-tabs">
                        <div className={`it-tab ${mode === 'email' ? 'it-tab--active' : ''}`} onClick={() => switchMode('email')}>
                            Email
                        </div>
                        <div className={`it-tab ${mode === 'phone' ? 'it-tab--active' : ''}`} onClick={() => switchMode('phone')}>
                            Phone Number
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                        {mode === 'email' ? (
                            <FormField label="Email Address" error={errors.email?.message}>
                                <Input
                                    leftIcon="mail"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    invalid={!!errors.email}
                                    {...register('email', {required: 'Email is required'})}
                                />
                            </FormField>
                        ) : (
                            <FormField label="Phone Number" error={errors.phoneNumber?.message}>
                                <div className="it-input it-input--lg">
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, paddingRight: 12, borderRight: '1px solid var(--it-border-strong)', color: 'var(--it-text-body)', fontSize: 14}}>
                                        🇺🇿 +998
                                    </span>
                                    <input
                                        type="tel"
                                        className="it-input__el"
                                        placeholder="90 123 45 67"
                                        autoComplete="tel"
                                        {...register('phoneNumber', {required: 'Phone is required', minLength: {value: 9, message: '9 digits'}})}
                                    />
                                </div>
                            </FormField>
                        )}
                        <FormField label="Password" error={errors.password?.message}>
                            <Input
                                type="password"
                                leftIcon="lock"
                                placeholder="Enter password"
                                autoComplete="current-password"
                                invalid={!!errors.password}
                                {...register('password', {required: 'Password is required'})}
                            />
                        </FormField>
                    </div>
                    <Button type="submit" size="xl" full leftIcon="log-in" disabled={signIn.isPending}>
                        {signIn.isPending ? 'Signing in…' : 'Sign In'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

function LeftPanel() {
    return (
        <aside style={{
            width: 580,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 48,
            background: 'var(--it-green)',
            color: '#FFFFFF',
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{width: 36, height: 36, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--it-green)', fontWeight: 700, fontSize: 20}}>
                    i
                </div>
                <span style={{fontSize: 22, fontWeight: 700}}>iTeach</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460}}>
                <h2 style={{fontSize: 38, fontWeight: 700, lineHeight: 1.2}}>Modern Learning Platform</h2>
                <p style={{fontSize: 17, lineHeight: 1.6, opacity: 0.85}}>
                    Empowering teachers and students to grow together.
                </p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.15)'}}/>
                <div style={{width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.1)'}}/>
                <span style={{fontSize: 12, opacity: 0.6}}>© 2025 iTeach</span>
            </div>
        </aside>
    )
}

export default LoginPage
