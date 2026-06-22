// services/api/src/marketplace/mercado-livre.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from '../prisma/prisma.service';

export interface MLAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export interface MLProduct {
  id: string;
  title: string;
  category_id: string;
  price: number;
  available_quantity: number;
  description: string;
}

export interface MLOrder {
  id: number;
  status: string;
  date_created: string;
  date_closed: string;
  buyer: {
    id: number;
    nickname: string;
    email: string;
  };
  order_items: {
    item: {
      id: string;
      title: string;
      sku: string;
    };
    quantity: number;
    unit_price: number;
  }[];
  shipping: {
    cost: number;
    status: string;
  };
  totals: {
    total_amount: number;
    paid_amount: number;
    shipping_cost: number;
  };
}

/**
 * STEP 41: Mercado Livre OAuth & API Connector
 * Implementa integração real com Mercado Livre
 * - OAuth 2.0 authentication
 * - Fetch products (inventory)
 * - Fetch orders
 * - Update product prices (dynamic pricing future)
 */
@Injectable()
export class MercadoLivreService {
  private readonly logger = new Logger(MercadoLivreService.name);
  private readonly apiUrl = 'https://api.mercadolibre.com';
  private readonly oauthUrl = 'https://auth.mercadolibre.com.br';
  private readonly clientId = process.env.ML_CLIENT_ID || '';
  private readonly clientSecret = process.env.ML_CLIENT_SECRET || '';
  private readonly redirectUrl = process.env.ML_REDIRECT_URL || '';

  private client: AxiosInstance;

  constructor(private prisma: PrismaService) {
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
    });
  }

  /**
   * Obter URL de autorização para OAuth flow
   */
  getAuthUrl(tenantId: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUrl,
      state: btoa(`${tenantId}:${Date.now()}`),
    });

    return `${this.oauthUrl}/authorization?${params.toString()}`;
  }

  /**
   * Trocar authorization code por access token
   */
  async exchangeCodeForToken(code: string): Promise<MLAuthToken> {
    try {
      const response = await axios.post<MLAuthToken>(
        `${this.oauthUrl}/oauth/token`,
        {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUrl,
        }
      );

      this.logger.log('✅ ML OAuth token obtained');
      return response.data;
    } catch (error) {
      this.logger.error('❌ ML OAuth exchange failed:', error);
      throw error;
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<MLAuthToken> {
    try {
      const response = await axios.post<MLAuthToken>(
        `${this.oauthUrl}/oauth/token`,
        {
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }
      );

      this.logger.log('✅ ML token refreshed');
      return response.data;
    } catch (error) {
      this.logger.error('❌ ML token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Buscar produtos (estoque) de um seller
   * GET /users/{user_id}/listings
   */
  async fetchProducts(accessToken: string, userId: string): Promise<MLProduct[]> {
    try {
      const response = await this.client.get(`/users/${userId}/listings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const listings = response.data || [];
      this.logger.log(`✅ Fetched ${listings.length} ML listings`);

      // Fetch detailed info para cada listing
      const products = [];
      for (const listingId of listings.slice(0, 100)) {
        // Limit to 100 for testing
        try {
          const productResponse = await this.client.get(
            `/items/${listingId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          products.push({
            id: productResponse.data.id,
            title: productResponse.data.title,
            category_id: productResponse.data.category_id,
            price: productResponse.data.price,
            available_quantity: productResponse.data.available_quantity,
            description: productResponse.data.description,
          });
        } catch (err) {
          this.logger.warn(`Could not fetch listing ${listingId}`);
        }
      }

      return products;
    } catch (error) {
      this.logger.error('❌ Failed to fetch ML products:', error);
      throw error;
    }
  }

  /**
   * Buscar pedidos
   * GET /orders/search
   */
  async fetchOrders(
    accessToken: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MLOrder[]> {
    try {
      const response = await this.client.get('/orders/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          seller: userId,
          limit,
          offset,
          sort: 'date_desc',
          q: 'status:paid',
        },
      });

      const orders = response.data.results || [];
      this.logger.log(`✅ Fetched ${orders.length} ML orders`);

      return orders;
    } catch (error) {
      this.logger.error('❌ Failed to fetch ML orders:', error);
      throw error;
    }
  }

  /**
   * Atualizar preço de um item
   */
  async updatePrice(
    accessToken: string,
    itemId: string,
    newPrice: number
  ): Promise<boolean> {
    try {
      await this.client.put(`/items/${itemId}`, {
        price: newPrice,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      this.logger.log(`✅ Updated price for ${itemId} to R$ ${newPrice}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to update price for ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Atualizar quantidade disponível
   */
  async updateQuantity(
    accessToken: string,
    itemId: string,
    newQuantity: number
  ): Promise<boolean> {
    try {
      await this.client.put(`/items/${itemId}`, {
        available_quantity: newQuantity,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      this.logger.log(`✅ Updated quantity for ${itemId} to ${newQuantity} units`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to update quantity for ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Publicar novo produto
   */
  async publishProduct(
    accessToken: string,
    userId: string,
    product: {
      title: string;
      category_id: string;
      price: number;
      quantity: number;
      description: string;
      pictures: string[];
      attributes?: any[];
    }
  ): Promise<string> {
    try {
      const response = await this.client.post('/items', {
        title: product.title,
        category_id: product.category_id,
        price: product.price,
        available_quantity: product.quantity,
        description: product.description,
        pictures: product.pictures.map(url => ({ url })),
        attributes: product.attributes || [],
        seller_id: userId,
        listing_type_id: 'gold_special',
        condition: 'new',
        sale_terms: [],
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      this.logger.log(`✅ Published product: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('❌ Failed to publish product:', error);
      throw error;
    }
  }

  /**
   * Webhook handler para ML
   */
  async handleWebhook(
    tenantId: string,
    payload: any
  ): Promise<void> {
    try {
      const topic = payload.topic;
      const resource = payload.resource;

      this.logger.log(`📥 ML Webhook: ${topic} → ${resource}`);

      if (topic === 'orders_v2' && resource.includes('/orders/')) {
        // Order update
        const orderId = resource.split('/').pop();
        this.logger.log(`📦 Order update: ${orderId}`);
        // TODO: Fetch and sync order
      } else if (topic === 'items' && resource.includes('/items/')) {
        // Listing update
        const itemId = resource.split('/').pop();
        this.logger.log(`📝 Listing update: ${itemId}`);
        // TODO: Fetch and update inventory
      }
    } catch (error) {
      this.logger.error('❌ ML webhook handling failed:', error);
    }
  }

  /**
   * Sincronizar categoria local com ML
   */
  async mapCategory(localCategory: string): Promise<string | null> {
    // Mercado Livre categories: common IDs
    const categoryMap: Record<string, string> = {
      'Eletrodomésticos': 'MLA1051',
      'Iluminação': 'MLA1043',
      'Acessórios': 'MLA1183',
      'Ferramentas': 'MLA1032',
      'Materiais de Construção': 'MLA1089',
    };

    return categoryMap[localCategory] || null;
  }
}
