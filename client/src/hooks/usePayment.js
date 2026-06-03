import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function usePayment() {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async ({
    amount,
    purpose,
    pujaId,
    description,
    onSuccess,
    onFailure
  }) => {
    setLoading(true);
    try {
      // Step 1 — Create order on backend
      const { data } = await axios.post('/api/payments/create-order', {
        amount,
        purpose,
        pujaId
      });

      // Step 2 — Open Razorpay checkout
      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'Astro Celestique',
        description: description || 'Vedic Astrology Services',
        image:       '/logo.png',
        order_id:    data.orderId,
        handler: async (response) => {
          try {
            // Step 3 — Verify payment on backend
            const verifyRes = await axios.post('/api/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              purpose,
              pujaId,
              amount
            });

            if (verifyRes.data.success) {
              toast.success(verifyRes.data.message || 'Payment successful!');
              if (onSuccess) onSuccess(verifyRes.data);
            }
          } catch (err) {
            toast.error('Payment verification failed');
            if (onFailure) onFailure(err);
          }
        },
        prefill: {
          name:    '',
          email:   '',
          contact: ''
        },
        theme: {
          color: '#c9963c'
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '⚠️' });
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.');
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
}