import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
    @Get('health')
    @ApiOperation({ summary: 'Endpoint de Health Check' })
    checkHealth() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
