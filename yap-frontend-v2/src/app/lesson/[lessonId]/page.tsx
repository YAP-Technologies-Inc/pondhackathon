'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import LessonUi from '@/components/lesson/LessonUi';
import { useMetaMask } from '@/components/wallet/MetaMaskProvider';
import { useYAPToken } from '@/hooks/useYAPToken';
import { useToast } from '@/components/ui/ToastProvider';
import PronunciationTest from '@/components/lesson/PronunciationTest';

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { pushToast } = useToast();
  const { account, isConnected } = useMetaMask();
  const { getBalance } = useYAPToken();

  const [isCompleting, setIsCompleting] = useState(false);

  const handleLessonComplete = async () => {
    if (!isConnected || !account) {
      pushToast('Please connect MetaMask wallet to receive token rewards', 'warning');
      return;
    }

    setIsCompleting(true);

    try {
      // Call backend API to complete lesson and get token rewards
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          walletAddress: account,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Wait for blockchain state to update
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Update token balance multiple times to ensure it's fresh
        await getBalance();
        setTimeout(async () => {
          await getBalance();
        }, 1000);
        
        pushToast(`Congratulations! You earned 1 YAP token reward! Transaction hash: ${result.transactionHash}`, 'success');
        
        // Delay redirect to home page
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        const error = await response.json();
        pushToast(error.error || 'Failed to complete lesson', 'error');
      }
    } catch (error) {
      console.error('Lesson completion error:', error);
      pushToast('Error occurred while completing lesson', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <LessonUi
        lessonId={lessonId}
        onComplete={handleLessonComplete}
        isCompleting={isCompleting}
      />
    </div>
  );
}
