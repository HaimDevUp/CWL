import { AxiosRequestConfig } from 'axios';
import api from './index';
import { getUserIdFromToken } from '../utils/jwtUtils';
import { ProfileResponse, ProfileResponseSchema } from '../schemas/profileSchemas';

const AUTH_BASE_URL = '/api/v1/web/authorization';
const BASE_URL = '/api/v1/web';

// Types
export type OtpSendRequest = {
    to: string;
    channel: 'sms' | 'email';
};

export type OtpSendResponse = {
    delay: number;
    sid: string;
    ttl: number;
};

export type OtpVerifyRequest = {
    sid: string;
    code: string;
};


export type OtpLoginResponse = {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
    refreshTokenExpiresIn: number;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};

export type RefreshTokenRequest = {
    refreshToken: string;
};

export type ForgotPasswordRequest = {
    email: string;
};

export type ResetPasswordRequest = {
    token: string;
    newPassword: string;
};

// Auth Functions
export async function otpSend<T = OtpSendResponse>(payload: OtpSendRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/otp-send`, payload, config);
}

export async function otpVerify<T = unknown>(payload: OtpVerifyRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/otp-login`, payload, config);
}

// Convenience helper: verify OTP, store tokens in sessionStorage, return success status
export async function otpVerifyAndStore(payload: OtpVerifyRequest, config?: AxiosRequestConfig): Promise<{success: boolean}> {
    try {
        const res = await otpVerify<OtpLoginResponse>(payload, config);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('accessToken', res.accessToken);
            sessionStorage.setItem('refreshToken', res.refreshToken);
        }
        
        const id = getUserIdFromToken(res.accessToken);
        if (!id) {
            throw new Error('Unable to find the user');
        }
        return {success: true};
    } catch (e) {
        throw e instanceof Error ? e : new Error('OTP verification failed');

    }
}

export async function getProfile<T = ProfileResponse>(id: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(`${BASE_URL}/accounts/${id}/profile`, config);
    
    // Validate the response with Zod if it's a ProfileResponse
    if (typeof response === 'object' && response !== null && 'customer' in response) {
        return ProfileResponseSchema.parse(response) as T;
    }
    
    return response;
}




export async function login<T = unknown>(credentials: LoginRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/login`, credentials, config);
}

export async function register<T = unknown>(userData: RegisterRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/register`, userData, config);
}

export async function refreshToken<T = unknown>(payload: RefreshTokenRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/refresh-token`, payload, config);
}

export async function forgotPassword<T = unknown>(payload: ForgotPasswordRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/forgot-password`, payload, config);
}

export async function resetPassword<T = unknown>(payload: ResetPasswordRequest, config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/reset-password`, payload, config);
}

export async function logout<T = unknown>(config?: AxiosRequestConfig) {
    return api.post<T>(`${AUTH_BASE_URL}/logout`, {}, config);
}



export async function updateProfile<T = unknown>(userData: Partial<RegisterRequest>, config?: AxiosRequestConfig) {
    return api.put<T>(`${AUTH_BASE_URL}/profile`, userData, config);
}