'use client';

import { useState, useCallback } from 'react';
import { defaultSettings, type SiteSettings } from './siteSettingsDefaults';

export const useSiteSettings = () => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

    const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings,
        }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    const getTenantAsset = useCallback((path: string) => {
        const tenant = process.env.NEXT_PUBLIC_TENANT || 'yqf5nczs';
        return `${settings.general.assets_path}tenants/${tenant}/${path}`;
    }, [settings.general.assets_path]);

    const getCommonAsset = useCallback((path: string) => {
        return `${settings.general.assets_path}common/icons/${path}`;
    }, [settings.general.assets_path]);

    return {
        ...settings,
        updateSettings,
        resetSettings,
        getTenantAsset,
        getCommonAsset,
    };
};
