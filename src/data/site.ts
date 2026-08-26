export const site = {
  name: 'Penapis Air Kesihatan',
  shortName: 'Penapis Air Kesihatan',
  legalName: 'CAHAYA SUKMAR',
  registration: 'JM0510596X / 200803055593',
  started: '24 Mac 2008',
  url: 'https://penapisairkesihatan.my',
  phoneDisplay: '+60 17-710 6169',
  phoneHref: '+60177106169',
  whatsappNumber: '60177106169',
  email: 'info@penapisairkesihatan.my',
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
  facebook: 'https://www.facebook.com/profile.php?id=100085066596278',
} as const;

export const nav = [
  { href: '/penapis-air-rumah/', label: 'Penapis air rumah' },
  { href: '/tukar-filter/', label: 'Tukar filter' },
  { href: '/servis-penapis-air-pasir-gudang/', label: 'Servis penapis air' },
  { href: '/panduan/', label: 'Panduan' },
  { href: '/tentang/', label: 'Tentang' },
  { href: '/hubungi/', label: 'Hubungi' },
] as const;

export const guides = [
  {
    slug: 'cara-pilih-penapis-air-rumah',
    title: 'Cara pilih penapis air untuk rumah tanpa tersalah beli',
    description:
      'Mulakan dengan kegunaan, ruang, bajet pemilikan dan penyelenggaraan—bukan dakwaan pemasaran atau bilangan filter semata-mata.',
    category: 'Panduan membeli',
    readingTime: '6 minit',
    datePublished: '2026-08-20',
    dateModified: '2026-08-24',
    related: [
      { href: '/penapis-air-rumah/', label: 'Pilihan rumah', title: 'Penapis air RO, sistem mineral dan dispenser' },
      { href: '/panduan/bila-perlu-tukar-filter-penapis-air/', label: 'Penyelenggaraan', title: 'Bila perlu tukar filter penapis air?' },
      { href: '/tukar-filter/', label: 'Semakan komponen', title: 'Semak filter gantian berdasarkan model' },
    ],
  },
  {
    slug: 'bila-perlu-tukar-filter-penapis-air',
    title: 'Bila perlu tukar filter penapis air?',
    description:
      'Jadual pengeluar ialah titik mula. Penggunaan, keadaan air dan tanda pada sistem menentukan pemeriksaan sebenar.',
    category: 'Penyelenggaraan',
    readingTime: '5 minit',
    datePublished: '2026-08-20',
    dateModified: '2026-08-24',
    related: [
      { href: '/tukar-filter/', label: 'Filter gantian', title: 'Cara menyemak filter sebelum membeli' },
      { href: '/servis-penapis-air-pasir-gudang/', label: 'Servis', title: 'Servis penapis air di Pasir Gudang' },
      { href: '/panduan/tanda-penapis-air-perlu-servis/', label: 'Pemeriksaan', title: '6 tanda penapis air mungkin perlu diservis' },
    ],
  },
  {
    slug: 'tanda-penapis-air-perlu-servis',
    title: '6 tanda penapis air mungkin perlu diservis',
    description:
      'Aliran perlahan, kebocoran dan perubahan luar biasa patut diperiksa—tetapi jangan teka punca tanpa melihat sistem.',
    category: 'Servis',
    readingTime: '5 minit',
    datePublished: '2026-08-20',
    dateModified: '2026-08-24',
    related: [
      { href: '/servis-penapis-air-pasir-gudang/', label: 'Servis', title: 'Semak servis penapis air di Pasir Gudang' },
      { href: '/tukar-filter/', label: 'Filter gantian', title: 'Kenal pasti model sebelum menukar filter' },
      { href: '/panduan/bila-perlu-tukar-filter-penapis-air/', label: 'Penyelenggaraan', title: 'Bila perlu tukar filter penapis air?' },
    ],
  },
  {
    slug: 'penapis-air-ro-atau-mineral',
    title: 'Penapis air RO atau mineral: apa perlu dibandingkan?',
    description:
      'RO menerangkan satu proses, manakala “mineral” tidak semestinya menerangkan teknologi. Banding model, aliran, penjagaan dan bukti yang tepat.',
    category: 'Perbandingan sistem',
    readingTime: '7 minit',
    datePublished: '2026-08-24',
    dateModified: '2026-08-24',
    related: [
      { href: '/penapis-air-rumah/', label: 'Pilihan rumah', title: 'Semak sistem RO, mineral dan dispenser' },
      { href: '/panduan/cara-pilih-penapis-air-rumah/', label: 'Panduan membeli', title: 'Cara pilih penapis air rumah' },
      { href: '/tukar-filter/', label: 'Penyelenggaraan', title: 'Kenal pasti filter dan cartridge gantian' },
    ],
  },
  {
    slug: 'penapis-air-indoor-atau-outdoor',
    title: 'Penapis air indoor atau outdoor: apa bezanya?',
    description:
      'Bezakan lokasi pemasangan daripada titik rawatan. Fahami penggunaan satu paip, laluan masuk rumah, aliran, ruang dan keperluan servis.',
    category: 'Susunan rumah',
    readingTime: '7 minit',
    datePublished: '2026-08-24',
    dateModified: '2026-08-24',
    related: [
      { href: '/servis-penapis-air-pasir-gudang/', label: 'Servis unit sedia ada', title: 'Semak penapis indoor atau outdoor' },
      { href: '/penapis-air-rumah/', label: 'Pemilihan', title: 'Penapis air rumah mengikut kegunaan' },
      { href: '/panduan/cara-pilih-penapis-air-rumah/', label: 'Panduan membeli', title: 'Cara memilih mengikut titik penggunaan' },
    ],
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

export const operatorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${site.url}/#operator`,
  name: site.legalName,
  legalName: site.legalName,
  url: absoluteUrl('/tentang/'),
  telephone: site.phoneHref,
  email: site.email,
  foundingDate: '2008-03-24',
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'SSM',
    value: site.registration,
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.street}, ${site.address.locality}`,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  subOrganization: { '@id': `${site.url}/#business` },
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${site.url}/#business`,
  name: site.name,
  url: absoluteUrl('/'),
  telephone: site.phoneHref,
  email: site.email,
  description:
    'Jualan dan servis sistem penapis air RO, sistem mineral dan dispenser air. Pertanyaan servis untuk penapis rumah indoor dan outdoor disemak mengikut jenama, model, keadaan dan alat ganti. Perniagaan beralamat di Taman Cahaya Masai, Pasir Gudang.',
  parentOrganization: { '@id': `${site.url}/#operator` },
  logo: {
    '@type': 'ImageObject',
    '@id': `${site.url}/#logo`,
    url: absoluteUrl('/brand-logo.png'),
    contentUrl: absoluteUrl('/brand-logo.png'),
    width: 512,
    height: 345,
    caption: site.name,
  },
  image: {
    '@type': 'ImageObject',
    url: absoluteUrl('/business-storefront-blue.webp'),
    contentUrl: absoluteUrl('/business-storefront-blue.webp'),
    width: 1448,
    height: 1086,
    caption: `Premis ${site.name} di Taman Cahaya Masai`,
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.street}, ${site.address.locality}`,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  hasMap: site.maps,
  sameAs: [site.facebook],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Jualan dan servis Penapis Air Kesihatan',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Sistem penapis air RO',
          description: 'Kategori jualan dan servis; jenama, model, stok, harga dan ketersediaan perlu disahkan semasa pertanyaan.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Sistem penapis air mineral',
          description: 'Kategori jualan dan servis; susunan filter, model, stok, harga dan ketersediaan perlu disahkan semasa pertanyaan.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Dispenser air',
          description: 'Kategori jualan dan servis; jenis, model, stok, harga dan ketersediaan perlu disahkan semasa pertanyaan.',
        },
      },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Servis sistem penapis air RO dan mineral serta dispenser air',
      },
    },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Servis penapis air rumah indoor dan outdoor selepas semakan keserasian',
      },
    },
    ],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  name: site.name,
  url: absoluteUrl('/'),
  inLanguage: 'ms-MY',
  publisher: { '@id': `${site.url}/#business` },
};
