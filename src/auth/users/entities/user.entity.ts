import { BaseEntity } from '@shared/entities/base.entity';
import { hashSync } from 'bcrypt';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class User extends BaseEntity {
  @ApiProperty({ description: 'Name of the user', example: 'John Doe' })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Encrypted password (not returned in responses)',
    writeOnly: true,
  })
  @Column({ select: false })
  password?: string;

  @ApiPropertyOptional({
    description: 'URL or path to user avatar image',
    example: 'https://example.com/avatars/user123.jpg',
  })
  @Column({ nullable: true })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Preferred currency code (ISO 4217)',
    example: 'BRL',
    default: 'BRL',
  })
  @Column({ default: 'BRL', length: 3 })
  currency: string;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean = true;

  @BeforeInsert()
  hashPassword() {
    if (this.password) this.password = hashSync(this.password, 10);
  }
}
