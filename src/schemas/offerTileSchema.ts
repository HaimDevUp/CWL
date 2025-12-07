import { z } from 'zod';

// Offer Tile Schema (extracted to avoid circular dependency between profileSchemas and productsSchemas)
export const OfferTileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  buttonText: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  type: z.string(),
  tags: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })),
  accessProfile: z.number(),
  spot: z.object({
    name: z.string().nullable(),
    features: z.array(z.any()),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    address: z.object({
      name: z.string(),
      street: z.string().nullable(),
      city: z.string().nullable(),
      state: z.string().nullable(),
      postCode: z.string().nullable(),
    }).nullable(),
  }),
  ui: z.object({
    title: z.string(),
    bulletMarkers: z.array(z.string()),
  }),
  terminals: z.array(z.any()),
  distance: z.string().nullable(),
  services: z.array(z.any()),
  includedServices: z.array(z.object({
    type: z.string(),
    ui: z.object({
      title: z.string(),
      bulletMarkers: z.array(z.string()),
    }),
    price: z.number(),
    discount: z.number(),
    tax: z.number().nullable(),
  })),
  duration: z.object({
    type: z.string(),
    units: z.number(),
    date: z.string().nullable(),
  }).nullable(),
  price: z.object({
    type: z.string(),
    amount: z.number(),
    discount: z.number().nullable(),
    rateId: z.number().nullable(),
    tax: z.number().nullable(),
  }),
  options: z.object({
    isApprovalRequired: z.boolean(),
    isAutoRenewable: z.boolean(),
    isDeferred: z.boolean(),
    cancelation: z.object({
      allowed: z.boolean(),
      priorDays: z.number(),
      refundPercent: z.number(),
    }),
    update: z.object({
      allowed: z.boolean(),
      priorHours: z.number(),
      minimalHours: z.number(),
    }),
    accountId: z.string().nullable(),
    files: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    employeeNumber: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    plate: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }),
    card: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    tollTag: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    address: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    walletTopUp: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    termsAndConditions: z.object({
      checked: z.boolean(),
      label: z.string(),
      enabled: z.boolean(),
      required: z.boolean(),
    }).nullable(),
    approval: z.any().nullable(),
    doSync: z.boolean(),
    showQR: z.boolean().nullable(),
  }),
  sortOrder: z.number().nullable(),
  published: z.boolean(),
  createdAt: z.string(),
  expiredAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
});

export type OfferTile = z.infer<typeof OfferTileSchema>;


