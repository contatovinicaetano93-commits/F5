// services/api/src/sync/category-mapping.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CategoryMapping {
  local_category: string;
  marketplace: string;
  marketplace_category_id: string;
  marketplace_category_name: string;
}

/**
 * STEP 23: Category mapping service
 * Traduz categorias locais para as categorias de cada marketplace
 * Exemplo: "Eletrodomésticos" → ML: 1000, Shopee: 2000, Amazon: 3000
 */
@Injectable()
export class CategoryMappingService {
  private readonly logger = new Logger(CategoryMappingService.name);

  private readonly defaultMappings: Record<string, Record<string, string>> = {
    'Eletrodomésticos': {
      mercado_livre: '1000',
      shopee: '1001',
      amazon: '1002',
      magalu: '1003',
    },
    'Iluminação': {
      mercado_livre: '2000',
      shopee: '2001',
      amazon: '2002',
      magalu: '2003',
    },
    'Acessórios': {
      mercado_livre: '3000',
      shopee: '3001',
      amazon: '3002',
      magalu: '3003',
    },
    'Ferramentas': {
      mercado_livre: '4000',
      shopee: '4001',
      amazon: '4002',
      magalu: '4003',
    },
    'Materiais de Construção': {
      mercado_livre: '5000',
      shopee: '5001',
      amazon: '5002',
      magalu: '5003',
    },
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Traduz categoria local para ID do marketplace
   * Usa cache em memória com fallback para DB
   */
  async translateCategory(
    localCategory: string,
    marketplace: string
  ): Promise<string | null> {
    // Try default mapping first
    if (this.defaultMappings[localCategory]) {
      return this.defaultMappings[localCategory][marketplace] || null;
    }

    // Try database for custom mappings
    const mapping = await this.prisma.categoryMappings.findUnique({
      where: {
        local_category_marketplace: {
          local_category: localCategory,
          marketplace: marketplace as any,
        },
      },
    });

    if (mapping) {
      return mapping.marketplace_category_id;
    }

    this.logger.warn(
      `Category mapping not found: ${localCategory} → ${marketplace}`
    );
    return null;
  }

  /**
   * Obter todas as categorias mapeadas
   */
  async getAllMappings(): Promise<CategoryMapping[]> {
    return await this.prisma.categoryMappings.findMany({
      orderBy: [{ local_category: 'asc' }, { marketplace: 'asc' }],
    });
  }

  /**
   * Adicionar/atualizar mapeamento de categoria
   */
  async upsertMapping(
    localCategory: string,
    marketplace: string,
    marketplaceCategoryId: string,
    marketplaceCategoryName: string
  ): Promise<CategoryMapping> {
    return await this.prisma.categoryMappings.upsert({
      where: {
        local_category_marketplace: {
          local_category: localCategory,
          marketplace: marketplace as any,
        },
      },
      create: {
        local_category: localCategory,
        marketplace: marketplace as any,
        marketplace_category_id: marketplaceCategoryId,
        marketplace_category_name: marketplaceCategoryName,
      },
      update: {
        marketplace_category_id: marketplaceCategoryId,
        marketplace_category_name: marketplaceCategoryName,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Validar categoria antes de publicar produto
   */
  async validateCategory(
    localCategory: string,
    requiredMarketplaces: string[]
  ): Promise<{
    valid: boolean;
    missingMappings: string[];
  }> {
    const missingMappings: string[] = [];

    for (const marketplace of requiredMarketplaces) {
      const mapping = await this.translateCategory(
        localCategory,
        marketplace
      );
      if (!mapping) {
        missingMappings.push(marketplace);
      }
    }

    return {
      valid: missingMappings.length === 0,
      missingMappings,
    };
  }
}
