// services/api/src/marketplace/shopee.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface ShopeeAuthToken {
  access_token: string;
  expire_in: number;
  refresh_token: string;
}

export interface ShopeeProduct {
  item_id: number;
  item_name: string;
  item_sku: string;
  price: number;
  stock: number;
  category_id: number;
}

export interface ShopeeOrder {
  order_sn: string;
  order_status: string;
  create_time: number;
  buyer_user_id: number;
  buyer_username: string;
  order_total: number;
  item_list: {
    item_id: number;
    item_name: string;
    item_sku: string;
    quantity: number;
    model_name?: string;
  }[];
  recipient_address: {
    country: string;
    state: string;
    city: string;
  };
  package_list: {
    package_number: string;
    logistics_status: string;
  }[];
}

/**
 * STEP 42: Shopee API Connector
 * Implementa integração real com Shopee
 * - OAuth 2.0 authentication
 * - Fetch products (inventory)
 * - Fetch orders
 * - Update product (price/quantity)
 */
@Injectable()
export class ShopeeService {
  private readonly logger = new Logger(ShopeeService.name);
  private readonly apiUrl = 'https://partner.shopeemobile.com/api/v2';
  private readonly oauthUrl = 'https://partner.shopeemobile.com/api/v2/auth/token/get';
  private readonly partnerId = process.env.SHOPEE_PARTNER_ID || '';
  private readonly partnerKey = process.env.SHOPEE_PARTNER_KEY || '';
  private readonly redirectUrl = process.env.SHOPEE_REDIRECT_URL || '';

  private client: AxiosInstance;

