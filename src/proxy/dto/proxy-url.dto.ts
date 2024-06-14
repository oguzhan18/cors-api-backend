import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProxyUrlDto {
  @ApiProperty({
    description: 'The URL to proxy the request to',
    example: 'https://jsonplaceholder.typicode.com/posts',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
