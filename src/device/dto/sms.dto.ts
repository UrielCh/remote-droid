import { ApiProperty } from '@nestjs/swagger';

export class SMSDto {
  @ApiProperty({
    title: 'SMS id',
    description: 'The SMS Primary key',
    required: true,
  })
  _id!: number;
  @ApiProperty({
    title: 'address',
    required: true,
  })
  address!: number;
  @ApiProperty({
    title: 'SMS body',
    required: true,
  })
  body!: string;
  @ApiProperty({
    title: 'creator application',
    required: true,
  })
  creator!: string;
  @ApiProperty({
    title: 'timestamp date',
    required: true,
  })
  date!: number;
  @ApiProperty({
    title: 'timestamp date_sent',
    required: true,
  })
  date_sent!: number;
  @ApiProperty({
    title: 'error_code',
    required: true,
  })
  error_code!: number;
  @ApiProperty({
    title: 'locked',
    required: true,
  })
  locked!: number;
  @ApiProperty({
    title: 'person',
    required: true,
  })
  person!: string;
  @ApiProperty({
    title: 'protocol',
    required: true,
  })
  protocol!: number;
  @ApiProperty({
    title: 'read',
    required: true,
  })
  read!: number;
  @ApiProperty({
    title: 'reply_path_present',
    required: true,
  })
  reply_path_present!: number;
  @ApiProperty({
    title: 'seen',
    required: true,
  })
  seen!: number;
  @ApiProperty({
    title: 'service_center',
    required: true,
  })
  service_center!: number; // may be keep as string;
  @ApiProperty({
    title: 'status',
    required: true,
  })
  status!: number;
  @ApiProperty({
    title: 'sub_id',
    required: true,
  })
  sub_id!: number;
  @ApiProperty({
    title: 'subject',
    required: true,
  })
  subject!: string;
  @ApiProperty({
    title: 'thread_id',
    required: true,
  })
  thread_id!: number;
  @ApiProperty({
    title: 'type',
    required: true,
  })
  type!: number;
}
