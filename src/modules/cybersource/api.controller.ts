import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CybersourceService } from './cybersource.service';
import * as fs from 'fs';
import * as path from 'path';

// DTOs for API requests
interface CaptureContextRequest {
  captureContextRequest: Record<string, any>;
}

interface CheckoutRequest {
  captureContext: string;
  captureContextDecoded: Record<string, any>;
}

interface CompletePaymentRequest {
  response: string;
}

@Controller('api')
export class ApiController {
  constructor(private readonly cybersourceService: CybersourceService) {}

  /**
   * GET /api/health - Health check endpoint
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/config - Get default capture context configuration
   */
  @Get('config')
  getConfig() {
    try {
      const filePath = path.join(
        process.cwd(),
        'src/common/data/default-uc-capture-context-request.json',
      );
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return {
        success: true,
        data: JSON.parse(fileContent),
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/capture-context - Generate capture context JWT
   */
  @Post('capture-context')
  async captureContext(@Body() body: CaptureContextRequest) {
    try {
      const requestObj = body.captureContextRequest;
      const captureContextJwt = await this.cybersourceService.generateCaptureContext(
        requestObj,
      );

      const decodedData = this.cybersourceService.decodeToken(captureContextJwt);

      return {
        success: true,
        data: {
          captureContext: captureContextJwt,
          decodedData: decodedData,
        },
      };
    } catch (error) {
      console.error('Exception on calling the API:', error);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/checkout - Prepare checkout data
   */
  @Post('checkout')
  checkout(@Body() body: CheckoutRequest) {
    try {
      const decodeData = body.captureContextDecoded;
      const captureContext = body.captureContext;

      // Extract the client library URL and the integrity to load the SDK
      const url = decodeData.ctx[0].data.clientLibrary;
      const clientLibraryIntegrity = decodeData.ctx[0].data.clientLibraryIntegrity;

      return {
        success: true,
        data: {
          clientLibrary: url,
          clientLibraryIntegrity: clientLibraryIntegrity,
          captureContext: captureContext,
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/complete-payment - Process payment completion response
   */
  @Post('complete-payment')
  completePayment(@Body() body: CompletePaymentRequest) {
    try {
      const decodedData = this.cybersourceService.decodeToken(body.response);

      return {
        success: true,
        data: {
          response: body.response,
          decodedData: decodedData,
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
