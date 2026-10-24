export interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  category: 'Keuangan' | 'Digital' | 'Aksesori' | 'Info';
  image: string;
  alt: string;
  targetUrl: string;
  platformLabel: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  channel: 'Online 24 Jam (Buylink)' | 'Layanan Konter / WhatsApp';
  actionUrl: string;
  actionLabel: string;
  iconName: string;
}

export interface ExtraProductItem {
  id: string;
  name: string;
  categoryLabel: string;
  description: string;
  availabilityNote: string;
  whatsappTopicId: string;
  iconName: 'CupSoda' | 'IceCreamCone' | 'PackageCheck';
}

export interface PaymentAccount {
  id: string;
  provider: string;
  category: 'Bank' | 'E-Wallet';
  displayNumber: string;
  rawNumber: string;
  accountHolder: string;
  verifiedSource: string;
}

export interface OutletInfo {
  id: 'sukajadi' | 'ciherang';
  code: string;
  name: string;
  shortArea: string;
  address: string;
  landmarkNote: string;
  whatsappNumberDisplay: string;
  whatsappUrl: string;
  mapsUrl: string;
  mapPreviewImage: string;
  servicesAvailable: string[];
}

export const BRAND_INFO = {
  name: 'NJR CELL',
  tagline: 'Layanan Digital, Transfer Bank, Tarik Tunai, Mandiri Agen & BRILink Terpercaya di Ciamis',
  heroHeadline: 'Solusi Transaksi Digital, Transfer Bank & Kebutuhan HP dalam Satu Konter.',
  heroSubheadline:
    'Melayani masyarakat Pamarican dan Banjarsari dengan jelas, ramah, dan aman. Beli pulsa, kuota, token PLN online 24 jam, atau datang langsung ke konter untuk tarik tunai, Mandiri Agen, Agen BRILink (Kode: 12400836), pasang hydrogel, garskin custom, hingga minuman dingin & es krim.',
  logoPath: '/img/njrcell-logo.png',
  brilinkAgentCode: '12400836',
  generalWhatsappDisplay: '0821-2000-0303',
  generalWhatsappRaw: '6282120000303',
  generalWhatsappUrl:
    'https://api.whatsapp.com/send?phone=6282120000303&text=Halo%20NJR%20CELL%2C%20saya%20ingin%20bertanya%20mengenai%20layanan',
  buylinkUrl: 'https://buylink.id/njrcell',
  instagramUrl: 'https://www.instagram.com/njrcell88',
  instagramTestimoniUrl:
    'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MTA3MDQ1NDc2NTU3ODgw?story_media_id=3693231078690847949_56923304344&igsh=Z2VieGY4c2hoYWU4',
  tiktokUrl: 'https://www.tiktok.com/@njrcell',
  hydrogelCatalogUrl: 'https://njrcellciherang.my.canva.site/hydrogel',
  livePriceEmbedUrl:
    'https://propana.otoreport.com/harga.js.php?id=3d3a111c9f23b1475dc4a96fa2c333f580fe0bea9887cc9689473bf57dd13dd077aeba62fb02a1329479194c10d4f7fbd032-1243',
  mainWebsiteReference: 'https://njrcell.web.id/',
  githubRepoReference: 'https://github.com/njrcell/site',
};

