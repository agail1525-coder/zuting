import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when a payment operation fails at the gateway level.
 */
export class PaymentFailedException extends HttpException {
  constructor(
    public readonly gateway: string,
    message: string,
    public readonly gatewayResponse?: any,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'PaymentFailed',
        message: `Payment failed via ${gateway}: ${message}`,
        gateway,
        gatewayResponse,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

/**
 * Thrown when a payment operation times out.
 */
export class PaymentTimeoutException extends HttpException {
  constructor(
    public readonly gateway: string,
    public readonly operation: string,
  ) {
    super(
      {
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        error: 'PaymentTimeout',
        message: `Payment ${operation} timed out via ${gateway}`,
        gateway,
        operation,
      },
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}

/**
 * Thrown when a payment callback cannot be verified.
 */
export class PaymentSignatureException extends HttpException {
  constructor(public readonly gateway: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'PaymentSignatureInvalid',
        message: `Invalid payment callback signature from ${gateway}`,
        gateway,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Thrown when a refund operation fails.
 */
export class RefundFailedException extends HttpException {
  constructor(
    public readonly gateway: string,
    message: string,
    public readonly gatewayResponse?: any,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'RefundFailed',
        message: `Refund failed via ${gateway}: ${message}`,
        gateway,
        gatewayResponse,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
