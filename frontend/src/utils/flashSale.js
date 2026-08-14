// Helpers for the /sale/getActiveSales/ response.
// Backend only filters on FlashSale.status, so the per-product
// start_date / end_date window is evaluated here on the client.

export const SALE_STATE = {
  LIVE: 'live',
  UPCOMING: 'upcoming',
  ENDED: 'ended',
};

// Kaunsa product abhi live hai, kaunsa aane wala hai
export const getSaleState = (item, now = Date.now()) => {
  const start = new Date(item.start_date).getTime();
  const end = new Date(item.end_date).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return SALE_STATE.ENDED;
  if (now < start) return SALE_STATE.UPCOMING;
  if (now > end) return SALE_STATE.ENDED;
  return SALE_STATE.LIVE;
};

// Live products ke liye end_date, upcoming ke liye start_date par timer chalta hai
export const getTargetDate = (item, state) =>
  state === SALE_STATE.UPCOMING ? item.start_date : item.end_date;

export const getSalePrice = (item) => Number(item.sale_price) || 0;

export const getOriginalPrice = (item) => Number(item.product?.price) || 0;

export const getDiscountPercent = (item) => {
  const original = getOriginalPrice(item);
  const sale = getSalePrice(item);
  if (!original || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

export const getSavings = (item) =>
  Math.max(getOriginalPrice(item) - getSalePrice(item), 0);

export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// Saare sales ke products ko ek flat list mein kholta hai (sale ka naam saath rakhte hue)
export const flattenSaleProducts = (sales = []) =>
  sales.flatMap((sale) =>
    (sale.flash_products || []).map((item) => ({
      ...item,
      saleId: sale.id,
      saleName: sale.name,
    }))
  );

export const SORT_OPTIONS = [
  { value: 'discount', label: 'Biggest discount' },
  { value: 'ending', label: 'Ending soonest' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
];

export const sortSaleProducts = (items, sortBy) => {
  const sorted = [...items];
  switch (sortBy) {
    case 'ending':
      return sorted.sort(
        (a, b) => new Date(a.end_date) - new Date(b.end_date)
      );
    case 'price-low':
      return sorted.sort((a, b) => getSalePrice(a) - getSalePrice(b));
    case 'price-high':
      return sorted.sort((a, b) => getSalePrice(b) - getSalePrice(a));
    case 'discount':
    default:
      return sorted.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  }
};