export const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'slide-1',
    title: 'Transfer Bank & Tarik Tunai',
    subtitle: 'Proses cepat dan dihitung bersama secara transparan di konter NJR CELL',
    category: 'Keuangan',
    image: '/img/promo-transfer-tarik-tunai.png',
    alt: 'Promo Transfer & Tarik Tunai NJR CELL',
    targetUrl: 'https://www.instagram.com/njrcell88',
    platformLabel: 'Instagram @njrcell88',
  },
  {
    id: 'slide-2',
    title: 'Mandiri Agen Resmi',
    subtitle: 'Layanan transaksi perbankan Mandiri lebih dekat tanpa antre jauh ke kantor cabang',
    category: 'Keuangan',
    image: '/img/mandiri agen.png',
    alt: 'Agen Mandiri Resmi NJR CELL',
    targetUrl: 'https://www.instagram.com/njrcell88',
    platformLabel: 'Instagram @njrcell88',
  },
  {
    id: 'slide-3',
    title: 'Layanan Mini ATM',
    subtitle: 'Bantuan transaksi kartu, cek saldo, transfer, dan tarik tunai di konter',
    category: 'Keuangan',
    image: '/img/mini ATM.png',
    alt: 'Mini ATM NJR CELL',
    targetUrl: 'https://www.tiktok.com/@njrcell',
    platformLabel: 'TikTok @njrcell',
  },
  {
    id: 'slide-4',
    title: 'Pelindung Layar Hydrogel & Aksesori HP',
    subtitle: 'Pasang pelindung layar presisi untuk berbagai tipe HP dan charger ROBOT/VIVAN',
    category: 'Aksesori',
    image: '/img/Aksesori HP dan Hydrogel.png',
    alt: 'Aksesori HP dan Hydrogel NJR CELL',
    targetUrl: 'https://www.tiktok.com/@njrcell',
    platformLabel: 'TikTok @njrcell',
  },
  {
    id: 'slide-5',
    title: 'Top Up Game & Saldo E-Wallet',
    subtitle: 'Isi saldo e-wallet dan voucher game favorit secara praktis',
    category: 'Digital',
    image: '/img/Top Up Game & E-Wallet.png',
    alt: 'Top Up Game & E-Wallet NJR CELL',
    targetUrl: 'https://www.instagram.com/njrcell88',
    platformLabel: 'Instagram @njrcell88',
  },
  {
    id: 'slide-6',
    title: 'Token Listrik PLN & Tagihan Bulanan',
    subtitle: 'Beli token listrik prabayar dan bayar tagihan rumah tangga tepat waktu',
    category: 'Digital',
    image: '/img/Token Listrik PLN.png',
    alt: 'Token Listrik PLN NJR CELL',
    targetUrl: 'https://www.instagram.com/njrcell88',
    platformLabel: 'Instagram @njrcell88',
  },
  {
    id: 'slide-7',
    title: 'Bayar Tagihan PPOB & BPJS',
    subtitle: 'Pembayaran BPJS Kesehatan, TV/Internet, dan tagihan rutin di satu tempat',
    category: 'Digital',
    image: '/img/Bayar Tagihan PPOB.png',
    alt: 'Bayar Tagihan PPOB NJR CELL',
    targetUrl: 'https://www.tiktok.com/@njrcell',
    platformLabel: 'TikTok @njrcell',
  },
  {
    id: 'slide-8',
    title: 'Kartu Perdana & Voucher Internet',
    subtitle: 'Tersedia paket data, kartu perdana, dan voucher fisik internet di konter',
    category: 'Digital',
    image: '/img/Kartu Perdana dan Voucher Internet.png',
    alt: 'Kartu Perdana & Voucher Internet NJR CELL',
    targetUrl: 'https://www.instagram.com/njrcell88',
    platformLabel: 'Instagram @njrcell88',
  },
  {
    id: 'slide-9',
    title: 'Pilihan Paket Data Lengkap',
    subtitle: 'Isi ulang kuota internet harian maupun bulanan sesuai kebutuhan Anda',
    category: 'Digital',
    image: '/img/Paket Data.png',
    alt: 'Paket Data NJR CELL',
    targetUrl: 'https://www.tiktok.com/@njrcell',
    platformLabel: 'TikTok @njrcell',
  },
  {
    id: 'slide-10',
    title: 'Koleksi Pelindung Layar Hydrogel',
    subtitle: 'Melindungi layar HP dengan bahan lentur dan potongan presisi',
    category: 'Aksesori',
    image: '/img/hydrogel.png',
    alt: 'Hydrogel NJR CELL',
    targetUrl: 'https://njrcellciherang.my.canva.site/hydrogel',
    platformLabel: 'Katalog Hydrogel',
  },
  {
    id: 'slide-11',
    title: 'Testimoni Pelanggan NJR CELL',
    subtitle: 'Dokumentasi kepuasan pelanggan yang bertransaksi di NJR CELL',
    category: 'Info',
    image: '/img/testimoni.png',
    alt: 'Testimoni Pelanggan NJR CELL',
    targetUrl:
      'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MTA3MDQ1NDc2NTU3ODgw?story_media_id=3693231078690847949_56923304344&igsh=Z2VieGY4c2hoYWU4',
    platformLabel: 'Highlight Testimoni IG',
  },
  {
    id: 'slide-12',
    title: 'Keunggulan Layanan NJR CELL',
    subtitle: 'Transaksi dibantu langsung, ramah untuk semua kalangan, dan transparan',
    category: 'Info',
    image: '/img/keunggulan.png',
    alt: 'Keunggulan NJR CELL',
    targetUrl: 'https://www.tiktok.com/@njrcell',
    platformLabel: 'TikTok @njrcell',
  },
];

