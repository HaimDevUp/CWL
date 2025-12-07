import { InitCardResponse, Order, ProfileResponse } from '@/schemas/profileSchemas';
import api from './index';
import { OfferTile, Breakdown, PurchaseData, UploadFilesResponse, UploadFileRequest, PurchaseResponse } from '@/schemas/productsSchemas';

const BASE_URL = '/api/v1/web/';



export async function fetchOffers(type: string, entry?: string, exit?: string, tags?: string): Promise<OfferTile[]> {
    let url = `${BASE_URL}offers?type=${type}`;
    if (entry) {
        url += `&entry=${entry}`;
    }
    if (exit) {
        url += `&exit=${exit}`;
    }
    if (tags) {
        url += `&tags=${tags}`;
    }
    return await api.get<OfferTile[]>(url);
}

export async function fetchOfferById(id: string): Promise<OfferTile> {
    return await api.get<OfferTile>(`${BASE_URL}offers/${id}`);
}


export async function calculateBreakdown(id: string, topUp?: number, entry?: string, exit?: string): Promise<Breakdown> {
    let url = `${BASE_URL}orders/calculate-breakdown`;
    return await api.post<Breakdown>(url, { offerId: id, 
        options: { wallet: { topUpAmount: topUp } }, 
        validity: { entry: entry, exit: exit } });
}

export async function validateOrder(purchaseData: PurchaseData): Promise<any> {
    return await api.post<any>(`${BASE_URL}orders/validate`, purchaseData);
}

export async function initPurchaseCard(): Promise<InitCardResponse> {
    return await api.post<InitCardResponse>(`${BASE_URL}/orders/purchase/cards/init`);
}

export async function Purchase(purchaseData: PurchaseData): Promise<PurchaseResponse> {
    return await api.post<PurchaseResponse>(`${BASE_URL}/orders/purchase`, purchaseData);
}

export async function uploadFiles(files: UploadFileRequest[]): Promise<UploadFilesResponse> {
    return await api.post<UploadFilesResponse>(`${BASE_URL}/files/create`, files);
}

export async function getOrderById(orderId: string): Promise<Order> {
    return await api.get<Order>(`${BASE_URL}/orders/${orderId}/public`);
}


