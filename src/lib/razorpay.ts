declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * 💳 Razorpay SDK Loader
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayPaymentParams {
  amount: number; // in rupees
  bookingId: string;
  mentorName: string;
  userDetails: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: {
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  }) => void;
  onFailure: (error: any) => void;
}

/**
 * Initiate Razorpay checkout in test mode
 */
export const initiateRazorpayPayment = async ({
  amount,
  bookingId,
  mentorName,
  userDetails,
  onSuccess,
  onFailure,
}: RazorpayPaymentParams) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
    }

    // Use environment variable, fallback to dummy test key if not set
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_5a2A6eBsC123dE';

    const options = {
      key: keyId,
      amount: amount * 100, // Razorpay amount is in paise (1 INR = 100 paise)
      currency: 'INR',
      name: 'LifeFundies',
      description: `Session with ${mentorName}`,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop&crop=faces&q=80',
      handler: function (response: any) {
        console.log('✅ Razorpay payment success:', response);
        onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      prefill: {
        name: userDetails.name || 'LifeFundies User',
        email: userDetails.email || '',
        contact: userDetails.phone || '',
      },
      notes: {
        bookingId: bookingId,
      },
      theme: {
        color: '#10b981', // Harmonious therapeutic green theme color
      },
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response: any) {
      console.error('❌ Razorpay payment failed:', response.error);
      onFailure(new Error(response.error.description || 'Payment failed'));
    });

    rzp.open();
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    onFailure(error);
  }
};