export const DIGITAL_SERVICES: ServiceItem[] = [
  {
    id: 'pulsa',
    name: 'Pulsa Reguler',
    description: 'Isi ulang pulsa reguler semua operator seluler secara online 24 jam atau langsung di konter.',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Beli via Buylink',
    iconName: 'Smartphone',
  },
  {
    id: 'paket-data',
    name: 'Paket Data & Kuota',
    description: 'Paket internet harian, mingguan, dan bulanan untuk kebutuhan komunikasi dan belajar.',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Beli via Buylink',
    iconName: 'Wifi',
  },
  {
    id: 'paket-telpon',
    name: 'Paket Telepon & SMS',
    description: 'Paket nelpon hemat untuk komunikasi lancar tanpa khawatir pulsa utama tersedot.',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Beli via Buylink',
    iconName: 'PhoneCall',
  },
  {
    id: 'token-listrik',
    name: 'Token Listrik PLN',
    description: 'Pembelian token listrik PLN prabayar kapan saja, kode stroom langsung keluar.',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Beli via Buylink',
    iconName: 'Zap',
  },
  {
    id: 'voucher-game',
    name: 'Top Up & Voucher Game',
    description: 'Top up diamond dan voucher game populer dengan proses cepat dan praktis.',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Beli via Buylink',
    iconName: 'Gamepad2',
  },
  {
    id: 'e-wallet',
    name: 'Top Up Saldo E-Wallet',
    description: 'Isi ulang saldo dompet digital (seperti DANA, ShopeePay, dan layanan mitra lainnya).',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Beli via Buylink',
    iconName: 'Wallet',
  },
  {
    id: 'voucher-internet',
    name: 'Voucher Internet & Kartu Perdana',
    description: 'Tersedia voucher internet online maupun voucher fisik gesek dan kartu perdana di konter.',
    channel: 'Layanan Konter / WhatsApp',
    actionUrl:
      'https://api.whatsapp.com/send?phone=6282120000303&text=Halo%20NJR%20CELL%2C%20saya%20ingin%20pesan%20voucher%20fisik%20internet%20%2F%20kartu%20perdana',
    actionLabel: 'Tanya Stok via WA',
    iconName: 'Ticket',
  },
  {
    id: 'voucher-belanja',
    name: 'Voucher Belanja & TV/Internet',
    description: 'Pembelian voucher belanja serta pembayaran langganan TV berbayar dan internet rumah.',
    channel: 'Online 24 Jam (Buylink)',
    actionUrl: 'https://buylink.id/njrcell',
    actionLabel: 'Buka Buylink',
    iconName: 'ShoppingBag',
  },
];

