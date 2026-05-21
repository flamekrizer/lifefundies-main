export async function createCashfreeOrder(payload) {
  const response = await fetch('/api/cashfree/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create payment order');
  }

  return data;
}

export async function verifyCashfreePayment(payload) {
  const response = await fetch('/api/cashfree/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify payment');
  }

  return data;
}
