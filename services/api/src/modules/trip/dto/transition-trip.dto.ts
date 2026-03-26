import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

/** Actions map to events in the state machine */
const TRIP_ACTIONS = [
  'start_planning',
  'submit',
  'save_draft',
  'admin_confirm',
  'user_cancel',
  'payment_success',
  'start_prepare',
  'start_trip',
  'complete_trip',
  'start_review',
  'finish_review',
  'request_refund',
  'refund_approved',
  'refund_rejected',
  'reopen',
] as const;

export class TransitionTripDto {
  @ApiProperty({
    description:
      'State machine action to trigger. Each action is only valid from specific statuses. / ' +
      '要触发的状态机动作。每个动作仅在特定状态下有效。\n\n' +
      '- `start_planning`: DRAFT → PLANNING\n' +
      '- `submit`: PLANNING → SUBMITTED\n' +
      '- `save_draft`: PLANNING → DRAFT\n' +
      '- `admin_confirm`: SUBMITTED → CONFIRMED\n' +
      '- `user_cancel`: most states → CANCELLED\n' +
      '- `payment_success`: CONFIRMED → PAID\n' +
      '- `start_prepare`: PAID → PREPARING\n' +
      '- `start_trip`: PREPARING → IN_PROGRESS\n' +
      '- `complete_trip`: IN_PROGRESS → COMPLETED\n' +
      '- `start_review`: COMPLETED → REVIEWING\n' +
      '- `finish_review`: REVIEWING → COMPLETED\n' +
      '- `request_refund`: PAID → REFUNDING\n' +
      '- `refund_approved`: REFUNDING → REFUNDED\n' +
      '- `refund_rejected`: REFUNDING → PAID\n' +
      '- `reopen`: CANCELLED → DRAFT',
    enum: TRIP_ACTIONS,
    example: 'start_planning',
  })
  @IsIn(TRIP_ACTIONS)
  action: string;

  @ApiPropertyOptional({
    description: 'Reason for the transition (required for cancel/refund actions). / 转换原因（取消/退款操作时需填写）',
    example: '行程日期冲突 / Schedule conflict',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'ID of the user/admin performing this action. / 执行此操作的用户/管理员ID',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @IsOptional()
  @IsString()
  operator?: string;
}
