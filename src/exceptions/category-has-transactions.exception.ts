import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryHasTransactionsException extends HttpException {
  constructor() {
    super(
      'Cannot delete category with associated transactions.',
      HttpStatus.CONFLICT,
    );
  }
}