export const EXTRA_STORE_PRODUCTS: ExtraProductItem[] = [
  {
    id: 'minuman-dingin',
    name: 'Minuman Dingin Segar',
    categoryLabel: 'Tersedia di Konter Fisik',
    description:
      'Pilihan minuman kemasan dingin yang segar untuk menemani Anda saat menunggu pemasangan hydrogel, garskin, atau proses transaksi di konter.',
    availabilityNote: 'Tersedia langsung di lemari pendingin konter NJR CELL',
    whatsappTopicId: 'produk-konter',
    iconName: 'CupSoda',
  },
  {
    id: 'es-krim',
    name: 'Aneka Es Krim',
    categoryLabel: 'Tersedia di Konter Fisik',
    description:
      'Berbagai varian es krim favorit untuk anak-anak maupun dewasa. Praktis dibeli langsung saat berkunjung ke outlet NJR CELL.',
    availabilityNote: 'Stok varian mengikuti ketersediaan di masing-masing outlet',
    whatsappTopicId: 'produk-konter',
    iconName: 'IceCreamCone',
  },
  {
    id: 'rokok-kebutuhan',
    name: 'Rokok & Produk Harian Konter',
    categoryLabel: 'Khusus Pelanggan Dewasa (18+)',
    description:
      'Tersedia pilihan produk rokok dan kebutuhan pendamping harian di konter fisik NJR CELL dengan pembayaran tunai maupun QRIS.',
    availabilityNote: 'Tersedia di konter Sukajadi & Ciherang',
    whatsappTopicId: 'produk-konter',
    iconName: 'PackageCheck',
  },
];

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'mandiri',
    provider: 'Bank Mandiri',
    category: 'Bank',
    displayNumber: '1770 0065 9439 1',
    rawNumber: '1770006594391',
    accountHolder: 'AMIR NURJAMAN',
    verifiedSource: 'njrcell.web.id',
  },
  {
    id: 'bri',
    provider: 'Bank BRI',
    category: 'Bank',
    displayNumber: '4013 0100 9880 537',
    rawNumber: '401301009880537',
    accountHolder: 'AMIR NURJAMAN',
    verifiedSource: 'njrcell.web.id',
  },
  {
    id: 'seabank',
    provider: 'SeaBank',
    category: 'Bank',
    displayNumber: '9011 4590 5769',
    rawNumber: '901145905769',
    accountHolder: 'AMIR NURJAMAN',
    verifiedSource: 'njrcell.web.id',
  },
  {
    id: 'dana',
    provider: 'DANA',
    category: 'E-Wallet',
    displayNumber: '0821 2000 0303',
    rawNumber: '082120000303',
    accountHolder: 'AMIR NURJAMAN',
    verifiedSource: 'njrcell.web.id',
  },
  {
    id: 'shopeepay',
    provider: 'ShopeePay',
    category: 'E-Wallet',
    displayNumber: '0821 2000 0303',
    rawNumber: '082120000303',
    accountHolder: 'AMIR NURJAMAN',
    verifiedSource: 'njrcell.web.id',
  },
];

export const QRIS_INFO = {
  merchantName: 'NJR CELL',
  nmid: 'ID1020035674883',
  imagePath: '/img/qris.png',
  verifiedSource: 'njrcell.web.id',
};

