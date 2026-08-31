export interface GeorgianGlossaryEntry {
  term: string;
  preferred: string;
  note: string;
}

export const GEORGIAN_COPY_STYLE_GUIDE = {
  sourceOfTruth: 'ქართული არის პირველადი ტექსტი. ინგლისური და რუსული ითარგმნება მხოლოდ ამ ტექსტის დამტკიცების შემდეგ.',
  tone: 'მაღაზიის ტექსტი უნდა იყოს ბუნებრივი, თბილი და პირდაპირი. იურიდიული ტექსტი რჩება ზუსტი და ფორმალური.',
  nlpResources:
    'awesome-ka-nlp გამოიყენება მხოლოდ ქართული NLP რესურსების რუკად და არა ავტომატურ მთარგმნელად.',
} as const;

export const GEORGIAN_GLOSSARY: GeorgianGlossaryEntry[] = [
  { term: 'cart', preferred: 'კალათა', note: 'შეკვეთის დაწყებამდე ნივთების სია.' },
  { term: 'checkout', preferred: 'შეკვეთის გაფორმება', note: 'არ ვიყენებთ უხეშ კალკს: checkout.' },
  { term: 'delivery', preferred: 'მიწოდება', note: 'კონტექსტის მიხედვით: მიწოდების პირობები, მიწოდების ღირებულება.' },
  { term: 'warranty', preferred: 'გარანტია', note: 'იურიდიულ ტექსტში შესაძლებელია: კანონისმიერი გარანტია.' },
  { term: 'favorites', preferred: 'რჩეულები', note: 'Wishlist-ის ნაცვლად.' },
  { term: 'orders', preferred: 'შეკვეთები', note: 'ჩემი შეკვეთები პირადი სივრცის ბმულისთვის.' },
  { term: 'product', preferred: 'პროდუქტი', note: 'კატალოგის ერთეული.' },
  { term: 'category', preferred: 'კატეგორია', note: 'კატალოგის დაჯგუფება.' },
  { term: 'promo code', preferred: 'პრომოკოდი', note: 'ერთ სიტყვად UI-ში.' },
  { term: 'account', preferred: 'ანგარიში', note: 'პირადი სივრცის ტექნიკური ანგარიში.' },
  { term: 'admin publish', preferred: 'გამოქვეყნება', note: 'Admin-ში Live/Hidden-ის ქართული ქმედება.' },
  { term: 'admin hide', preferred: 'დამალვა', note: 'პროდუქტის ან სექციის storefront-იდან ამოღება.' },
  { term: 'save', preferred: 'შენახვა', note: 'ფორმის ცვლილებების შენახვა.' },
] as const;
