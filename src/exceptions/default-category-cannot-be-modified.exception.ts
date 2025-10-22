import { HttpException, HttpStatus } from '@nestjs/common';

export class DefaultCategoryCannotBeModified extends HttpException {
  constructor() {
    super(
      'Default categories cannot be modified.',
      HttpStatus.PRECONDITION_FAILED,
    );
  }
}
