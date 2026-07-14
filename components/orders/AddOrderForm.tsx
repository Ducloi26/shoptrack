'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { CARRIER_OPTIONS } from '../../lib/constants';
import type { CarrierId } from '../../types';

interface AddOrderFormProps {
  onSubmit: (data: { carrier: CarrierId; tracking_code: string; phone?: string; note?: string }) => Promise<void>;
  loading?: boolean;
}

interface FormErrors {
  carrier?: string;
  tracking_code?: string;
}

export function AddOrderForm({ onSubmit, loading = false }: AddOrderFormProps) {
  const [carrier, setCarrier] = useState<CarrierId | ''>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!carrier) newErrors.carrier = 'Vui lòng chọn đơn vị vận chuyển';
    if (trackingCode.trim().length < 5) newErrors.tracking_code = 'Mã vận đơn tối thiểu 5 ký tự';
    if (trackingCode.trim().length > 50) newErrors.tracking_code = 'Mã vận đơn tối đa 50 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !carrier) return;

    await onSubmit({
      carrier: carrier as CarrierId,
      tracking_code: trackingCode.trim(),
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });

    // Reset form sau khi submit thành công
    setCarrier('');
    setTrackingCode('');
    setPhone('');
    setNote('');
    setErrors({});
  };

  const carrierOptions = CARRIER_OPTIONS.map((c) => ({
    value: c.id,
    label: c.name,
    color: c.color,
  }));

  return (
    <form
      id="add-order-form"
      className="add-order-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="form-row">
        <Select
          id="carrier-select"
          label="Đơn vị vận chuyển"
          placeholder="Chọn đơn vị..."
          options={carrierOptions}
          value={carrier}
          onChange={(e) => {
            setCarrier(e.target.value as CarrierId);
            setErrors((p) => ({ ...p, carrier: undefined }));
          }}
          error={errors.carrier}
          required
        />

        <Input
          id="tracking-code-input"
          label="Mã vận đơn"
          placeholder="VD: SPX123456789VN"
          value={trackingCode}
          onChange={(e) => {
            setTrackingCode(e.target.value.toUpperCase());
            setErrors((p) => ({ ...p, tracking_code: undefined }));
          }}
          error={errors.tracking_code}
          hint="5–50 ký tự, không phân biệt hoa thường"
          maxLength={50}
          required
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="form-row form-row-secondary">
        <Input
          id="phone-input"
          label="Số điện thoại nhận hàng"
          placeholder="0912345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          hint="Tuỳ chọn — một số carrier cần SĐT để tra cứu"
        />

        <Input
          id="note-input"
          label="Ghi chú"
          placeholder="Mua hàng Shopee, đơn áo xanh..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          hint={`${note.length}/200`}
        />
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
          id="submit-add-order"
          icon={!loading ? <span>+</span> : undefined}
        >
          {loading ? 'Đang thêm...' : 'Theo dõi đơn hàng'}
        </Button>
      </div>
    </form>
  );
}
