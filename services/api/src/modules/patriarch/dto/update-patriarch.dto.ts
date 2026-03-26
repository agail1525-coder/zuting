import { PartialType } from '@nestjs/swagger';
import { CreatePatriarchDto } from './create-patriarch.dto';

export class UpdatePatriarchDto extends PartialType(CreatePatriarchDto) {}
