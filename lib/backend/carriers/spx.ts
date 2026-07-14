import axios from 'axios';
import crypto from 'crypto';
import type { TrackingResult } from '@shared';
import { guessNormalizedStatus, type CarrierTracker } from './base';

/**
 * SPX — Shopee Express
 */
function translateSpxMessage(msg: string): string {
  let translated = msg;
  
  const mappings = [
    { en: 'Your parcel has been received by pickup hub', vi: 'Bưu cục lấy hàng đã nhận gói hàng' },
    { en: 'Your parcel has been received by sorting center', vi: 'Kho phân loại đã nhận gói hàng' },
    { en: 'Your parcel has been received by sorting hub', vi: 'Kho phân loại đã nhận gói hàng' },
    { en: 'Your parcel has been picked up', vi: 'Lấy hàng thành công' },
    { en: 'Order has been created', vi: 'Đơn hàng đã được tạo' },
    { en: 'Your parcel has been delivered', vi: 'Giao hàng thành công' },
    { en: 'Your parcel is being delivered by courier', vi: 'Shipper đang đi giao hàng' },
    { en: 'Your parcel has arrived at sorting station', vi: 'Gói hàng đã đến kho phân loại' },
    { en: 'Your parcel has departed from sorting station', vi: 'Gói hàng đã rời kho phân loại' },
    { en: 'Your parcel has departed from', vi: 'Gói hàng đã rời' },
    { en: 'Your parcel has arrived at', vi: 'Gói hàng đã đến' },
    { en: 'Your parcel is being sorted', vi: 'Gói hàng đang được phân loại' },
    { en: 'Your parcel has left', vi: 'Gói hàng đã rời' },
    { en: 'unloaded at', vi: 'đã dỡ xuống tại' },
    { en: 'unloading at', vi: 'đang được dỡ xuống tại' },
    { en: 'via Linehaul Trip', vi: 'qua Chuyến xe trung chuyển' },
    { en: 'transporting to', vi: 'đang được vận chuyển đến' },
    { en: 'Parcel', vi: 'Gói hàng' },
  ];

  for (const item of mappings) {
    const regex = new RegExp(item.en, 'gi');
    translated = translated.replace(regex, item.vi);
  }
  
  return translated;
}

export class SpxTracker implements CarrierTracker {
  carrierId = 'SPX' as const;

  async fetchStatus(trackingCode: string): Promise<TrackingResult> {
    try {
      // Thiết lập thuật toán chữ ký bảo mật của SPX
      const salt = Buffer.from('0ebfffe63d2a481cf57fe7d5ebdc9fd6').toString('base64');
      const ts = Math.floor(Date.now() / 1000).toString();
      const dataToHash = trackingCode + ts + salt;
      const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
      
      const paramValue = `${trackingCode}|${ts}${hash}`;

      const response = await axios.get(
        `https://spx.vn/api/v2/fleet_order/tracking/search?sls_tracking_number=${encodeURIComponent(paramValue)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://spx.vn/',
            'Origin': 'https://spx.vn',
          },
          timeout: 10000,
        }
      );

      const resData = response.data;
      if (resData.retcode !== 0) {
        throw new Error(resData.message || 'Lỗi phản hồi từ SPX');
      }

      const trackingList = resData?.data?.tracking_list || [];
      
      const sortedEvents = [...trackingList].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      const latestEvent = sortedEvents[0];
      
      const originalRawStatus = latestEvent?.message || latestEvent?.status || 'Chưa có thông tin';
      const normalizedStatus = guessNormalizedStatus(originalRawStatus);
      const rawStatus = translateSpxMessage(originalRawStatus);

      const historyEvents = [...trackingList].sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
      
      const history = historyEvents.map((a: any) => {
        const tsVal = a.timestamp ? (a.timestamp > 9999999999 ? a.timestamp : a.timestamp * 1000) : Date.now();
        const origDesc = a.message || a.status || '';
        return {
          time: new Date(tsVal).toISOString(),
          description: translateSpxMessage(origDesc),
          location: a.area || '',
        };
      });

      return {
        rawStatus,
        normalizedStatus,
        history,
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      // Soft error — không crash worker
      console.error(`[SPX] fetchStatus failed for ${trackingCode}:`, error.message);
      return {
        rawStatus: 'fetch_error',
        normalizedStatus: 'unknown',
        history: [],
        updatedAt: new Date().toISOString(),
      };
    }
  }
}
