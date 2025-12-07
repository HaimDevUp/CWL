'use client';

import { useEffect, useState } from 'react';

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            // Matches the mobile breakpoint from mixins.scss (max-width: 1023px)
            setIsMobile(window.innerWidth <= 1023);
        };

        // Check on mount
        checkIsMobile();

        // Listen to resize events
        window.addEventListener('resize', checkIsMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
}