  constructor(private prisma: PrismaService) {
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
    });
  }

  /**
   * Gerar signature para requisições Shopee
   */
  private generateSignature(
    path: string,
    timestamp: number,
    accessToken?: string
  ): string {
    let baseString = `${path}${this.partnerId}${accessToken || ''}${timestamp}`;
    return crypto
      .createHmac('sha256', this.partnerKey)
      .update(baseString)
      .digest('hex');
  }

  /**
   * Obter authorization URL para OAuth
   */
  getAuthUrl(tenantId: string): string {
    const codeChallenge = this.generateSignature('', Math.floor(Date.now() / 1000));

    const params = new URLSearchParams({
      client_id: this.partnerId,
      redirect_uri: this.redirectUrl,
      response_type: 'code',
      scope: 'cart_order_readonly,product_readonly,product_update',
      state: btoa(`${tenantId}:${Date.now()}`),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://partner.shopeemobile.com/api/v2/oauth/authorize?${params.toString()}`;
  }

  /**
   * Trocar authorization code por access token
   */
  async exchangeCodeForToken(code: string, shopId: string): Promise<ShopeeAuthToken> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/auth/token/get';

      const signature = this.generateSignature(path, timestamp);

      const response = await axios.post<any>(
        `https://partner.shopeemobile.com${path}`,
        {
          partner_id: this.partnerId,
          code,
          shop_id: shopId,
        },
        {
          params: {
            timestamp,
            sign: signature,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description);
      }

      this.logger.log('✅ Shopee OAuth token obtained');
      return {
        access_token: response.data.access_token,
        expire_in: response.data.expire_in,
        refresh_token: response.data.refresh_token,
      };
    } catch (error) {
      this.logger.error('❌ Shopee OAuth exchange failed:', error);
      throw error;
    }
  }

  /**
   * Renovar access token
   */
  async refreshToken(
    refreshToken: string,
    shopId: string
  ): Promise<ShopeeAuthToken> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/auth/access_token/get';

      const signature = this.generateSignature(path, timestamp);

      const response = await axios.post<any>(
        `https://partner.shopeemobile.com${path}`,
        {
          partner_id: this.partnerId,
          refresh_token: refreshToken,
          shop_id: shopId,
        },
        {
          params: {
            timestamp,
            sign: signature,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description);
      }

      this.logger.log('✅ Shopee token refreshed');
      return {
        access_token: response.data.access_token,
        expire_in: response.data.expire_in,
        refresh_token: response.data.refresh_token,
      };
    } catch (error) {
      this.logger.error('❌ Shopee token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Buscar produtos (inventory)
   */
  async fetchProducts(
    accessToken: string,
    shopId: string,
    pageSize: number = 100
  ): Promise<ShopeeProduct[]> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/product/get_item_list';

      const signature = this.generateSignature(path, timestamp, accessToken);

      const response = await axios.get<any>(`${this.apiUrl}${path}`, {
        params: {
          partner_id: this.partnerId,
          shop_id: shopId,
          timestamp,
          sign: signature,
          page_size: pageSize,
          cursor: '0',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error_description);
      }

      const items = response.data.response?.item_list || [];
      this.logger.log(`✅ Fetched ${items.length} Shopee products`);

      return items.map((item: any) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_sku: item.item_sku,
        price: item.price / 100000, // Shopee stores in smallest unit
        stock: item.stock,
        category_id: item.category_id,
      }));
    } catch (error) {
      this.logger.error('❌ Failed to fetch Shopee products:', error);
      throw error;
    }
  }

  /**
   * Buscar pedidos
   */
  async fetchOrders(
    accessToken: string,
    shopId: string,
    timeFrom: number,
    timeTo: number,
    pageSize: number = 50
  ): Promise<ShopeeOrder[]> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/order/get_order_list';

      const signature = this.generateSignature(path, timestamp, accessToken);

      const response = await axios.get<any>(`${this.apiUrl}${path}`, {
        params: {
          partner_id: this.partnerId,
          shop_id: shopId,
          timestamp,
          sign: signature,
          time_from: timeFrom,
          time_to: timeTo,
          page_size: pageSize,
          order_status: 'COMPLETED,RETURNED_PARTIAL,SHIPPED',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error_description);
      }

      const orders = response.data.response?.order_list || [];
      this.logger.log(`✅ Fetched ${orders.length} Shopee orders`);

      return orders;
    } catch (error) {
      this.logger.error('❌ Failed to fetch Shopee orders:', error);
      throw error;
    }
  }

  /**
   * Atualizar preço e quantidade
   */
  async updateProduct(
    accessToken: string,
    shopId: string,
    itemId: number,
    updates: {
      price?: number;
      stock?: number;
    }
  ): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/product/update_item';

      const signature = this.generateSignature(path, timestamp, accessToken);

      const payload: any = {
        partner_id: this.partnerId,
        shop_id: shopId,
        item_id: itemId,
      };

      if (updates.price !== undefined) {
        payload.price = Math.round(updates.price * 100000); // Convert to Shopee unit
      }

      if (updates.stock !== undefined) {
        payload.stock = updates.stock;
      }

      const response = await axios.post<any>(
        `${this.apiUrl}${path}`,
        payload,
        {
          params: {
            partner_id: this.partnerId,
            timestamp,
            sign: signature,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description);
      }

      this.logger.log(`✅ Updated Shopee product ${itemId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to update Shopee product ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Webhook handler para Shopee
   */
  async handleWebhook(
    tenantId: string,
    payload: any
  ): Promise<void> {
    try {
      const event = payload.event;

      this.logger.log(`📥 Shopee Webhook: ${event}`);

      if (event === 'order_status' && payload.data?.order_status === 'COMPLETED') {
        // New order
        this.logger.log(`📦 New Shopee order: ${payload.data.order_sn}`);
        // TODO: Fetch and sync order
      } else if (event === 'item' && payload.data?.action === 'update') {
        // Product update
        this.logger.log(`📝 Shopee item updated: ${payload.data.item_id}`);
        // TODO: Fetch and update inventory
      }
    } catch (error) {
      this.logger.error('❌ Shopee webhook handling failed:', error);
    }
  }

  /**
   * Sincronizar categoria local com Shopee
   */
  async mapCategory(localCategory: string): Promise<number | null> {
    // Shopee categories: common IDs
    const categoryMap: Record<string, number> = {
      'Eletrodomésticos': 100223,
      'Iluminação': 100181,
      'Acessórios': 100001,
      'Ferramentas': 100259,
      'Materiais de Construção': 100263,
    };

    return categoryMap[localCategory] || null;
  }
}
