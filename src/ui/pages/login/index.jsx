import {useEffect, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {PhoneInput} from '@/ui/components/phone-input/index.jsx'
import {useSignIn, useSendOtp, useRecoverPassword} from '@/services/auth/query.js'

/** The API expects 998XXXXXXXXX; PhoneInput holds the 9 national digits. */
const toApiPhone = (value) => '998' + String(value ?? '').replace(/\D/g, '').slice(-9)

export function LoginPage() {
    const [view, setView] = useState('sign-in')

    return (
        <div style={{display: 'flex', minHeight: '100vh', background: '#FFFFFF'}}>
            <LeftPanel/>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24}}>
                {view === 'sign-in'
                    ? <SignInForm onForgotPassword={() => setView('recover')}/>
                    : <RecoverForm onDone={() => setView('sign-in')}/>}
            </div>
        </div>
    )
}

function SignInForm({onForgotPassword}) {
    const [mode, setMode] = useState('email')
    const navigate = useNavigate()

    const {register, handleSubmit, control, formState: {errors}, reset} = useForm({
        defaultValues: {email: '', phoneNumber: '', password: ''},
    })

    const signIn = useSignIn({
        onSuccess: () => navigate('/'),
    })

    const onSubmit = (values) => {
        const payload = mode === 'email'
            ? {email: values.email, password: values.password}
            : {phoneNumber: toApiPhone(values.phoneNumber), password: values.password}
        signIn.mutate(payload)
    }

    const switchMode = (next) => {
        if (next === mode) return
        reset({email: '', phoneNumber: '', password: ''})
        setMode(next)
    }

    return (
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
                        <PhoneInput
                            control={control}
                            rules={{
                                required: 'Phone is required',
                                validate: v => v.replace(/\D/g, '').length === 9 || 'Enter 9 digits',
                            }}
                        />
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
                <TextLink onClick={onForgotPassword} style={{alignSelf: 'flex-end'}}>Forgot password?</TextLink>
            </div>
            <Button type="submit" size="xl" full leftIcon="log-in" disabled={signIn.isPending}>
                {signIn.isPending ? 'Signing in…' : 'Sign In'}
            </Button>
        </form>
    )
}

/**
 * Password recovery: `auth/otp/send` texts a 6-digit code, then
 * `auth/recover-password` swaps {phone, code, newPassword} for a new password.
 */
function RecoverForm({onDone}) {
    const [step, setStep] = useState('phone')
    const [cooldown, setCooldown] = useState(0)
    // Phone in API format, captured when the code is requested so the code step
    // and the resend button don't have to re-read the form.
    const [phone, setPhone] = useState('')

    const {register, handleSubmit, control, formState: {errors}} = useForm({
        defaultValues: {phoneNumber: '', code: '', newPassword: ''},
    })

    // The server allows one code per 60s per number — mirror it so the button
    // stays disabled instead of collecting a 429.
    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldown])

    const sendOtp = useSendOtp({
        onSuccess: () => {
            setStep('code')
            setCooldown(60)
        },
    })
    const recover = useRecoverPassword({onSuccess: onDone})

    const onSubmit = (values) => {
        if (step === 'phone') {
            const phoneNumber = toApiPhone(values.phoneNumber)
            setPhone(phoneNumber)
            sendOtp.mutate(phoneNumber)
            return
        }
        recover.mutate({phoneNumber: phone, code: values.code, newPassword: values.newPassword})
    }

    const phoneField = (
        <FormField label="Phone Number" error={errors.phoneNumber?.message}>
            <PhoneInput
                control={control}
                rules={{
                    required: 'Phone is required',
                    validate: v => v.replace(/\D/g, '').length === 9 || 'Enter 9 digits',
                }}
            />
        </FormField>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{width: 420, display: 'flex', flexDirection: 'column', gap: 36}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <h1 style={{fontSize: 32, fontWeight: 700, color: 'var(--it-text-primary)'}}>Reset password</h1>
                <p style={{fontSize: 15, color: 'var(--it-text-secondary)'}}>
                    {step === 'phone'
                        ? "We'll text a 6-digit code to your phone"
                        : `Enter the code sent to +${phone} and pick a new password`}
                </p>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                {step === 'phone' ? phoneField : (
                    <>
                        <FormField label="Verification Code" error={errors.code?.message}>
                            <Input
                                leftIcon="key-round"
                                placeholder="000000"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                invalid={!!errors.code}
                                {...register('code', {
                                    required: 'Code is required',
                                    pattern: {value: /^\d{6}$/, message: 'Enter the 6-digit code'},
                                })}
                            />
                        </FormField>
                        <FormField label="New Password" error={errors.newPassword?.message}>
                            <Input
                                type="password"
                                leftIcon="lock"
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                invalid={!!errors.newPassword}
                                {...register('newPassword', {
                                    required: 'Password is required',
                                    minLength: {value: 8, message: 'At least 8 characters'},
                                })}
                            />
                        </FormField>
                        <TextLink
                            disabled={cooldown > 0 || sendOtp.isPending}
                            onClick={() => sendOtp.mutate(phone)}
                            style={{alignSelf: 'flex-end'}}
                        >
                            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                        </TextLink>
                    </>
                )}
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <Button
                    type="submit"
                    size="xl"
                    full
                    leftIcon={step === 'phone' ? 'send' : 'check'}
                    disabled={sendOtp.isPending || recover.isPending}
                >
                    {step === 'phone'
                        ? (sendOtp.isPending ? 'Sending…' : 'Send Code')
                        : (recover.isPending ? 'Updating…' : 'Update Password')}
                </Button>
                <TextLink onClick={onDone} style={{alignSelf: 'center'}}>Back to sign in</TextLink>
            </div>
        </form>
    )
}

function TextLink({onClick, disabled, style, children}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 14,
                fontWeight: 600,
                color: disabled ? 'var(--it-text-tertiary)' : 'var(--it-green)',
                cursor: disabled ? 'default' : 'pointer',
                ...style,
            }}
        >
            {children}
        </button>
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
