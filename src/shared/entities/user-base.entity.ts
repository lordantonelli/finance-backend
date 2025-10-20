import { ApiProperty } from '@nestjs/swagger';
import { ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from 'src/auth/users/entities/user.entity';

export abstract class UserBaseEntity extends BaseEntity {
  @ApiProperty({ description: 'Owner of the entity' })
  @ManyToOne(() => User)
  user: User;
}
