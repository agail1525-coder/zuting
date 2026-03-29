import { PartialType, OmitType } from '@nestjs/swagger';
import { RegisterMerchantDto } from './register-merchant.dto';

export class UpdateMerchantDto extends PartialType(
  OmitType(RegisterMerchantDto, ['type'] as const),
) {}
