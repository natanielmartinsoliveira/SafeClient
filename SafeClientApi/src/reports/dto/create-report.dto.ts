import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactType } from '../../common/enums/contact-type.enum';
import { FlagType } from '../../common/enums/flag-type.enum';

export class CreateReportDto {
  @ApiProperty({ example: '47991234567', description: 'Telefone, @usuario, e-mail, etc.' })
  @IsNotEmpty()
  @IsString()
  contact: string;

  @ApiProperty({ enum: ContactType, example: ContactType.PHONE })
  @IsEnum(ContactType)
  contactType: ContactType;

  @ApiProperty({
    enum: FlagType,
    isArray: true,
    example: [FlagType.PAGAMENTO_RECUSADO, FlagType.NAO_COMPARECEU],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(FlagType, { each: true })
  flags: FlagType[];

  @ApiPropertyOptional({
    example: 'Cliente cancelou em cima da hora sem aviso.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
