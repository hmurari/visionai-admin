import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const getCheckoutSession = useAction(api.stripe.getCheckoutSession);
  
  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      
      try {
        const sessionData = await getCheckoutSession({ sessionId });
        setSession(sessionData);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSession();
  }, [sessionId, getCheckoutSession]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <p>Loading payment details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. Your order has been processed.
        </p>
        
        {session && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Order ID:</span> {session.id}</p>
              <p><span className="font-medium">Amount:</span> {session.amount_total ? 
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: session.currency?.toUpperCase() || 'USD'
                }).format(session.amount_total / 100) : 'N/A'}</p>
              <p><span className="font-medium">Status:</span> {session.payment_status}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <p>
            We've sent a confirmation email to your inbox with all the details.
          </p>
          <p>
            Our team will be in touch within 24 hours to schedule your onboarding.
          </p>
          <div className="mt-8">
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 