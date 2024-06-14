import { Controller, All, Req, Res, Query } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProxyUrlDto } from './dto/proxy-url.dto';

@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly httpService: HttpService) {}

  @All()
  @ApiOperation({ summary: 'Proxy a request to the specified URL' })
  @ApiQuery({ name: 'url', required: true, description: 'The URL to proxy the request to' })
  @ApiResponse({ status: 200, description: 'The proxied response' })
  @ApiResponse({ status: 400, description: 'Bad request if URL is missing or invalid' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async proxyRequest(@Query() query: ProxyUrlDto, @Req() req: Request, @Res() res: Response) {
    const { url } = query;

    const method = req.method.toLowerCase();
    const headers = req.headers;
    const data = req.body;

    try {
      const axiosResponse: AxiosResponse<any> = await this.httpService
        .request({
          url,
          method,
          headers,
          data,
          responseType: 'stream',
        })
        .toPromise();

      res.set(axiosResponse.headers);
      axiosResponse.data.pipe(res);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
      });
    }
  }
}
