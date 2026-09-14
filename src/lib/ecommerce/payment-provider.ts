// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — PAYMENT PROVIDER ABSTRACTION
// Reference: Section 7 of "e commerce - master.md"
//
// Hard Rule:
// Raw card numbers, CVV, UPI credentials, or net-banking credentials are NEVER
// stored in our database, logs, or application systems.
// =============================================================================

import { JayaramMittaiPaymentMethod, JayaramMittaiPaymentStatus } from './types';

export interface PaymentInitiationRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod?: JayaramMittaiPaymentMethod;
}

export interface PaymentInitiationResponse {
  success: boolean;
  provider: string;
  paymentSessionId: string;
  redirectUrl?: string;
  clientSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerificationRequest {
  orderId: string;
  provider: string;
  providerReference: string;
  signature?: string;
  paymentMethod: JayaramMittaiPaymentMethod;
}

export interface PaymentVerificationResponse {
  isVerified: boolean;
  status: JayaramMittaiPaymentStatus;
  amountPaid: number;
  transactionId: string;
  errorMessage?: string;
}

export interface PaymentProvider {
  readonly providerName: string;
  initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  verifyPayment(req: PaymentVerificationRequest): Promise<PaymentVerificationResponse>;
}

/**
 * Mock payment gateway provider for pre-credentials testing & local staging.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly providerName = 'mock_gateway';

  async initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    return {
      success: true,
      provider: this.providerName,
      paymentSessionId: `mock_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      metadata: {
        orderId: req.orderId,
        amount: req.amount,
      },
    };
  }

  async verifyPayment(req: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    return {
      isVerified: true,
      status: 'captured',
      amountPaid: 0, // Injected during server verification
      transactionId: req.providerReference || `mock_tx_${Date.now()}`,
    };
  }
}

/**
 * Factory returning active PaymentProvider instance based on configuration.
 */
export function getPaymentProvider(): PaymentProvider {
  // In the future: check process.env.PAYMENT_GATEWAY_PROVIDER === 'razorpay' etc.
  return new MockPaymentProvider();
}
