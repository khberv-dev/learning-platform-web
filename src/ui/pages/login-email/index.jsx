import {useForm} from "react-hook-form";
import {useNavigate} from "react-router";
import {Button} from "@gravity-ui/uikit";
import {FormText} from "@/ui/components/form-field/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useSignIn} from "@/services/auth/query.js";

export default function LoginEmailPage() {
    const navigate = useNavigate()
    const signIn = useSignIn()

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {email: '', password: ''},
    })

    const onSubmit = (values) => {
        signIn.mutate(values, {onSuccess: () => navigate('/')})
    }


    return (<form
        onSubmit={handleSubmit(onSubmit)}
        style={{display: 'flex', flexDirection: 'column', gap: 16}}
    >
        <FormText
            label={'Email Address'}
            type={'email'}
            placeholder={'you@example.com'}
            error={errors.email?.message}
            {...register('email', {required: 'Email is required'})}
        />

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
    </form>)
}
