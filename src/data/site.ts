export const site = {
  name: 'Kedai Penapis Air Kesihatan',
  shortName: 'Penapis Air Kesihatan',
  legalName: 'CAHAYA SUKMAR',
  registration: 'JM0510596X / 200803055593',
  started: '24 Mac 2008',
  url: 'https://penapisairkesihatan.my',
  phoneDisplay: '+60 17-710 6169',
  phoneHref: '+60177106169',
  whatsappNumber: '60177106169',
  email: 'shukor_hassan@ymail.com',
  address: {
    street: '84, Jalan Intan 12',
    locality: 'Taman Cahaya Masai',
    postalCode: '81700',
    city: 'Pasir Gudang',
    state: 'Johor',
    country: 'MY',
    display: '84, Jalan Intan 12, Taman Cahaya Masai, 81700 Pasir Gudang, Johor',
  },
  maps: 'https://www.google.com/maps/?cid=1732927229402855681',
  directions:
    'https://www.google.com/maps/dir/?api=1&destination=84%2C%20Jalan%20Intan%2012%2C%20Taman%20Cahaya%20Masai%2C%2081700%20Pasir%20Gudang%2C%20Johor',
  facebook: 'https://www.facebook.com/penapisairMalaysiamurajimat0177106169/',
} as const;

export const nav = [
  { href: '/servis-penapis-air-pasir-gudang/', label: 'Servis' },
  { href: '/penapis-air-rumah/', label: 'Pilih penapis' },
  { href: '/tukar-filter/', label: 'Tukar filter' },
  { href: '/panduan/', label: 'Panduan' },
  { href: '/tentang/', label: 'Tentang' },
  { href: '/hubungi/', label: 'Hubungi' },
] as const;

export const guides = [
  {
    slug: 'cara-pilih-penapis-air-rumah',
    title: 'Cara pilih penapis air untuk rumah tanpa tersalah beli',
    description:
      'Mulakan dengan sumber air, kegunaan, ruang, bajet pemilikan dan penyelenggaraan—bukan dakwaan pemasaran semata-mata.',
    category: 'Panduan membeli',
    readingTime: '6 minit',
    datePublished: '2026-08-20',
  },
  {
    slug: 'bila-perlu-tukar-filter-penapis-air',
    title: 'Bila perlu tukar filter penapis air?',
    description:
      'Jadual pengeluar ialah titik mula. Penggunaan, keadaan air dan tanda pada sistem menentukan pemeriksaan sebenar.',
    category: 'Penyelenggaraan',
    readingTime: '5 minit',
    datePublished: '2026-08-20',
  },
  {
    slug: 'tanda-penapis-air-perlu-servis',
    title: '6 tanda penapis air mungkin perlu diservis',
    description:
      'Aliran perlahan, kebocoran dan perubahan luar biasa patut diperiksa—tetapi jangan teka punca tanpa melihat sistem.',
    category: 'Servis',
    readingTime: '5 minit',
    datePublished: '2026-08-20',
  },
] as const;

export function whatsappUrl(message = 'Salam, saya ingin bertanya tentang penapis air.') {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function absoluteUrl(path = '/') {
  return new URL(path, site.url).toString();
}

export function breadcrumbSchema(items: Array<{ label: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Store'],
  '@id': `${site.url}/#business`,
  name: site.name,
  alternateName: 'Penapis air shukor',
  legalName: site.legalName,
  url: site.url,
  telephone: site.phoneHref,
  email: site.email,
  foundingDate: '2008-03-24',
  description:
    'Kedai tempatan untuk jualan, pemilihan dan servis penapis air sedia ada di Taman Cahaya Masai, Pasir Gudang.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  hasMap: site.maps,
  sameAs: [site.facebook, site.maps],
  makesOffer: [
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Servis penapis air sedia ada',
      },
    },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: 'Peralatan penapis air',
      },
    },
  ],
};
