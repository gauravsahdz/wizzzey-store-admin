
"use client";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  defaultHref?: string;
  children?: React.ReactNode;
}

export default function BackButton({ defaultHref, children }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      router.back();
    } else if (defaultHref) {
      router.push(defaultHref);
    } else {
      router.push('/dashboard'); // Fallback to dashboard
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleBack} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" />
      {children || 'Back'}
    </Button>
  );
}
