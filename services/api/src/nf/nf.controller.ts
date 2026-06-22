import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { NfService } from './nf.service';
import { NfParserService } from './nf-parser.service';

@Controller('api/v1/notas-fiscais')
@UseGuards(JwtGuard)
export class NfController {
  constructor(
    private nfService: NfService,
    private nfParserService: NfParserService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadNF(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    if (!file.originalname.endsWith('.xml')) {
      throw new BadRequestException('Apenas arquivos XML são aceitos');
    }

    const userId = req.user.id;

    try {
      const xmlContent = file.buffer.toString('utf-8');
      const parsedNF = await this.nfParserService.parseXml(xmlContent);

      const marketplace = this.nfParserService.detectMarketplace(xmlContent);

      const createdNF = await this.nfService.createNotaFiscal({
        userId,
        nfNumber: parsedNF.nfNumber,
        nfSeries: parsedNF.nfSeries,
        nfDate: parsedNF.nfDate,
        emitente: parsedNF.emitente,
        destinatario: parsedNF.destinatario,
        valorTotal: parsedNF.valorTotal,
        valorBaseIcms: parsedNF.valorBaseIcms,
        valorIcms: parsedNF.valorIcms,
        xmlContent,
        items: parsedNF.items.map((item) => ({
          sku: item.sku,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          marketplace,
        })),
      });

      return {
        success: true,
        message: 'Nota fiscal processada com sucesso',
        data: {
          id: createdNF.id,
          nfNumber: createdNF.nfNumber,
          itemsCount: createdNF.items.length,
          valorTotal: createdNF.valorTotal,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Erro ao processar NF: ${error.message}`,
      );
    }
  }

  @Get()
  async listNFs(@Request() req: any) {
    const userId = req.user.id;
    return this.nfService.listNotasFiscais(userId);
  }

  @Get(':id')
  async getNF(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.nfService.getNotaFiscal(id, userId);
  }
}
