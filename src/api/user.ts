import { AxiosRequestConfig } from 'axios';
import api from './index';
import { getUserIdFromToken } from '../utils/jwtUtils';
import { ProfileResponse, ProfileUpdate, LookupOptionSchema, InitCardResponse, HppStatusResponse, Transaction } from '../schemas/profileSchemas';
import { z } from 'zod';

const BASE_URL = '/api/v1/web/accounts';
const LOOKUP_BASE_URL = '/api/v1/lookups';

export type Statement = {
    id: string;
    customerId: string;
    shortId: string;
    name: string;
    kind: string;
    offerType: string;
    offerName: string;
    type: string;
    date: string;
    total: {
        incVat: number;
        excVat: number;
    };
    downloadUrl: string;
}

const getUserId = () => {
    const id = getUserIdFromToken(sessionStorage.getItem('accessToken') || '');
    if (!id) {
        throw new Error('Unable to find the user');
    }
    return id;
}

// Auth Functions
export async function getStatements<T = Statement[]>(config?: AxiosRequestConfig) {
    const id = getUserId();
    return api.get<T>(`${BASE_URL}/${id}/statements`, config);
}

export async function downloadStatement(InvoiceId: string) {
    const id = getUserId();
    return api.getBlob(`${BASE_URL}/${id}/statements/${InvoiceId}/download`);
}

export async function getTransactions<T = Transaction[]>(config?: AxiosRequestConfig) {
    const id = getUserId();
    return api.get<T>(`${BASE_URL}/${id}/transactions/find`, config);
}

export async function downloadTransactions(from?: string, to?: string) {
    const id = getUserId();
    let url = `${BASE_URL}/${id}/transactions/download/`;
    if (from && to) {
        url += `?from=${from}&to=${to}`;
    }
    return api.getBlob(url);
}

//wallet
export async function addMoneyToBalance(amount: number): Promise<ProfileResponse> {
    const id = getUserId();
    return await api.post<ProfileResponse>(`${BASE_URL}/${id}/wallet-topup`, { amount });

}

export async function setDefaultCard(cardID: string): Promise<ProfileResponse> {
    const id = getUserId();
    return await api.post<ProfileResponse>(`${BASE_URL}/${id}/payment-methods/cards/${cardID}/set-default`, {});
}

export async function deleteCard(cardID: string): Promise<ProfileResponse> {
    const id = getUserId();
    return await api.delete<ProfileResponse>(`${BASE_URL}/${id}/payment-methods/cards/${cardID}`);
}

export async function initCard(): Promise<InitCardResponse> {
    const id = getUserId();
    return await api.post<InitCardResponse>(`${BASE_URL}/${id}/payment-methods/cards/init`);
}

export async function checkHppStatus(sid: string): Promise<HppStatusResponse> {
    return await api.get<HppStatusResponse>(`/api/v1/hpp/${sid}`);
}

export async function addCard(sid: string): Promise<ProfileResponse | null> {
    const id = getUserId();
    return await api.post<ProfileResponse | null>(`${BASE_URL}/${id}/payment-methods/cards`, { sid });
}



export async function deleteVehicle(plate: string): Promise<ProfileResponse> {
    const id = getUserId();
    return await api.delete<ProfileResponse>(`${BASE_URL}/${id}/vehicles/${plate}`);
}

export async function updateContactInfo(contactData: ProfileUpdate): Promise<ProfileResponse> {
    const id = getUserId();
    return api.put(`${BASE_URL}/${id}/profile`, contactData);
}



export async function cancelSubscription(orderId: string): Promise<ProfileResponse> {
    return await api.post<ProfileResponse>(`/api/v1/web/orders/${orderId}/cancel`, { cancel: 'cancel' });
}

export async function updateOrderPaymentPriority(orderId: string, priority: string): Promise<ProfileResponse> {
    return await api.post<ProfileResponse>(`/api/v1/web/orders/${orderId}/payment-methods/priority`, { priority: priority });
}


//lookup options
export async function getOptions(): Promise<{ genders: z.infer<typeof LookupOptionSchema>[]; companies: z.infer<typeof LookupOptionSchema>[] }> {
    const endpoints = {
        genders: `${LOOKUP_BASE_URL}/genders`,
        companies: `${LOOKUP_BASE_URL}/companies`,
    } as const;

    const [gendersRaw, companiesRaw] = await Promise.all([
        api.get<any[]>(endpoints.genders),
        api.get<any[]>(endpoints.companies),
    ]);

    const normalize = (items: any[]): z.infer<typeof LookupOptionSchema>[] => {
        if (!Array.isArray(items)) return [];
        return items.map((item: any) => {
            if (item && typeof item === 'object') {
                if ('key' in item && 'value' in item) {
                    return { key: String(item.key), value: String(item.value) };
                }
                if ('id' in item && 'name' in item) {
                    return { key: String(item.id), value: String(item.name) };
                }
                if ('code' in item && 'label' in item) {
                    return { key: String(item.code), value: String(item.label) };
                }
            }
            return { key: String(item), value: String(item) };
        });
    };

    return {
        genders: normalize(gendersRaw),
        companies: normalize(companiesRaw),
    };
}
