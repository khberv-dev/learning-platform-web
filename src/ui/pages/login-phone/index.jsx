import {useForm} from "react-hook-form";
import {useNavigate} from "react-router";
import {Button} from "@gravity-ui/uikit";
import {FormText} from "@/ui/components/form-field/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useSignIn} from "@/services/auth/query.js";
import {cleanPhoneNumber, formatPhoneNumber} from "@/utils/lib.js";

export default function LoginPhonePage() {
    const navigate = useNavigate()
    const signIn = useSignIn()

    const {register, handleSubmit, formState: {errors}, watch, setValue} = useForm({
        defaultValues: {phoneNumber: '', password: ''},
    })

    const phoneNumber = watch('phoneNumber')

    const onSubmit = (values) => {
        const payload = {...values, phoneNumber: cleanPhoneNumber(values.phoneNumber)}
        signIn.mutate(payload, {onSuccess: () => navigate('/')})
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            style={{display: 'flex', flexDirection: 'column', gap: 16}}
        >
            <FormText
                label={'Phone Number'}
                placeholder={'+998 __ ___ __ __'}
                value={formatPhoneNumber(phoneNumber)}
                onChange={(e) => setValue('phoneNumber', cleanPhoneNumber(e.target.value))}
                error={errors.phoneNumber?.message}
            />
            <input type={'hidden'} {...register('phoneNumber', {required: 'Phone is required'})}/>

            <FormText
                label={'Password'}
                type={'password'}
                placeholder={'••••••••'}
                error={errors.password?.message}
                {...register('password', {required: 'Password is required'})}
            />

            <Button
                type={'submit'}
                view={'action'}
                size={'xl'}
                loading={signIn.isPending}

            >
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                    <Icon name={'log-in'} size={16} color={'#FFFFFF'}/>
                    Sign in
                </span>
            </Button>
        </form>
    )
}
