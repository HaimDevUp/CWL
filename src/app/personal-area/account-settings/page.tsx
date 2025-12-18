'use client';

import { FieldsCard, RepeatFieldsCard, Field } from '@/components/inputs';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getOptions, updateContactInfo } from '@/api/user';
import { showSuccess, showError } from '@/utils/toastUtils';
import { Vehicle, type ProfileUpdate } from '@/schemas/profileSchemas';
import { usePopup } from "@/contexts/PopupContext";
import { BasicPopUp } from '@/components/UI/popup/BasicPopUp';
import './account-settings.scss';
import { z } from 'zod';
import { Loader } from '@/components/UI/Loader';
interface FormData {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    email: string;
    phone: string;
    driversLicense: string;
    companyId: number | null;

    state: string;
    city: string;
    street: string;
    postCode: string;

    vehicles:
    {
        plate: string;
        permit: string;
        tollTag: string;
        cardNumber: string;

    }[];

}

const initialFormData: FormData = {

    firstName: '',
    lastName: '',
    gender: '',
    birthday: '',
    email: '',
    phone: '',
    driversLicense: '',
    companyId: null,
    state: '',
    city: '',
    street: '',
    postCode: '',

    vehicles: [
        {
            plate: '',
            permit: '',
            tollTag: '',
            cardNumber: '',
        }
    ],
};