export const OUTLETS: OutletInfo[] = [
  {
    id: 'sukajadi',
    code: '01. OUTLET SUKAJADI',
    name: 'NJR CELL Sukajadi',
    shortArea: 'Kecamatan Pamarican, Kab. Ciamis',
    address: 'Desa Sukajadi RT 006 RW 002, Kecamatan Pamarican, Kabupaten Ciamis, Jawa Barat',
    landmarkNote: 'Patokan Lokasi: Di sekitar / samping Sekolah MAN 4 Ciamis',
    whatsappNumberDisplay: '0853-2000-0303',
    whatsappUrl:
      'https://api.whatsapp.com/send/?phone=6285320000303&text=Halo%20NJR%20CELL%20Sukajadi%2C%20saya%20ingin%20bertanya%20mengenai%20layanan',
    mapsUrl: 'https://maps.app.goo.gl/kwNbie566DpopYBGA',
    mapPreviewImage: '/img/njrsukajadi.png',
    servicesAvailable: [
      'Transfer Bank & Tarik Tunai',
      'Mandiri Agen & Agen BRILink Resmi (Kode: 12400836)',
      'Pulsa, Paket Data, Kartu Perdana & Voucher Fisik',
      'Token PLN & Pembayaran Tagihan PPOB',
      'Pelindung Layar Hydrogel, Garskin & Aksesori HP',
      'Minuman Dingin, Es Krim & Produk Harian Konter',
    ],
  },
  {
    id: 'ciherang',
    code: '02. OUTLET CIHERANG',
    name: 'NJR CELL Ciherang',
    shortArea: 'Kecamatan Banjarsari, Kab. Ciamis',
    address:
      'Jl. Pangandaran No. 84, RT 05 RW 01, Desa Ciherang, Kec. Banjarsari, Kab. Ciamis, Jawa Barat (Dekat SD 1 Ciherang)',
    landmarkNote: 'Patokan Lokasi: Dekat SD 1 Ciherang, Jalur Jl. Pangandaran No. 84',
    whatsappNumberDisplay: '0831-2000-0303',
    whatsappUrl:
      'https://api.whatsapp.com/send/?phone=6283120000303&text=Halo%20NJR%20CELL%20Ciherang%2C%20saya%20ingin%20bertanya%20mengenai%20layanan',
    mapsUrl: 'https://maps.app.goo.gl/m4d9JoxcXCYds6ep6',
    mapPreviewImage: '/img/njrciherang.png',
    servicesAvailable: [
      'Transfer Bank & Tarik Tunai',
      'Mandiri Agen & Agen BRILink Resmi (Kode: 12400836)',
      'Pulsa, Paket Data, Kartu Perdana & Voucher Fisik',
      'Token PLN & Pembayaran Tagihan PPOB',
      'Pelindung Layar Hydrogel, Garskin Custom & Aksesori HP',
      'Minuman Dingin, Es Krim & Produk Harian Konter',
    ],
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Saya kurang paham cara transfer atau bayar lewat HP, apakah bisa dibantu langsung?',
    answer:
      'Tentu bisa! Anda cukup datang langsung ke konter NJR CELL Sukajadi (Pamarican, sekitar MAN 4 Ciamis) atau NJR CELL Ciherang (Banjarsari, dekat SD 1 Ciherang). Petugas kami akan membantu proses transfer, tarik tunai, layanan Mandiri Agen, BRILink (Kode Agen: 12400836), pengisian kuota, maupun pembayaran tagihan dari awal sampai selesai dengan ramah dan jelas.',
  },
  {
    question: 'Bagaimana prosedur tarik tunai dari rekening atau e-wallet di NJR CELL?',
    answer:
      'Anda dapat melakukan transfer ke nomor rekening resmi NJR CELL (Mandiri, BRI, SeaBank) atau e-wallet resmi (DANA, ShopeePay) atas nama AMIR NURJAMAN, atau scan QRIS resmi NJR CELL (NMID: ID1020035674883). Simpan bukti transfer dan tunjukkan kepada petugas konter. Uang tunai wajib dihitung bersama-sama di tempat saat transaksi dilakukan.',
  },
  {
    question: 'Apakah bisa beli pulsa, paket data, dan token listrik tengah malam (24 jam)?',
    answer:
      'Bisa. Untuk transaksi mandiri 24 jam, Anda dapat menggunakan halaman resmi Buylink NJR CELL (https://buylink.id/njrcell) selama sistem dan koneksi mitra berjalan normal. Untuk layanan fisik seperti tarik tunai, pasang hydrogel, atau kartu perdana, mengikuti jam operasional konter.',
  },
  {
    question: 'Apakah pelindung layar hydrogel tersedia untuk semua tipe HP?',
    answer:
      'Hydrogel dan garskin custom di NJR CELL dipotong menggunakan mesin khusus sehingga tersedia untuk berbagai merk dan tipe HP (termasuk tipe HP yang jarang ditemukan tempered glass-nya). Anda dapat mengecek katalog di halaman Hydrogel kami atau chat WhatsApp outlet terdekat untuk memastikan ketersediaan.',
  },
  {
    question: 'Bagaimana jika ada kendala transaksi atau saldo belum masuk?',
    answer:
      'Jangan khawatir. Simpan bukti transfer atau tangkapan layar (screenshot) transaksi Anda, lalu hubungi WhatsApp resmi NJR CELL maksimal dalam waktu 1×24 jam. Kami akan segera membantu pengecekan ke sistem mitra.',
  },
  {
    question: 'Apakah NJR CELL melayani kasbon atau bayar di akhir (hutang)?',
    answer:
      'Pada prinsipnya seluruh layanan NJR CELL bersifat tunai / bayar langsung (cash) agar silaturahmi tetap terjaga. Sesuai Syarat & Ketentuan resmi, pembayaran di akhir hanya berlaku bagi pelanggan yang telah mendapat izin khusus dengan menyerahkan jaminan barang senilai nominal transaksi serta identitas tertulis, dan wajib dilunasi sebelum konter tutup (pukul 22:00 WIB) di hari yang sama.',
  },
];

