import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string,
  ) {
    super(
      {
        message,
        error: error || 'Internal Server Error',
        statusCode,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class BusinessNotFoundException extends BaseException {
  constructor(businessId: string) {
    super(
      `Business with ID '${businessId}' not found`,
      HttpStatus.NOT_FOUND,
      'Business Not Found',
    );
  }
}

export class UnauthorizedBusinessAccessException extends BaseException {
  constructor(businessId: string) {
    super(
      `Unauthorized access to business '${businessId}'`,
      HttpStatus.FORBIDDEN,
      'Unauthorized Business Access',
    );
  }
}

export class InsufficientPermissionsException extends BaseException {
  constructor(permission: string) {
    super(
      `Insufficient permissions. Required: ${permission}`,
      HttpStatus.FORBIDDEN,
      'Insufficient Permissions',
    );
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, _errors?: any[]) {
    super(message, HttpStatus.BAD_REQUEST, 'Validation Error');
  }
}
