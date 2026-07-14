import axios from 'axios';
import type { TrackingResult } from '@shared';
import { guessNormalizedStatus, type CarrierTracker } from './base';

/**
 * GHN — Giao Hàng Nhanh
 */
export class GhnTracker implements CarrierTracker {
  carrierId = 'GHN' as const;

  async fetchStatus(trackingCode: string): Promise<TrackingResult> {
    try {
      const response = await axios.post(
        'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/tracking',
        { order_code: trackingCode },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': process.env.GHN_API_TOKEN || 'placeholder-token',
          },
          timeout: 10000,
        }
      );

      const data = response.data?.data;
      const rawStatus = data?.status || 'unknown';
      const logs = data?.logs || [];

      return {
        rawStatus,
        normalizedStatus: guessNormalizedStatus(rawStatus),
        history: logs.map((l: any) => ({
          time: l.updated_date || new Date().toISOString(),
          description: l.status_name || l.description || '',
          location: l.warehouse_location || '',
        })),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error(`[GHN] fetchStatus failed for ${trackingCode}:`, error.message);
      return {
        rawStatus: 'fetch_error',
        normalizedStatus: 'unknown',
        history: [],
        updatedAt: new Date().toISOString(),
      };
    }
  }
}