export const TERMS_AND_CONDITIONS = [
  {
    number: '01',
    title: 'Layanan NJR CELL',
    points: [
      'NJR CELL menyediakan layanan pulsa, paket data, token PLN, pembayaran tagihan, top-up game, dan e-wallet.',
      'Layanan offline (aksesori, hydrogel, garskin, kartu perdana, produk konter, Mandiri Agen, Agen BRILink Kode 12400836, serta layanan transfer & tarik tunai) tersedia di konter Sukajadi & Ciherang.',
    ],
  },
  {
    number: '02',
    title: 'Ketentuan Hutang & Pembayaran di Akhir',
    points: [
      'Layanan NJR CELL pada prinsipnya bersifat cash / bayar langsung.',
      'Pembayaran di akhir (hutang) hanya berlaku untuk pelanggan tertentu yang sudah mendapat izin dan wajib menyerahkan jaminan barang yang nilainya setara dengan nominal hutang, disertai bukti jaminan tertulis (seperti penitipan KTP/SIM asli atau penandatanganan surat kesepakatan di tempat).',
      'Pada intinya, NJR CELL tidak memberikan piutang secara bebas agar silaturahmi tidak terputus. Jaminan barang dan identitas murni berfungsi sebagai bentuk komitmen bersama.',
      'NJR CELL bukan jasa pinjaman. Apabila ada layanan terkait pinjaman, sifatnya hanya membantu pelanggan yang ingin mengajukan pinjaman resmi ke Bank Mandiri (fasilitasi administrasi awal).',
      'Hutang wajib dibayar paling lambat sebelum konter tutup pada hari yang sama (pukul 22:00 WIB), kecuali terdapat kesepakatan lain yang disetujui secara tertulis.',
      'Apabila hutang tidak dilunasi melewati batas waktu yang disepakati, NJR CELL berhak penuh untuk menahan atau mengeksekusi barang jaminan tersebut sebagai bentuk penyelesaian tunggakan, serta berhak menghentikan layanan kepada pelanggan yang bersangkutan.',
      'NJR CELL tidak bertanggung jawab atas kerugian akibat keterlambatan pembayaran dari sisi pelanggan (misal: denda tagihan jatuh tempo, atau keterlambatan proses transfer dan isi saldo).',
    ],
  },
  {
    number: '03',
    title: 'Jam Operasional',
    points: [
      'Layanan online: 24 jam (tergantung koneksi & sistem mitra).',
      'Layanan offline: mengikuti jam operasional konter di Sukajadi dan Ciherang.',
    ],
  },
  {
    number: '04',
    title: 'Transaksi & Pembayaran',
    points: [
      'Semua transaksi bersifat final dan tidak dapat dibatalkan setelah diproses.',
      'Pembayaran dilakukan sesuai nominal yang tertera, termasuk biaya admin.',
      'Keterlambatan saldo masuk bukan tanggung jawab NJR CELL jika berasal dari gangguan pihak ketiga (bank, e-wallet, provider).',
    ],
  },
  {
    number: '05',
    title: 'Biaya Admin',
    points: [
      'Biaya admin mengikuti informasi resmi dan dapat berubah sewaktu-waktu sesuai kebijakan bank atau mitra.',
    ],
  },
  {
    number: '06',
    title: 'Klaim & Komplain',
    points: [
      'Klaim transaksi maksimal 1×24 jam dengan menyertakan bukti transfer atau screenshot.',
      'Komplain tanpa bukti transaksi tidak dapat diproses.',
    ],
  },
  {
    number: '07',
    title: 'Aturan Tarik Tunai',
    points: [
      'Proses tarik tunai wajib dihitung bersama-sama di tempat saat transaksi dilakukan.',
      'Setelah pelanggan meninggalkan konter, segala bentuk klaim atau komplain terkait jumlah uang tidak dapat diterima.',
      'Dengan melakukan transaksi tarik tunai, pelanggan dianggap telah menyetujui jumlah uang yang diterima di konter.',
    ],
  },
  {
    number: '08',
    title: 'Privasi & Penyalahgunaan Layanan',
    points: [
      'NJR CELL menjamin data pelanggan hanya digunakan untuk keperluan transaksi dan tidak diperjualbelikan.',
      'Dilarang menggunakan layanan untuk aktivitas ilegal (penipuan, judi online, dll). NJR CELL berhak menolak layanan jika terindikasi melanggar hukum.',
    ],
  },
];

