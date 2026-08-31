export type StoreCategory = 'მოდა' | 'სახლი' | 'ტექნიკა' | 'ავტო' | 'სპორტი' | 'მოვლა';

export type StoreProduct = {
  id: string;
  name: string;
  category: StoreCategory;
  price: string;
  oldPrice: string | null;
  discount: string | null;
  note: string;
  image: string;
  rank: number;
};

export type CatalogPayload = {
  capturedAt: string;
  products: StoreProduct[];
};

// Normalized from the approved marketplace snapshot captured on 2026-08-27.
// Public product cards deliberately omit marketplace names. The parser can
// replace this data module when a newer verified snapshot is available.
export const currentCatalog: CatalogPayload = {
  capturedAt: '2026-08-27T15:25:32Z',
  products: [
    { id: '601100060835831', name: 'ხალიჩისა და ავეჯის სარეცხი აპარატი', category: 'მოვლა', price: '155.44 ₾', oldPrice: '259.72 ₾', discount: '-40%', note: '800W, 22KPa, ავეჯისა და ხალიჩისთვის', image: 'https://img.kwcdn.com/product/fancy/fe1c598b-bd41-41f9-979b-6ae983462fd2.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 1 },
    { id: '601103219516618', name: 'პორტატული სტარტერი და საბურავის კომპრესორი', category: 'ავტო', price: '96.37 ₾', oldPrice: '203.99 ₾', discount: '-53%', note: '10-in-1, 180 PSI, 8000mAh', image: 'https://img.kwcdn.com/product/fancy/98664a51-fd21-4ff6-a07c-6652da364f23.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 2 },
    { id: '601101560968489', name: 'უსადენო საბურავის კომპრესორი', category: 'ავტო', price: '40.15 ₾', oldPrice: '67.23 ₾', discount: '-40%', note: '150 PSI, LED ეკრანი, USB დამუხტვა', image: 'https://img.kwcdn.com/product/fancy/571f63f6-fc5f-465d-8337-107989424cc0.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 3 },
    { id: '606469311327985', name: 'კლასიკური ქუსლიანი სლაიდები', category: 'მოდა', price: '22.84 ₾', oldPrice: '38.28 ₾', discount: '-40%', note: 'კვადრატული ცხვირი, ყოველდღიური ლუქი', image: 'https://img.kwcdn.com/product/fancy/077d5488-e06b-4b9e-8e46-da249b21c11a.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 5 },
    { id: '601102305198387', name: 'ზაფხულის სპორტული კომპლექტი', category: 'სპორტი', price: '26.18 ₾', oldPrice: '48.61 ₾', discount: '-46%', note: 'მაისური და შორტი ერთ ნაკრებში', image: 'https://img.kwcdn.com/product/fancy/f608cbec-c255-40a4-aada-223e923f85fd.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 6 },
    { id: '601103076930545', name: 'ელექტრონული იატაკის სასწორი', category: 'სახლი', price: '27.31 ₾', oldPrice: '58.15 ₾', discount: '-53%', note: 'LED ეკრანი და ტემპერატურის მაჩვენებელი', image: 'https://img.kwcdn.com/product/fancy/2bc37892-d346-449e-8c0f-cd046a975580.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 7 },
    { id: '601101183929395', name: 'ორმაგი კამერიანი ავტორეგისტრატორი', category: 'ავტო', price: '26.45 ₾', oldPrice: '49.87 ₾', discount: '-47%', note: '1080P წინა და 720P უკანა კამერა', image: 'https://img.kwcdn.com/product/fancy/39736291-584b-476f-895d-059dac358fac.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 8 },
    { id: '601099526752299', name: 'Wi-Fi გარე კამერა', category: 'ტექნიკა', price: '54.21 ₾', oldPrice: '114.34 ₾', discount: '-53%', note: 'ბრუნვა, ღამის ხედვა და მოძრაობის სიგნალი', image: 'https://img.kwcdn.com/product/fancy/cd4bce10-428f-44f2-b5a4-60632ceb9a5b.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 9 },
    { id: '605899070527412', name: 'ხელის ორთქლის საწმენდი', category: 'მოვლა', price: '109.77 ₾', oldPrice: '210.33 ₾', discount: '-48%', note: '1500W, სახლისა და მანქანისთვის', image: 'https://img.kwcdn.com/product/fancy/9fa8f85b-4a80-4b64-a146-759317d7acac.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 10 },
    { id: '601103084183696', name: '10.1-ინჩიანი Android პლანშეტი', category: 'ტექნიკა', price: '210.97 ₾', oldPrice: '357.90 ₾', discount: '-41%', note: 'კლავიატურა, მაუსი და სტილუსი კომპლექტში', image: 'https://img.kwcdn.com/product/fancy/8095fb22-1a00-4533-929e-ab9ec55c7c4d.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 11 },
    { id: '601103787599019', name: '216-ნაწილიანი ხელსაწყოების ნაკრები', category: 'ავტო', price: '40.28 ₾', oldPrice: '73.30 ₾', discount: '-45%', note: 'კომპაქტურ ყუთში, სახლისა და ავტომობილისთვის', image: 'https://img.kwcdn.com/product/fancy/d85484fe-c71c-40c2-9239-25b2e8677c62.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 12 },
    { id: '601104461301615', name: 'USB დამტენი პლაზმური სანთებელა', category: 'სახლი', price: '8.45 ₾', oldPrice: '14.60 ₾', discount: '-42%', note: 'ქარისგან დაცული და ალის გარეშე', image: 'https://img.kwcdn.com/product/fancy/b46e4c62-41ba-462d-967f-67d8536bdad8.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 14 },
    { id: '601100102744841', name: 'ყოველდღიური პეჩვორკ სნიკერები', category: 'მოდა', price: '23.50 ₾', oldPrice: '37.37 ₾', discount: '-37%', note: 'მსუბუქი მოდელი ქალაქისთვის', image: 'https://img.kwcdn.com/product/fancy/1354a7c4-0672-42df-b4d5-260bc15be205.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 15 },
    { id: '601105075616985', name: 'ყოველდღიური სამგზავრო ზურგჩანთა', category: 'მოდა', price: '19.58 ₾', oldPrice: '31.14 ₾', discount: '-37%', note: 'ფართო განყოფილება ლეპტოპისთვის', image: 'https://img.kwcdn.com/product/fancy/85772c77-b1ec-46f5-9753-112491f72922.jpg?imageView2/2/w/500/q/90/format/avif%7CimageVqr/2', rank: 18 },
    { id: '4015451985', name: 'HypeWear ბეისიქ ტოპი', category: 'მოდა', price: '19.57 ₾', oldPrice: null, discount: null, note: 'მსუბუქი ყოველდღიური ფენა', image: 'https://ir-20.ozone.ru/s3/multimedia-1-t/wc500/9918661817.jpg', rank: 1 },
    { id: '1218081703', name: 'TOP Textile ლონგსლივი', category: 'მოდა', price: '26.27 ₾', oldPrice: '73.49 ₾', discount: '-64%', note: 'ბაზისური სილუეტი ყოველდღე', image: 'https://ir-20.ozone.ru/s3/multimedia-6/wc500/6784769490.jpg', rank: 3 },
    { id: '2754279040', name: 'CRB ბეისიქ მაისური', category: 'მოდა', price: '13.92 ₾', oldPrice: '20.24 ₾', discount: '-31%', note: 'მარტივი ჭრა, ერთი ცალი', image: 'https://ir-20.ozone.ru/s3/multimedia-1-k/wc500/7877774288.jpg', rank: 8 },
    { id: '2035758806', name: 'Remisa უსაკერო ბიუსტჰალტერი', category: 'მოდა', price: '57.07 ₾', oldPrice: '344.49 ₾', discount: '-83%', note: 'რბილი, კარკასის გარეშე მოდელი', image: 'https://ir-20.ozone.ru/s3/multimedia-1-8/wc500/11361986792.jpg', rank: 16 },
  ],
};
