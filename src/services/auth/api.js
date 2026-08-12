import {apiClient} from '@/services/api.js';

// The API accepts either `email` or `phoneNumber` (whichever is present wins in
// SignInRequest's ValidateIf pair). Staff accounts are created with a phone
// number, so that's what the login form collects.
export async function signIn({phoneNumber, password}) {
    const res = await apiClient.post('auth/sign-in', {phoneNumber, password});
    return res.data;
}