export default function AccountSettingsPage() {
    const { getContactInfo, user, getVehicles } = useUserProfile();
    const { updateUser, lookUpOptions } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const contactInfo = getContactInfo();
    const vehiclesSectionRef = useRef<HTMLDivElement>(null);
    const vehicles = getVehicles();
    // const vehicles = [
    //     {
    //         plate: '1234567890',
    //         permit: 'Permit Type11',
    //         tollTag: 'Toll Tag11',
    //         cardNumber: 'Card Number11',
    //     },
    //     {
    //         plate: '12435435',
    //         permit: 'Permit Type22  ',
    //         tollTag: 'Toll Tag22',
    //         cardNumber: 'Card Number22',
    //     },
    // ];
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const { open, close } = usePopup();
    const [isDirty, setIsDirty] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const handleSaveRef = useRef<() => Promise<boolean>>(async () => false);
    const [initialOpenVehicleIndex, setInitialOpenVehicleIndex] = useState<number | null>(null);
    const hasScrolledRef = useRef(false);

    useEffect(() => {
        setIsLoading(true);
        const { contact, billingAddress } = contactInfo;
        console.log('contactInfo', contactInfo);
        if (contactInfo) {
            const birthday = contact?.birthday
                ? new Date(contact.birthday).toISOString().split('T')[0]
                : '';

            setFormData({
                firstName: contact?.firstName || '',
                lastName: contact?.lastName || '',
                gender: contact?.gender || '',
                birthday: birthday,
                email: contact?.email || '',
                phone: contact?.phone || '',
                driversLicense: contact?.driversLicense || '',
                companyId: contact?.companyId || null,

                state: billingAddress?.state || '',
                city: billingAddress?.city || '',
                street: billingAddress?.street || '',
                postCode: billingAddress?.postCode || '',

                vehicles: vehicles.map((vehicle) => ({
                    plate: vehicle.plate || '',
                    permit: vehicle.permit || '',
                    tollTag: vehicle.tollTag || '',
                    cardNumber: vehicle.cardNumber || '',
                })),
            });
            setIsLoading(false);
            setIsDirty(false);
        }
    }, []);

    // Handle vehicle plate from query parameter
    useEffect(() => {
        const vehiclePlate = searchParams.get('vehiclePlate');
        if (vehiclePlate && vehicles.length > 0 && !hasScrolledRef.current) {
            const vehicleIndex = vehicles.findIndex(v => v.plate === vehiclePlate);

            // If vehicle found, open its accordion
            if (vehicleIndex !== -1) {
                setInitialOpenVehicleIndex(vehicleIndex);
            }

            hasScrolledRef.current = true;
            setTimeout(() => {
                vehiclesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);

            router.replace('/personal-area/account-settings', { scroll: false });
        } else if (!vehiclePlate) {
            hasScrolledRef.current = false;
        }
    }, [searchParams, formData, router]);

    const updateField = (field: keyof FormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field when user starts typing
        setErrors(prev => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
        console.log('isDirty1', isDirty);

        setIsDirty(true);
    };

    const updateVehicleField = (field: keyof Vehicle, index: number) => (value: string) => {
        setFormData(prev => ({ ...prev, vehicles: prev.vehicles.map((vehicle, i) => i === index ? { ...vehicle, [field]: value } : vehicle) }));
        console.log('isDirty2', isDirty);
        setIsDirty(true);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.gender.trim()) {
            newErrors.gender = 'Gender is required';
        }

        if (!formData.birthday.trim()) {
            newErrors.birthday = 'Date of birth is required';
        }

        if (z.string().email().safeParse(formData.email).error) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.driversLicense.trim()) {
            newErrors.driversLicense = 'Driver’s license number is required';
        } else if (z.string().regex(/^\d{9}$/).safeParse(formData.driversLicense.trim()).error) {
            newErrors.driversLicense = 'Driver’s license number must be 9 digits';
        }

        if (!formData.companyId) {
            newErrors.companyId = 'Company name is required';
        }


        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.street.trim()) {
            newErrors.street = 'Street is required';
        }

        if (!formData.postCode.trim()) {
            newErrors.postCode = 'Post code is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (): Promise<boolean> => {
        if (!validateForm()) {
            console.log("errors", errors);
            return false;
        }

        setIsLoading(true);
        try {
            const updateData: ProfileUpdate = {
                contact: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    gender: formData.gender,
                    birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
                    driversLicense: formData.driversLicense,
                    companyId: formData.companyId,
                },
                billingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postCode: formData.postCode,
                },
            };
            const updatedProfile = await updateContactInfo(updateData);
            await updateUser(updatedProfile.customer);
            setIsLoading(false);
            showSuccess('Profile updated successfully!');
            setIsDirty(false);
            // If there is a queued navigation after save, proceed
            if (pendingHref) {
                const href = pendingHref;
                setPendingHref(null);
                router.push(href);
            }
            return true;
        } catch (error: any) {
            showError(error || 'Failed to update profile. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Keep latest handleSave in a ref to avoid stale closures in popup button handlers
    useEffect(() => {
        handleSaveRef.current = handleSave;
    }, [handleSave]);

    const handleCancel = () => {
        const { contact, billingAddress } = contactInfo;
        if (contactInfo) {
            const birthday = contact?.birthday
                ? new Date(contact.birthday).toISOString().split('T')[0]
                : '';

            setFormData({
                firstName: contact?.firstName || '',
                lastName: contact?.lastName || '',
                gender: contact?.gender || '',
                birthday: birthday,
                email: contact?.email || '',
                phone: contact?.phone || '',
                driversLicense: contact?.driversLicense || '',
                companyId: contact?.companyId || null,

                state: billingAddress?.state || '',
                city: billingAddress?.city || '',
                street: billingAddress?.street || '',
                postCode: billingAddress?.postCode || '',

                vehicles: vehicles.map((vehicle) => ({
                    plate: vehicle.plate || '',
                    permit: vehicle.permit || '',
                    tollTag: vehicle.tollTag || '',
                    cardNumber: vehicle.cardNumber || '',
                })),
            });
        }
        setErrors({});
        setIsDirty(false);
    };

    const handleUnsavedChanges = (nextHref?: string | null) => {
        const UnsavedChangesFooter: React.FC = () => {
            const onSave = async () => {
                close();
                const ok = await handleSaveRef.current();
                if (ok) {
                    if (nextHref) router.push(nextHref);
                }
            };
            const onCancel = () => {
                close();
                setIsDirty(false);
                if (nextHref) router.push(nextHref);
            };
            return (
                <>
                    <button onClick={onCancel} className="btn-primary" style={{ "--color": "var(--color-global-gray)" } as React.CSSProperties}>Exit Without Saving</button>
                    <button onClick={onSave} className="btn-primary">Save and Exit</button>
                </>
            );
        };
        open(BasicPopUp('Unsaved Changes', <div>You’ve made changes to your personal details. If you exit now, your updates will be lost.
            <br /><br />
            Would you like to save before leaving?</div>,
            <UnsavedChangesFooter />));
    };

    // Warn on browser/tab close or hard navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };
        if (isDirty) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Intercept in-app anchor navigations to show unsaved changes popup
    useEffect(() => {
        const onDocumentClickCapture = (e: MouseEvent) => {
            if (!isDirty) return;
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const anchor = target.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            // Ignore same-path clicks
            if (href === pathname) return;
            // External absolute links will cause unload anyway; still intercept to show popup
            e.preventDefault();
            e.stopPropagation();
            setPendingHref(href);
            handleUnsavedChanges(href);
        };
        document.addEventListener('click', onDocumentClickCapture, true);
        return () => document.removeEventListener('click', onDocumentClickCapture, true);
    }, [isDirty, pathname]);

    // Intercept back/forward SPA navigations
    useEffect(() => {
        const onPopState = (e: PopStateEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            // Revert navigation and show modal
            history.pushState(null, '', pathname);
            handleUnsavedChanges(null);
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [isDirty, pathname]);

    const customerFields = [
        {
            key: 'firstName',
            label: 'First Name',
            type: 'text',
            value: formData.firstName,
            isRequired: true,
            onChange: updateField('firstName'),
            error: errors.firstName,
            disabled: false,
        },
        {
            key: 'lastName',
            label: 'Last Name',
            type: 'text',
            value: formData.lastName,
            isRequired: true,
            onChange: updateField('lastName'),
            error: errors.lastName,
            disabled: false,
        },
        {
            key: 'gender',
            label: 'Gender',
            type: 'select',
            value: formData.gender,
            isRequired: true,
            onChange: updateField('gender'),
            disabled: false,
            error: errors.gender,
            options: lookUpOptions.genders,
        },
        {
            key: 'birthday',
            label: 'Date of Birth',
            type: 'date',
            value: formData.birthday,
            isRequired: true,
            error: errors.birthday,
            onChange: updateField('birthday'),
            disabled: false,
        },
        {
            key: 'email',
            label: 'Email',
            type: 'email',
            value: formData.email,
            isRequired: true,
            onChange: updateField('email'),
            error: errors.email,
            disabled: true,
        },
        {
            key: 'phone',
            label: 'Mobile Phone',
            type: 'tel',
            value: formData.phone,
            isRequired: true,
            onChange: updateField('phone'),
            error: errors.phone,
            disabled: true,
        },
        {
            key: 'driversLicense',
            label: 'Driver’s License number',
            type: 'text',
            value: formData.driversLicense,
            isRequired: true,
            onChange: updateField('driversLicense'),
            error: errors.driversLicense,
            disabled: false,
        },
        {
            key: 'companyId',
            label: 'Company Name',
            type: 'select',
            value: formData.companyId,
            isRequired: true,
            onChange: updateField('companyId'),
            error: errors.companyId,
            disabled: false,
            options: lookUpOptions.companies,
        },
    ];

    const addressFields = [
        {
            key: 'state',
            label: 'State',
            type: 'text',
            value: formData.state,
            isRequired: true,
            onChange: updateField('state'),
            error: errors.state,
            disabled: false,
        },
        {
            key: 'city',
            label: 'City',
            type: 'text',
            value: formData.city,
            isRequired: true,
            onChange: updateField('city'),
            error: errors.city,
            disabled: false,
        },
        {
            key: 'street',
            label: 'Street',
            type: 'text',
            value: formData.street,
            isRequired: true,
            onChange: updateField('street'),
            error: errors.street,
            disabled: false,
        },
        {
            key: 'postCode',
            label: 'Post Code',
            type: 'text',
            value: formData.postCode,
            isRequired: true,
            onChange: updateField('postCode'),
            error: errors.postCode,
            disabled: false,
        },

    ];

    const vehicleFields =
        formData.vehicles.map((vehicle, index) => ({
            title: vehicle.plate,
            fields: [
                {
                    key: 'licensePlate',
                    label: 'License Plate',
                    type: 'text',
                    value: vehicle.plate,
                    isRequired: true,
                    onChange: updateVehicleField('plate', index),
                },
                {
                    key: 'permitType',
                    label: 'Permit Type',
                    type: 'text',
                    value: vehicle.permit,
                    isRequired: true,
                    onChange: updateVehicleField('permit', index),
                },
                {
                    key: 'tollTag',
                    label: 'Toll Tag',
                    type: 'text',
                    value: vehicle.tollTag,
                    isRequired: true,
                    onChange: updateVehicleField('tollTag', index),
                },
                {
                    key: 'cardNumber',
                    label: 'Card Number',
                    type: 'text',
                    value: vehicle.cardNumber,
                    isRequired: true,
                    onChange: updateVehicleField('cardNumber', index),
                },
            ]
        }));


    if (isLoading) {
        return <Loader />;
    }

    return (
        <section className="personal-area--section padding">
            <div className="personal-area--section-header">
                <h4>Account Settings</h4>
            </div>

            <FieldsCard
                title="Customer Information"
                fields={customerFields as Field[]}
                isToggled={false}
            />

            <FieldsCard
                title="Address Details"
                fields={addressFields}
                isToggled={true}
                forceOpen={addressFields.some((field) => Boolean(field?.error))}
            />

            <div ref={vehiclesSectionRef}>
                <RepeatFieldsCard
                    title="Vehicle Details"
                    items={vehicleFields}
                    itemName="Vehicle"
                    initialOpenRows={initialOpenVehicleIndex !== null ? [initialOpenVehicleIndex] : []}
                />
            </div>



            <div className="account-settings-actions">
                <button onClick={handleCancel} style={{ "--color": "var(--color-global-gray)" } as React.CSSProperties} className="btn-primary">Cancel</button>
                <button disabled={isLoading} onClick={handleSave} className="btn-primary">Save Changes</button>
            </div>
        </section>
    );
}


