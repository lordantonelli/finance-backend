import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountHasTransactionsException extends HttpException {
  constructor() {
    super(
      'Cannot delete account with associated transactions.',
      HttpStatus.CONFLICT,
    );
  }
}
