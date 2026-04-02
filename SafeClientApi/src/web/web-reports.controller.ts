import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { ReportsService } from '../reports/reports.service';

@ApiTags('Web — Reports')
@ApiBearerAuth()
@Controller('web/reports')
export class WebReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Publicar relato vinculado à conta do usuário autenticado' })
  @ApiBody({
    type: CreateReportDto,
    examples: {
      default: {
        value: {
          contact: '47991234567',
          contactType: 'phone',
          flags: ['pagamento_recusado', 'nao_compareceu'],
          description: 'Cliente cancelou em cima da hora sem aviso.',
        },
      },
    },
  })
  create(
    @Body() dto: CreateReportDto,
    @Req() req: Request & { user: { id: string; email: string } },
  ) {
    return this.reportsService.create(dto, undefined, req.user.id, req.user.email);
  }
}
