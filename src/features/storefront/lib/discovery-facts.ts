import type { DiscoveryItem } from './discovery-pilot';

// Stable device facts, reviewed separately from the 24-hour merchant price snapshot.
// These are manufacturer statements, not hands-on tests or local stock promises.
const records = {
  'pcshop-1': {
    sku: 'I28705',
    icons: ['hand', 'bluetooth'],
    checkedAt: '2026-09-08',
    source: 'https://www.logitech.com/en-us/shop/p/m650-signature-wireless-mouse',
    ka: ['მწარმოებლის რეკომენდაცია: დიდი ხელისთვის.', 'დაკავშირება: Bluetooth ან Logi Bolt USB.'],
    en: ['Manufacturer recommendation: large hands.', 'Connect with Bluetooth or Logi Bolt USB.'],
    ru: ['Производитель рекомендует этот размер для большой руки.', 'Подключение: Bluetooth или Logi Bolt USB.'],
  },
  'pcshop-2': {
    sku: 'I31167',
    icons: ['bluetooth', 'usb'],
    checkedAt: '2026-09-08',
    source: 'https://support.logi.com/hc/en-nz/articles/16171133096087-Specification-Pebble-Mouse-2-M350s',
    ka: ['დაკავშირება: Bluetooth Low Energy.', 'Logi Bolt USB მიმღები კომპლექტში არ შედის.'],
    en: ['Connect with Bluetooth Low Energy.', 'The compatible Logi Bolt USB receiver is not included.'],
    ru: ['Подключение: Bluetooth Low Energy.', 'Совместимый USB-приёмник Logi Bolt не входит в комплект.'],
  },
} as const;

export function getDiscoveryFacts(item: Pick<DiscoveryItem, 'id' | 'merchantSku'>) {
  const record = records[item.id as keyof typeof records];
  return record?.sku === item.merchantSku ? record : null;
}
