'use client';
import { useOffers } from '@/hooks/useOffers';
import { OfferTile, Breakdown, PurchaseData, UploadFileRequest } from '@/schemas/productsSchemas';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader } from '@/components/UI/Loader';
import { calculateBreakdown, Purchase, validateOrder, uploadFiles } from '@/api/products';
import { BreakdownCard } from '@/components/Cards/Breakdown';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FileUploader } from '@/components/FileUploader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { FieldsCard, Field } from '@/components/inputs';
import { usePopup } from '@/contexts/PopupContext';
import { ErrorPopUp } from '@/components/UI/popup/ErrorPopUp';
import { validateEmail, validateRequired, validateDigits, validateMaxLength, updateNumericField } from '@/utils/fieldValidators';
import { LoaderPopUp } from '@/components/UI/popup/LoaderPopUp';
import { useFileUploaderContext } from '@/contexts/FileUploaderContext';
import { PaymentPopUp, PaymentSelection } from '@/components/UI/popup/PaymentPopUp';
import './details.scss';


interface FormData {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    email: string;
    phone: string;
    driversLicense: string;
    companyId: number | null;
    notifications: boolean;
    openAnAccount: boolean;
    employeeNumber: string;

    state: string;
    city: string;
    street: string;
    postCode: string;

    topUp: number;

    plate: string;
    cardNumber: string;

    marketingTerms: boolean,
    generalTerms: boolean,

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
    employeeNumber: '',
    notifications: false,
    openAnAccount: true,

    state: '',
    city: '',
    street: '',
    postCode: '',

    topUp: 0,

    plate: '',
    cardNumber: '',

    marketingTerms: false,
    generalTerms: false,
};

