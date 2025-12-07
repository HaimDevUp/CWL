'use client';
import { Loader } from '@/components/UI/Loader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PersonalAreaPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/personal-area/product-information');
  }, [router]);
  return <Loader size="large" />;

}
