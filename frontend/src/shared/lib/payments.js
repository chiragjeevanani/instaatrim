// Minimal mock payment gateway.
//
// This is a first pass wired in alongside slot locking so checkout has a
// real transaction id and a real pass/fail outcome to react to instead of
// a setTimeout that always succeeds. The fuller Phase 4 build (Net
// Banking / Wallets, retry UI, the full Pending/Failed/Refunded/Partially
// Refunded status set surfaced in booking history) is still to come — see
// the implementation plan — but nothing downstream needs to change again
// when it lands, since this already returns the same shape.

const newTransactionId = () => `TXN-${Date.now()}${Math.floor(Math.random() * 1000)}`;

export function processPayment({ amount, method, failureRate = 0.05 }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject({ status: 'Failed', message: `Payment via ${method} was declined. Please try again or use a different method.` });
        return;
      }
      resolve({ status: 'Successful', transactionId: newTransactionId(), amount, method, paidAt: new Date().toISOString() });
    }, 900 + Math.random() * 700);
  });
}
