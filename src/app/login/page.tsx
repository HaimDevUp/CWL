'use client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { otpSend, OtpSendResponse, otpVerifyAndStore } from '@/api/auth';
import './login.scss';
import EmailIcon from '@/assets/icons/email.svg';
import SmsIcon from '@/assets/icons/call.svg';
import { toastMessages } from '@/utils/toastUtils';
import {PhoneInput} from '@/components/inputs';
import { Loader } from '@/components/UI/Loader';

export default function Login() {
    const { general } = useSiteSettings();
    const { site_title, logo, assets_path } = general;
    const { login, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [loginType, setLoginType] = useState<'email' | 'sms'>('email');
    const [identifier, setIdentifier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpResponse, setOtpResponse] = useState<OtpSendResponse | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [emailError, setEmailError] = useState('');

    // Redirect to personal area if user is already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/personal-area');
        }
    }, [isAuthenticated, isLoading, router]);

    // Email validation function
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle email input change with validation
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setIdentifier(value);

        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    async function handleOtpLogin() {
        console.log(identifier, loginType);
        if (!identifier) return;

        // Validate email if login type is email
        if (loginType === 'email' && !validateEmail(identifier)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        try {
            setIsSubmitting(true);
            const otpResponse = await otpSend<OtpSendResponse>({ to: identifier.replace('+', ''), channel: loginType });
            setOtpResponse(otpResponse);
        }
        catch (e) {
            toastMessages.actionError(e as string);
        }
        finally {
            setIsSubmitting(false);
        }
    }

    const handleOtpType = (type: 'email' | 'sms') => {
        setLoginType(type);
        setOtpResponse(null);
        setOtpCode('');
        setIdentifier('');
        setEmailError('');
    }

    async function handleOtpVerify() {
        console.log(otpCode, otpResponse?.sid);
        if (!otpCode || !otpResponse?.sid) return;
        try {
            setIsSubmitting(true);
            const result = await otpVerifyAndStore({ sid: otpResponse.sid, code: otpCode });

            const accessToken = sessionStorage.getItem('accessToken');
            const refreshToken = sessionStorage.getItem('refreshToken');

            if (accessToken && refreshToken) {
                await login(accessToken, refreshToken);
                router.push('/personal-area');
            }
        }
        catch (e) {
            toastMessages.actionError("Incorrect code sent");
        }
        finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <Loader size="large" />;
    }

    return (
        <div className="login">
            <div className="container">
                <div className="login--headline">login to</div>
                <div className="login--site-title">{site_title}</div>
                <div className="login--tagline">One place to manage your parking bookings</div>

                <div className="login--form">
                    <div className="login--form-header">
                        <button disabled={isSubmitting} onClick={() => handleOtpType('email')} className={loginType === 'email' ? 'active' : ''}><EmailIcon /> with email</button>
                        <button disabled={isSubmitting} onClick={() => handleOtpType('sms')} className={loginType === 'sms' ? 'active' : ''}><SmsIcon /> with SMS</button>
                    </div>
                    <div className="login--form-body">
                        {otpResponse ? (
                            <div className="login--form-body-email">
                                <label htmlFor="otp">Enter the code</label>
                                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                                <button onClick={handleOtpVerify} disabled={isSubmitting || !identifier} className="btn-primary">{isSubmitting ? 'Sending…' : 'Send'}</button>
                            </div>
                        ) : (
                            <>
                                {loginType === 'email' && (
                                    <div className="login--form-body-email">
                                        <label htmlFor="email">your email address</label>
                                        <input
                                            type="email"
                                            value={identifier}
                                            onChange={handleEmailChange}
                                            className={emailError ? 'error' : ''}
                                        />
                                        {emailError && <span className="error-message">{emailError}</span>}
                                    </div>
                                )}
                                {loginType === 'sms' && (
                                    <div className="login--form-body-sms">
                                        <label htmlFor="phone">your phone number</label>
                                        <PhoneInput value={identifier} onChange={(e) => setIdentifier(e)} />
                                    </div>
                                )}
                                <button onClick={handleOtpLogin} disabled={isSubmitting || !identifier || (loginType === 'email' && !!emailError)} className="btn-primary">{isSubmitting ? 'Sending…' : 'Send me a login code'}</button>
                            </>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
