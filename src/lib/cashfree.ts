declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: {
        paymentSessionId: string
        redirectTarget?: '_self' | '_blank' | '_modal'
      }) => Promise<any>
    }
  }
}

interface CashfreePaymentParams {
  amount: number
  bookingId: string
  mentorName: string
  userDetails: {
    id: string
    name: string
    email: string
    phone: string
  }
  onSuccess: (paymentData: {
    orderId: string
    paymentId: string
    transactionId?: string
  }) => void
  onFailure: (error: any) => void
}

const loadCashfreeSdk = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Cashfree) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-cashfree-sdk="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.async = true
    script.dataset.cashfreeSdk = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'))
    document.head.appendChild(script)
  })

const getCashfreeMode = (): 'sandbox' | 'production' => {
  const env = import.meta.env.VITE_CASHFREE_ENV || 'sandbox'
  return env === 'production' || env === 'prod' ? 'production' : 'sandbox'
}

const postJson = async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error || 'Cashfree request failed')
  }
  return data as T
}

/**
 * Initiate Cashfree payment checkout using a server-created order.
 * Cashfree app id/secret stay on the API side and are never exposed to the browser.
 */
export const initiateCashfreePayment = async ({
  amount,
  bookingId,
  mentorName,
  userDetails,
  onSuccess,
  onFailure,
}: CashfreePaymentParams) => {
  try {
    const order = await postJson<{
      order_id: string
      payment_session_id: string
      order_status?: string
    }>('/api/cashfree-create-order', {
      bookingId,
      amount,
      mentorName,
      customer: userDetails,
    })

    if (!order.payment_session_id) {
      throw new Error('Cashfree did not return a payment session id.')
    }

    await loadCashfreeSdk()
    if (!window.Cashfree) {
      throw new Error('Cashfree SDK is not available.')
    }

    const cashfree = window.Cashfree({ mode: getCashfreeMode() })
    await cashfree.checkout({
      paymentSessionId: order.payment_session_id,
      redirectTarget: '_modal',
    })

    const verification = await postJson<{
      order_id: string
      order_status: string
      cf_order_id?: string
    }>('/api/cashfree-verify-order', {
      orderId: order.order_id,
    })

    if (verification.order_status !== 'PAID') {
      throw new Error(`Payment not completed. Cashfree status: ${verification.order_status}`)
    }

    onSuccess({
      orderId: verification.order_id || order.order_id,
      paymentId: verification.cf_order_id || verification.order_id || order.order_id,
      transactionId: verification.cf_order_id,
    })
  } catch (error) {
    console.error('Cashfree payment failed:', error)
    onFailure(error)
  }
}

export const verifyCashfreeConfig = () => {
  const mode = getCashfreeMode()
  console.group('Cashfree Configuration Status')
  console.log('Mode:', mode)
  console.log('Server endpoints:', '/api/cashfree-create-order, /api/cashfree-verify-order')
  console.groupEnd()

  return {
    configured: true,
    mode,
  }
}

export const verifyCashfreePayment = async (orderId: string) => {
  return postJson('/api/cashfree-verify-order', { orderId })
}
