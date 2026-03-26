import { PartialType } from '@nestjs/swagger';
import { CreateHolySiteDto } from './create-holy-site.dto';

export class UpdateHolySiteDto extends PartialType(CreateHolySiteDto) {}