export const AUDIT_REPORT_SUMMARY = {
  verifiedLinks: [
    { label: 'Website Utama (Referensi)', url: 'https://njrcell.web.id/', status: 'Terverifikasi Aktif' },
    { label: 'Repository GitHub (Referensi)', url: 'https://github.com/njrcell/site', status: 'Terverifikasi Aktif' },
    { label: 'Buylink Transaksi 24 Jam', url: 'https://buylink.id/njrcell', status: 'Terverifikasi di index.html' },
    { label: 'Instagram Resmi', url: 'https://www.instagram.com/njrcell88', status: 'Terverifikasi di index.html' },
    { label: 'TikTok Resmi', url: 'https://www.tiktok.com/@njrcell', status: 'Terverifikasi di index.html' },
    { label: 'WhatsApp Layanan Konter / Umum', url: 'https://api.whatsapp.com/send?phone=6282120000303', status: 'Terverifikasi di index.html' },
    { label: 'WhatsApp Outlet Sukajadi', url: 'https://api.whatsapp.com/send/?phone=6285320000303', status: 'Terverifikasi di index.html' },
    { label: 'WhatsApp Outlet Ciherang', url: 'https://api.whatsapp.com/send/?phone=6283120000303', status: 'Terverifikasi di index.html' },
    { label: 'Google Maps Outlet Sukajadi', url: 'https://maps.app.goo.gl/kwNbie566DpopYBGA', status: 'Terverifikasi di index.html' },
    { label: 'Google Maps Outlet Ciherang', url: 'https://maps.app.goo.gl/m4d9JoxcXCYds6ep6', status: 'Terverifikasi di index.html' },
    { label: 'Katalog Produk Pelindung / Hydrogel', url: 'https://njrcellciherang.my.canva.site/hydrogel', status: 'Terverifikasi di index.html' },
    { label: 'Embed Daftar Harga Live (Propana)', url: 'https://propana.otoreport.com/harga.js.php?id=3d3a111c...', status: 'Terverifikasi di index.html' },
    { label: 'Halaman Syarat & Ketentuan', url: 'https://njrcell.web.id/terms.html', status: 'Terverifikasi (10 Pasal)' },
  ],
  itemsNeedingOwnerConfirmation: [
    {
      item: 'Agen BRILink Resmi (SUDAH DITAMBAHKAN)',
      detail:
        'Telah ditambahkan identitas resmi Agen BRILink NJR CELL dengan Kode Agen: 12400836 berdampingan dengan Mandiri Agen.',
    },
    {
      item: 'Alamat & Patokan Outlet Ciherang (SUDAH DIPERBARUI)',
      detail:
        'Telah diperbarui sesuai konfirmasi pemilik menjadi: "Jl. Pangandaran No. 84, RT 05 RW 01, Desa Ciherang, Kec. Banjarsari, Kab. Ciamis (Dekat SD 1 Ciherang)".',
    },
    {
      item: 'Bagian 9: Produk Tambahan di Konter (SUDAH DIAKTIFKAN SIAP LAUNCHING)',
      detail:
        'Kartu produk tambahan konter (Minuman Dingin Segar, Aneka Es Krim, serta Rokok & Produk Harian Konter) telah ditampilkan secara rapi di halaman utama agar siap langsung diluncurkan.',
    },
  ],
};
