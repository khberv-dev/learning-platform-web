import {useMutation} from '@tanstack/react-query';
import {signIn} from '@/services/auth/api.js';

export const useSignIn = () => {
    return useMutation({
        mutationKey: ['auth', 'sign-in'],
        mutationFn: signIn,
    });
};
