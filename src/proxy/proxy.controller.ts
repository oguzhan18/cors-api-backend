import { Controller, All, Req, Res, Query, Options } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProxyUrlDto } from './dto/proxy-url.dto';
import * as https from 'https';

// Defining a constant for the CORS headers to improve readability and maintainability
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly httpService: HttpService) {}

  @Options()
  handleOptions(@Req() req: Request, @Res() res: Response) {
    res.set(CORS_HEADERS);
    res.sendStatus(204);
  }

  @All()
  @ApiOperation({ summary: 'Proxy a request to the specified URL' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'The URL to proxy the request to',
  })
  @ApiResponse({ status: 200, description: 'The proxied response' })
  @ApiResponse({
    status: 400,
    description: 'Bad request if URL is missing or invalid',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async proxyRequest(
    @Query() query: ProxyUrlDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { url } = query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const method = req.method.toLowerCase();
    const headers = this.filterHeaders(req.headers);
    const data = req.body;

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    console.log(`Proxying request to: ${url}`);
    console.log(`Method: ${method}`);
    console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
    console.log(`Data: ${JSON.stringify(data, null, 2)}`);

    try {
      const axiosResponse: AxiosResponse<any> = await this.httpService
        .request({
          url,
          method,
          headers,
          data,
          httpsAgent,
        })
        .toPromise();

      this.logResponse(axiosResponse);

      res.set(axiosResponse.headers);
      res.status(axiosResponse.status).json(axiosResponse.data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private filterHeaders(headers: Record<string, string | string[]>) {
    const filteredHeaders = { ...headers };
    delete filteredHeaders.host;
    delete filteredHeaders.origin;
    delete filteredHeaders.referer;
    return filteredHeaders;
  }

  private logResponse(response: AxiosResponse<any>) {
    console.log(`Response status: ${response.status}`);
    console.log(
      `Response headers: ${JSON.stringify(response.headers, null, 2)}`,
    );
    console.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
  }

  private handleError(error: any, res: Response) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(
        `Response headers: ${JSON.stringify(error.response.headers, null, 2)}`,
      );
      console.error(
        `Response data: ${JSON.stringify(error.response.data, null, 2)}`,
      );
      res.status(error.response.status).json({
        error: error.response.data || error.message,
      });
    } else {
      console.error(`Request error: ${JSON.stringify(error, null, 2)}`);
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