const DetailsPage = () => {
    const { getById } = useOffers();
    const [offer, setOffer] = useState<OfferTile | null>(null);
    const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
    const searchParams = useSearchParams();
    const offerId = searchParams.get('offerId');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { registration, getTenantAsset } = useSiteSettings();
    const { getContactInfo, user, getVehicles, isLoading: isAuthLoading } = useUserProfile();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const { lookUpOptions, isAuthenticated, login } = useAuth();
    const { open, close } = usePopup();
    const { files } = useFileUploaderContext();
    const [hasError, setHasError] = useState(false);

    const contactInfo = getContactInfo();
    const vehicles = getVehicles();


    useEffect(() => {
        if (!offerId) {
            open(ErrorPopUp('Error', <>{'Offer not found'}</>, () => { close(); router.push('/') }), { maxWidth: 400 });
            setHasError(true);
            return;
        }

        const fetchOffer = async () => {
            setIsLoading(true);
            try {
                const offer = await getById(offerId);
                if (offer) {
                    setOffer(offer);
                    const breakdownData = await calculateBreakdown(offerId, formData.topUp);
                    setBreakdown(breakdownData);
                }
                else{
                    open(ErrorPopUp('Error', <>{'Offer not found'}</>, () => { router.push('/'); close() }), { maxWidth: 400 });
                    setHasError(true);
                }
            } catch (error) {
                open(ErrorPopUp('Error', <>{'Offer not found'}</>, () => { router.push('/'); close() }), { maxWidth: 400 });    
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOffer();
    }, [offerId]);

    useEffect(() => {
        const fetchBreakdown = async () => {
            if (!offerId || !offer) return;
            try {
                open(LoaderPopUp(), { maxWidth: 400, disableClose: true });
                const breakdownData = await calculateBreakdown(offerId, formData.topUp);
                setBreakdown(breakdownData);
            } catch (error) {
                console.error('Error calculating breakdown:', error);
                open(ErrorPopUp('Error', <>{'Error calculating breakdown'}</>, () => { router.push('/'); close(); }), { maxWidth: 400 });
                setHasError(true);
            } finally {
                close();
            }
        };
        fetchBreakdown();
    }, [offer, formData.topUp]);

    useEffect(() => {
        // Wait for auth to finish loading before trying to populate form
        if (isAuthLoading) {
            return;
        }

        const { contact, billingAddress } = contactInfo;
        if (contactInfo) {
            const birthday = contact?.birthday
                ? new Date(contact.birthday).toISOString().split('T')[0]
                : '';

            setFormData(prev => ({
                ...prev,
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

                plate: vehicles[0]?.plate || '',
                cardNumber: vehicles[0]?.cardNumber || '',

            }));
        }
    }, [isAuthLoading]);

    const validateFieldCard = (fields: Field[]) => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        fields.forEach(field => {
            if (field.display !== false) {
                if (field.validation) {
                    const validationResult = field.validation;
                    if (!validationResult.isValid) {
                        newErrors[field.key as keyof FormData] = validationResult.error;
                    }
                }
                if (field.isRequired) {
                    const validationResult = validateRequired(formData[field.key as keyof FormData] as string, field.errorLabel || field.label);
                    if (!validationResult.isValid) {
                        newErrors[field.key as keyof FormData] = validationResult.error;
                    }
                }
            }
        });

        return newErrors;
    }

    const validateForm = (): boolean => {
        setErrors({});
        const customerErrors = validateFieldCard(customerFields);
        const addressErrors = validateFieldCard(addressFields);
        const vehicleErrors = validateFieldCard(vehicleFields);
        const customercheckboxesErrors = validateFieldCard(customercheckboxes);
        const checkboxsErrors = validateFieldCard(checkboxsFields);

        const newErrors = { ...customerErrors, ...addressErrors, ...vehicleErrors, ...customercheckboxesErrors, ...checkboxsErrors };

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinueToPayment = async () => {
        const isValid = validateForm();
        if (isValid) {
            try {
                const purchaseData: PurchaseData = {
                    offerId: offerId || '',
                    contact: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        gender: formData.gender || null,
                        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
                        driversLicense: formData.driversLicense || null,
                        companyId: formData.companyId,
                        employeeNumber: formData.employeeNumber,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    billingAddress: {
                        state: formData.state,
                        city: formData.city,
                        street: formData.street,
                        postCode: formData.postCode,
                    },
                    vehicles: [{
                        plate: formData.plate,
                        isDefault: true,
                    }],
                    cards: formData.cardNumber ? [
                        {
                            code: formData.cardNumber,
                            isDefault: true,
                        }
                    ] : [],
                    paymentMethod: {},
                    services: [],
                    validity: {
                        from: new Date().toISOString(),
                        to: new Date().toISOString(),
                    },
                    options: {
                        openAnAccount: formData.openAnAccount,
                        notifications: formData.notifications,
                        offerTerms: false,
                        generalTerms: formData.generalTerms,
                        marketingTerms: formData.marketingTerms,
                    },
                };

                const result = await validateOrder(purchaseData);
                if (result.success) {
                    const handleSelection = async (selection: PaymentSelection) => {
                        try {
                            setIsLoading(true);
                            const paymentMethod =
                                selection.type === 'newCard'
                                    ? { newCard: { sid: selection.sid } }
                                    : { existCard: { token: selection.token } };

                            const purchaseResult = await Purchase({ ...purchaseData, paymentMethod });
                            console.log('purchaseResult', purchaseResult);
                            if (purchaseResult.credentials.accessToken && purchaseResult.credentials.refreshToken) {
                                await login(purchaseResult.credentials.accessToken, purchaseResult.credentials.refreshToken);
                            }
                            router.push(`/thank-you?orderId=${purchaseResult.order.id}`);


                            //TODO: 
                            // if(offer?.options.files?.enabled && files.length > 0) {
                            //     const uploadFilesResult = await initiateUploadFiles();
                            // }
                            setIsLoading(false);
                        } catch (err) {
                            open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400 });
                            setHasError(true);
                        }
                    };

                    open(
                        <PaymentPopUp
                            purchaseData={purchaseData}
                            onSelect={handleSelection}
                        />,
                        { maxWidth: 400 }
                    );
                } else {
                    open(ErrorPopUp('Validation Failed', <>The order validation failed. Please check your information and try again.</>, close), { maxWidth: 400 });
                }
            } catch (error: any) {
                open(ErrorPopUp('Error', <>{error.toString()}</>, close), { maxWidth: 400 });
            }
        } else {
            open(ErrorPopUp('Form Invalid', <>It looks like one or more fields were not filled correctly, please check again.</>, close), { maxWidth: 400 });
        }
    };

    const initiateUploadFiles = async () => {
        const uploadFilesRequest: UploadFileRequest[] = files.map(file => ({
            contentType: file.data,
        }));
        const result = await uploadFiles(uploadFilesRequest);
        console.log('result', result);
        return result;
    }

    if (hasError) {
        return;
    }
    if (isLoading || !breakdown) {
        return <Loader />;
    }
    const displayBD = true;


    const updateField = (field: keyof FormData, isCheckbox: boolean = false) => (value: string | number) => {
        setFormData(prev => {
            // Special handling for topUp: toggle off (set to 0) if the same value is selected again
            if (field === 'topUp') {
                const numericValue = typeof value === 'string' ? Number(value) : value;
                const nextTopUp = prev.topUp === numericValue ? 0 : (numericValue || 0);
                return { ...prev, topUp: nextTopUp };
            }

            // Handle boolean fields (like checkbox)
            const processedValue = isCheckbox ? value === 'true' : value;
            return { ...prev, [field]: processedValue };
        });

        // Clear error for this field when user starts typing
        setErrors(prev => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
    };

    const customerFields: Field[] = [
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
            display: false,
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
            display: false,
        },
        {
            key: 'email',
            label: 'Email',
            type: 'email',
            value: formData.email,
            isRequired: true,
            onChange: updateField('email'),
            error: errors.email,
            disabled: isAuthenticated,
            validation: validateEmail(formData.email, 'Email'),
        },
        {
            key: 'phone',
            label: 'Mobile Phone',
            type: 'tel',
            value: formData.phone,
            isRequired: true,
            onChange: updateField('phone'),
            error: errors.phone,
            disabled: isAuthenticated,
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
            display: false,
            validation: validateDigits(formData.driversLicense, 'Driver’s License number', { exactLength: 9 }),
        },
        {
            key: 'companyId',
            label: 'Company Name',
            type: 'select',
            value: formData.companyId || '',
            isRequired: true,
            onChange: updateField('companyId'),
            error: errors.companyId,
            disabled: false,
            options: lookUpOptions.companies,
            display: false,
        },
        {
            key: 'employeeNumber',
            label: 'Employee Number',
            type: 'text',
            value: formData.employeeNumber,
            isRequired: offer?.options.employeeNumber?.required || false,
            onChange: updateField('employeeNumber'),
            error: errors.employeeNumber,
            disabled: false,
            display: offer?.options.employeeNumber?.enabled || false,
        },
    ];

    const customercheckboxes: Field[] = [
        {
            key: 'notifications',
            errorLabel: 'Email and SMS updates agreement',
            label: registration?.custom_labels?.checkbox_notifications || 'I agree to receive updates by email and SMS',
            type: 'checkbox',
            value: formData.notifications,
            isRequired: registration?.custom_labels?.checkbox_notifications_required || false,
            onChange: updateField('notifications', true),
            error: errors.notifications,
            disabled: false,
            display: !isAuthenticated,
        },
        {
            key: 'openAnAccount',
            label: 'I park my car here often, i would like to open an account.',
            type: 'checkbox',
            value: formData.openAnAccount,
            isRequired: false,
            onChange: updateField('openAnAccount', true),
            error: errors.openAnAccount,
            disabled: false,
            display: offer?.type == "reservation",
        },
    ];

    const addressFields = [
        {
            key: 'state',
            label: 'State',
            type: 'text',
            value: formData.state,
            isRequired: offer?.options.address?.required || false,
            onChange: updateField('state'),
            error: errors.state,
            disabled: false,
            display: offer?.options.address?.enabled || false,
            validation: validateMaxLength(formData.state, 21, 'State'),
        },
        {
            key: 'city',
            label: 'City',
            type: 'text',
            value: formData.city,
            isRequired: offer?.options.address?.required || false,
            onChange: updateField('city'),
            error: errors.city,
            disabled: false,
            display: offer?.options.address?.enabled || false,
            validation: validateMaxLength(formData.city, 21, 'City'),
        },
        {
            key: 'street',
            label: 'Street',
            type: 'text',
            value: formData.street,
            isRequired: offer?.options.address?.required || false,
            onChange: updateField('street'),
            error: errors.street,
            disabled: false,
            display: offer?.options.address?.enabled || false,
            validation: validateMaxLength(formData.street, 21, 'Street'),
        },
        {
            key: 'postCode',
            label: 'Post Code',
            type: 'text',
            value: formData.postCode,
            isRequired: true,
            onChange: updateNumericField(formData.postCode, 5, updateField('postCode')),
            error: errors.postCode,
            disabled: false,
            validation: validateDigits(formData.postCode, 'Post Code', { exactLength: 5 }),
        },

    ];

    const TopupFields: Field[] = [
        {
            key: 'topUp',
            label: 'You can top up your wallet or continue without topping up',
            type: 'topup',
            value: formData.topUp,
            isRequired: offer?.options.walletTopUp?.required || false,
            onChange: updateField('topUp'),
            error: errors.topUp,
            disabled: false,
            display: offer?.options.walletTopUp?.enabled || false,
        },
    ]
    const vehicleFields = [
        {
            key: 'plate',
            label: 'License Plate',
            type: 'text',
            value: formData.plate,
            isRequired: true,
            onChange: updateField('plate'),
            error: errors.plate,
            disabled: false,
            display: true,
            validation: validateMaxLength(formData.plate, 11, 'License Plate'),
        },
        {
            key: 'cardNumber',
            label: 'Card',
            type: 'number',
            value: formData.cardNumber,
            isRequired: false,
            onChange: updateField('cardNumber'),
            error: errors.cardNumber,
            disabled: false,
            validation: validateDigits(formData.cardNumber, 'Card'),
        },
    ]

    const checkboxsFields: Field[] = [
        {
            key: 'generalTerms',
            errorLabel: 'Terms and Conditions agreement',
            label: registration?.custom_labels?.checkbox_general_terms || `
            I have read and accepted the
            <a href="${getTenantAsset('docs/terms-and-conditions.pdf')}" target="_blank">Terms and Conditions</a>
            and
            <a href="${getTenantAsset('docs/privacy-and-policy.pdf')}" target="_blank">Privacy Policy</a>
            `,
            type: 'checkbox',
            value: formData.generalTerms,
            isRequired: true,
            onChange: updateField('generalTerms', true),
            error: errors.generalTerms,
            disabled: false,
        },
        {
            key: 'marketingTerms',
            errorLabel: 'Marketing updates agreement',
            label: registration?.custom_labels?.checkbox_marketing_terms || 'I agree to receive marketing updates by email and SMS',
            type: 'checkbox',
            value: formData.marketingTerms,
            isRequired: false,
            onChange: updateField('marketingTerms', true),
            error: errors.marketingTerms,
            disabled: false,
        },
    ]


    return (
        <div className="container">
            <div className="details">
                <div className={displayBD ? "split-panel" : "panel"}>
                    <div >
                        <FieldsCard
                            title={registration?.custom_labels?.form_header || 'Customer Information'}
                            fields={customerFields}
                            isToggled={false}
                            checkboxes={customercheckboxes}
                        />

                        <FieldsCard
                            title='Address Details'
                            fields={addressFields}
                            isToggled={false}
                        />

                        <FieldsCard
                            title='Vehicle Details'
                            fields={vehicleFields}
                            isToggled={false}
                        />

                        <FieldsCard
                            title='Add to Wallet'
                            topup={TopupFields}
                            isToggled={false}
                        />

                        <FieldsCard
                            style={false}
                            checkboxes={checkboxsFields}
                            isToggled={false}
                        />
                    </div>

                    {displayBD ?
                        <BreakdownCard
                            title={registration?.custom_labels?.booking_summary_label || 'Summary'}
                            breakdown={breakdown}
                            isStatic={true}
                            onClick={handleContinueToPayment}
                            buttonText='Continue to Payment' />
                        :
                        <button className='btn-primary' onClick={handleContinueToPayment}>Continue to Payment</button>
                    }
                </div>
            </div>
        </div>
    );
}

export default DetailsPage;