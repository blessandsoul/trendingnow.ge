import type { ActiveLocale } from '../locales';

export type InfoPageKey = 'aboutUs' | 'delivery' | 'warranty' | 'paymentMethods' | 'faq' | 'contact' | 'corporateOffer';
export interface DiscoveryInfoPage {
  metadata: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  cards: { label: string; value: string }[];
  sections: { title: string; text?: readonly string[]; items?: readonly string[] }[];
}

function page(title: string, intro: string, sections: DiscoveryInfoPage['sections'], contacts = false): DiscoveryInfoPage {
  return { title, eyebrow: 'TrendingNow.ge', intro, metadata: { title: `${title} | TrendingNow.ge`, description: intro }, sections,
    cards: contacts ? [{ label: 'Email', value: 'contact@ainow.ge' }, { label: 'Tel', value: '+995 574 88 28 87' }] : [] };
}

/** One consumer-facing contract for root and prefixed routes. Old store copy stays archived in locale sources. */
export const discoveryInfoPages = {
  ka: {
    aboutUs: page('კარგი არჩევანი ნაკლები ძებნით', 'TrendingNow გეხმარება საქართველოს მაღაზიებში ნივთების აღმოჩენასა და შედარებაში. ნივთს ირჩევ აქ, ყიდულობ კი უშუალოდ მაღაზიის საიტზე.', [
      { title: 'რას ვაკეთებთ', items: ['ერთად ვაჩვენებთ ნივთის მოდელს, მაღაზიას და ინფორმაციის შემოწმების თარიღს.', 'შეგიძლია ნივთები ამ მოწყობილობაზე შეინახო და ერთი ტიპის ვარიანტები შეადარო.', 'ჩვენ არ გვაქვს საკუთარი საწყობი და არ ვიღებთ თანხას გარე მაღაზიის შეკვეთისთვის.'] },
      { title: 'როგორ ვარჩევთ', items: ['ვუთითებთ ზუსტ მოდელსა და წყაროს. მსგავსი ნივთი იმავე მოდელად არ ითვლება.', 'უცნობ მონაცემს არ ვცვლით დაპირებით. ფასსა და ბმულს ცალ-ცალკე ვამოწმებთ.', 'წყაროს შესწავლა ნივთის პირად გამოცდას არ ნიშნავს. ილუსტრაცია რეალურ ფოტოს არ ცვლის.'] },
      { title: 'კომერციული ურთიერთობა', text: ['ამჟამინდელი გარე შეთავაზებები სარედაქციო ბმულებია და დადასტურებულ პარტნიორობას არ ნიშნავს. ფასიანი განთავსება ცალკე უნდა აღინიშნოს. შეცდომის შესახებ მოგვწერე: contact@ainow.ge.'] },
    ]),
    delivery: page('მიწოდება: რა შეამოწმო', 'ნივთს გარე მაღაზიაში ყიდულობ. მიწოდების ფასი, ვადა და ხელმისაწვდომი ქალაქები კონკრეტულ გამყიდველთან უნდა გადაამოწმო.', [
      { title: 'გადახდამდე', items: ['მიუთითე ზუსტი მისამართი ან აირჩიე თვითგატანა, თუ მაღაზიას ეს სერვისი აქვს.', 'გადაამოწმე ნივთისა და მიწოდების სრული თანხა. ბარათზე ნაჩვენები ფასი მიწოდებას ავტომატურად არ მოიცავს.', 'დააზუსტე, ნივთი ადგილობრივ მარაგშია თუ ჩამოტანა სჭირდება.', 'მაღაზიას ჰკითხე სავარაუდო ჩაბარების თარიღი; ბმულის არსებობა მარაგის დადასტურება არ არის.'] },
      { title: 'შეძენის შემდეგ', text: ['შეინახე გამყიდველის დასახელება, შეკვეთის ნომერი და დადასტურება. გზავნილისა და დაგვიანების საკითხებზე მიმართე იმ მაღაზიას, სადაც გადაიხადე. TrendingNow ვერ ხედავს გარე შეკვეთის სტატუსს.'] },
    ]),
    warranty: page('გარანტია და დაბრუნება', 'გარანტიისა და დაბრუნების პირობები შეამოწმე იმ გამყიდველთან, რომელთანაც ყიდულობ. ეს გვერდი პრაქტიკული სიაა და არა ინდივიდუალური იურიდიული შეფასება.', [
      { title: 'არჩევამდე გადაამოწმე', items: ['ვინ ახორციელებს საგარანტიო მომსახურებას და სად მდებარეობს სერვისი?', 'რა ვადა და გამონაკლისები ვრცელდება ზუსტად ამ მოდელზე?', 'როგორია დაბრუნების პროცესი, მისამართი და ტრანსპორტირების საფასური?', 'სად არის პირობების სრული ტექსტი და როგორ მიიღებ შეძენის დამადასტურებელ დოკუმენტს?'] },
      { title: 'თუ პრობლემა აღმოჩნდა', text: ['მიმართე გამყიდველს შეკვეთის ნომრით, პრობლემის აღწერითა და საჭირო ფოტოებით. შეინახე მიმოწერა. TrendingNow-ზე არ გამოაგზავნო ბარათის მონაცემები, პაროლი ან პირადობის დოკუმენტი. ეს სია კანონით მინიჭებულ უფლებებს არ ზღუდავს.'] },
    ]),
    paymentMethods: page('როგორ ხდება გადახდა', 'გადახდა სრულდება არჩეული მაღაზიის საიტზე. TrendingNow-ის ბმულზე დაჭერა შეკვეთას არ ქმნის და თანხას არ გაჭრის.', [
      { title: 'უსაფრთხო გადასვლა', items: ['გადასვლამდე ბარათზე ნახე მაღაზიის დასახელება; ახალ ჩანართში გადაამოწმე საიტის მისამართი.', 'შეადარე ზუსტი მოდელი, ფერი, კომპლექტი და საბოლოო თანხა.', 'გადახდის მეთოდები და განვადების პირობები დააზუსტე გამყიდველთან.', 'შეინახე მაღაზიის მიერ გაცემული დადასტურება. TrendingNow გარე გადახდას ვერ ადასტურებს.'] },
      { title: 'რა მონაცემს არ ვითხოვთ', text: ['გარე ნივთის შესაძენად ჩვენ არ ვითხოვთ ბარათის ნომერს, CVV-ს, საბანკო პაროლს ან SMS კოდს. ასეთ მონაცემებს ნუ გამოგვიგზავნი ელფოსტით.'] },
    ]),
    faq: page('ხშირი კითხვები', 'პასუხები ნივთის არჩევაზე, შენახვაზე და გარე მაღაზიაში შეძენაზე.', [
      { title: 'აქ ვყიდულობ თუ სხვა მაღაზიაში?', text: ['აქ ირჩევ და ადარებ ნივთებს. შეძენა, გადახდა, მიწოდება და დაბრუნება არჩეულ მაღაზიასთან ხდება.'] },
      { title: 'შენახვას ანგარიში სჭირდება?', text: ['არა. შენახული ნივთები ამ ბრაუზერში ინახება. სხვა მოწყობილობაზე არ გადავა, ხოლო ბრაუზერის მონაცემების გასუფთავებისას შეიძლება წაიშალოს.'] },
      { title: 'ფასი რატომ განსხვავდება?', text: ['ჩვენ ვაჩვენებთ შემოწმებისას ნანახ ინფორმაციას და თარიღს. ფასი შეიძლება შეიცვალოს. მოძველებულ ფასს მიმდინარე ფასად არ ვაჩვენებთ; საბოლოო თანხა მაღაზიაში გადაამოწმე.'] },
      { title: 'ყველა მაღაზია და ნივთი აქ არის?', text: ['არა. კატალოგი შერჩეულ ჩანაწერებს შეიცავს და მთლიან ბაზარს არ მოიცავს. შედეგის არქონა არ ნიშნავს, რომ ნივთი საქართველოში არსად იყიდება.'] },
      { title: 'როგორ შეგატყობინო შეცდომა?', text: ['მოგვწერე contact@ainow.ge-ზე. დაურთე ბარათის ბმული, მოდელი და შეცდომის აღწერა. წერილის აპის გახსნა გაგზავნას არ ნიშნავს — წერილი თავად უნდა გაგზავნო.'] },
    ]),
    contact: page('მოგვწერე', 'გჭირდება დახმარება არჩევაში ან შენიშნე შეცდომა? დაურთე ნივთის ბმული, მოდელი და შენი კითხვა.', [
      { title: 'არჩევა ან შეცდომა ბარათზე', text: ['Email: contact@ainow.ge', 'Tel: +995 574 88 28 87', 'გვიამბე, რისთვის ეძებ ნივთს, რა ბიუჯეტი გაქვს და რა არის შენთვის მნიშვნელოვანი. პასუხის ვადას წინასწარ არ გპირდებით.'] },
      { title: 'უკვე შეძენილი ნივთი', text: ['შეკვეთის სტატუსი, მიწოდება, თანხის დაბრუნება და გარანტია იმ მაღაზიასთან გაარკვიე, სადაც გადაიხადე. ჩვენ მისი შეკვეთების სისტემაზე წვდომა არ გვაქვს.'] },
      { title: 'პირადი მონაცემები', text: ['არ გამოგვიგზავნო საბანკო ბარათის მონაცემები, პაროლი, SMS კოდი ან პირადობის დოკუმენტი. საკითხის გასაგებად საკმარისია ნივთის საჯარო ბმული.'] },
    ], true),
    corporateOffer: page('მაღაზიებისა და ავტორებისთვის', 'თუ გაქვს მაღაზია ან სასარგებლო კვლევა, მოგვწერე თანამშრომლობის შესახებ. განაცხადი პარტნიორობის ან გამოქვეყნების დადასტურება არ არის.', [
      { title: 'რა ინფორმაცია გამოგვადგება', items: ['მაღაზიის მისამართი, საკონტაქტო პირი და პროდუქციის კატეგორიები.', 'ზუსტი მოდელების მონაცემების წყარო და განახლების შესაძლებლობა.', 'ფოტოებისა და აღწერების გამოყენების ნებართვა და მისი პირობები.', 'თანამშრომლობის ფორმა და კომერციული პირობები, თუ მათ გვთავაზობ.'] },
      { title: 'დაგვიკავშირდი', text: ['contact@ainow.ge — წერილის სათაურში მიუთითე მაღაზია ან თანამშრომლობის თემა. კომერციული ურთიერთობა ცალკე მოწმდება და მკითხველისთვის აღინიშნება.'] },
    ]),
  },
  en: {
    aboutUs: page('Good choices. Less searching.', 'TrendingNow helps you discover and compare products from stores in Georgia. Choose here; buy directly on the store’s website.', [
      { title: 'What you can do here', items: ['See the exact model, seller and information check date together.', 'Save finds on this device and compare products of the same type.', 'We do not hold our own stock or take payment for an external store order.'] },
      { title: 'How we choose', items: ['We identify the model and source. A similar item is not the same version.', 'Unknown information stays unknown. Price freshness and link eligibility are checked separately.', 'Source research is not a hands-on test. An illustration is not an exact product photograph.'] },
      { title: 'Commercial relationships', text: ['Current external offers are editorial links, not confirmed partnerships. Paid placements must be identified separately. Report a correction to contact@ainow.ge.'] },
    ]),
    delivery: page('Delivery: what to check', 'You buy from an external store. Confirm delivery cost, timing and supported locations with that seller.', [
      { title: 'Before you pay', items: ['Enter your exact address or choose collection if the store offers it.', 'Check the total including delivery. A product price does not automatically include shipping.', 'Ask whether the exact item is in local stock or must be imported.', 'Confirm the estimated arrival date; a working product link is not proof of stock.'] },
      { title: 'After purchase', text: ['Keep the store name, order number and confirmation. Contact the store you paid about tracking or delays. TrendingNow cannot see an external order’s status.'] },
    ]),
    warranty: page('Warranty and returns', 'Check warranty and return terms with the seller you buy from. This is a practical checklist, not individual legal advice.', [
      { title: 'Questions before choosing', items: ['Who provides warranty service, and where is the service centre?', 'What period and exclusions apply to this exact model?', 'What are the return procedure, address and transport charges?', 'Where are the complete terms, and how do you get proof of purchase?'] },
      { title: 'If something goes wrong', text: ['Contact the seller with the order number, a description and relevant photos. Keep the correspondence. Do not send card details, passwords or identity documents to TrendingNow. This checklist does not limit statutory rights.'] },
    ]),
    paymentMethods: page('How payment works', 'Payment happens on the selected store’s website. Clicking a TrendingNow link does not create an order or charge you.', [
      { title: 'Before entering payment details', items: ['Check the seller name here, then verify the website address in the new tab.', 'Match the exact model, colour, package and final total.', 'Confirm payment methods and any instalment terms with the store.', 'Keep the store’s confirmation. TrendingNow cannot confirm an external payment.'] },
      { title: 'What we do not ask for', text: ['We do not request your card number, CVV, banking password or SMS code for an external purchase. Do not email these details to us.'] },
    ]),
    faq: page('Frequently asked questions', 'Answers about choosing, saving and buying from an external store.', [
      { title: 'Do I buy here or at another store?', text: ['Choose and compare here. Purchase, payment, delivery and returns happen with the selected store.'] },
      { title: 'Do I need an account to save?', text: ['No. Finds are saved in this browser, not synced to other devices. Clearing browser data may remove them.'] },
      { title: 'Why does the price differ?', text: ['Our information comes from a dated observation. Prices can change. We do not present an outdated price as current; confirm the final total at the store.'] },
      { title: 'Do you cover every store and product?', text: ['No. This is a selected catalog, not the entire market. No search result does not mean an item is unavailable everywhere in Georgia.'] },
      { title: 'How can I report an error?', text: ['Email contact@ainow.ge with the card link, model and correction. Opening your email app does not send the message; you still need to send it yourself.'] },
    ]),
    contact: page('Talk to us', 'Need help choosing or spotted an error? Include the product link, model and your question.', [
      { title: 'Choosing or correcting a record', text: ['Email: contact@ainow.ge', 'Tel: +995 574 88 28 87', 'Tell us the task, budget and what matters to you. We do not promise a response deadline.'] },
      { title: 'An existing purchase', text: ['Ask the store you paid about order status, delivery, refunds and warranty. We do not have access to its order system.'] },
      { title: 'Your private information', text: ['Do not send card details, passwords, SMS codes or identity documents. A public product link is enough to describe the issue.'] },
    ], true),
    corporateOffer: page('For stores and contributors', 'Have a store or useful original research? Contact us about working together. An enquiry does not confirm partnership or publication.', [
      { title: 'Useful information to include', items: ['Store website, contact person and product categories.', 'The source of exact model data and how it can be kept current.', 'Permission and terms for using photographs and descriptions.', 'Proposed collaboration and any commercial terms.'] },
      { title: 'Contact', text: ['Write to contact@ainow.ge with the store or topic in the subject. Commercial relationships require separate review and disclosure to readers.'] },
    ]),
  },
  ru: {
    aboutUs: page('Хороший выбор без лишних поисков', 'TrendingNow помогает находить и сравнивать вещи из магазинов Грузии. Здесь выбираешь, а покупаешь непосредственно на сайте магазина.', [
      { title: 'Что можно сделать здесь', items: ['Увидеть точную модель, продавца и дату проверки информации.', 'Сохранить находки на этом устройстве и сравнить вещи одного типа.', 'У нас нет собственного склада; мы не принимаем оплату за заказ внешнего магазина.'] },
      { title: 'Как мы выбираем', items: ['Указываем модель и источник. Похожая вещь не считается той же версией.', 'Неизвестное не заменяем обещанием. Свежесть цены и доступность ссылки проверяются отдельно.', 'Исследование источников — не личный тест. Иллюстрация не заменяет точную фотографию вещи.'] },
      { title: 'Коммерческие отношения', text: ['Текущие внешние предложения — редакционные ссылки, не подтверждённые партнёрства. Платные размещения должны обозначаться отдельно. Об ошибке напиши на contact@ainow.ge.'] },
    ]),
    delivery: page('Доставка: что проверить', 'Покупка проходит во внешнем магазине. Стоимость, сроки и доступные города уточняй у конкретного продавца.', [
      { title: 'До оплаты', items: ['Укажи точный адрес или выбери самовывоз, если магазин его предлагает.', 'Проверь полную сумму с доставкой. Цена товара не означает, что доставка включена.', 'Уточни, есть ли точная версия в местном наличии или её нужно привезти.', 'Спроси предполагаемую дату получения: рабочая ссылка не доказывает наличие.'] },
      { title: 'После покупки', text: ['Сохрани название магазина, номер заказа и подтверждение. По отслеживанию и задержкам обращайся туда, где платил. TrendingNow не видит статус внешнего заказа.'] },
    ]),
    warranty: page('Гарантия и возврат', 'Проверь условия гарантии и возврата у продавца, которому платишь. Здесь практический список вопросов, а не индивидуальная юридическая консультация.', [
      { title: 'Спроси до покупки', items: ['Кто выполняет гарантийное обслуживание и где находится сервис?', 'Какие сроки и исключения относятся именно к этой модели?', 'Как оформить возврат, куда отправить вещь и кто оплачивает перевозку?', 'Где полный текст условий и как получить документ о покупке?'] },
      { title: 'Если возникла проблема', text: ['Обратись к продавцу с номером заказа, описанием проблемы и нужными фото. Сохрани переписку. Не отправляй TrendingNow данные карты, пароли или документы личности. Этот список не ограничивает законные права покупателя.'] },
    ]),
    paymentMethods: page('Как проходит оплата', 'Оплата происходит на сайте выбранного магазина. Нажатие на ссылку TrendingNow не создаёт заказ и не списывает деньги.', [
      { title: 'Перед вводом платёжных данных', items: ['Посмотри название продавца здесь, затем проверь адрес сайта в новой вкладке.', 'Сверь точную модель, цвет, комплектацию и итоговую сумму.', 'Уточни доступные способы оплаты и условия рассрочки у магазина.', 'Сохрани подтверждение магазина: TrendingNow не может подтвердить внешний платёж.'] },
      { title: 'Что мы не запрашиваем', text: ['Для внешней покупки мы не запрашиваем номер карты, CVV, банковский пароль или SMS-код. Не присылай эти данные по почте.'] },
    ]),
    faq: page('Частые вопросы', 'Ответы о выборе, сохранении и покупке во внешнем магазине.', [
      { title: 'Я покупаю здесь или в другом магазине?', text: ['Здесь выбираешь и сравниваешь. Покупка, оплата, доставка и возврат происходят у выбранного магазина.'] },
      { title: 'Для сохранения нужен аккаунт?', text: ['Нет. Находки хранятся в этом браузере и не переносятся на другие устройства. Очистка данных браузера может удалить список.'] },
      { title: 'Почему цена отличается?', text: ['Мы показываем сведения с датой наблюдения. Цена может измениться. Устаревшую цену не выдаём за текущую; окончательную сумму уточняй в магазине.'] },
      { title: 'Здесь все магазины и товары?', text: ['Нет. Это отобранный каталог, не весь рынок. Пустой результат не означает, что вещь нигде в Грузии не продаётся.'] },
      { title: 'Как сообщить об ошибке?', text: ['Напиши на contact@ainow.ge: добавь ссылку карточки, модель и описание ошибки. Открытие почтового приложения не отправляет письмо — его нужно отправить самостоятельно.'] },
    ]),
    contact: page('Напиши нам', 'Нужна помощь с выбором или заметил ошибку? Добавь ссылку на вещь, модель и свой вопрос.', [
      { title: 'Выбор или ошибка в карточке', text: ['Email: contact@ainow.ge', 'Tel: +995 574 88 28 87', 'Расскажи о задаче, бюджете и важных условиях. Срок ответа заранее не обещаем.'] },
      { title: 'Уже купленная вещь', text: ['Статус заказа, доставку, возврат денег и гарантию уточняй в магазине, которому платил. У нас нет доступа к его системе заказов.'] },
      { title: 'Личные данные', text: ['Не присылай данные карты, пароли, SMS-коды или документы личности. Для описания проблемы достаточно публичной ссылки на товар.'] },
    ], true),
    corporateOffer: page('Магазинам и авторам', 'Есть магазин или полезное собственное исследование? Напиши о сотрудничестве. Обращение не означает подтверждения партнёрства или публикации.', [
      { title: 'Что прислать', items: ['Адрес сайта, контактного человека и категории товаров.', 'Источник данных точных моделей и способ поддерживать их актуальность.', 'Разрешение на использование фото и описаний, его условия.', 'Предлагаемый формат сотрудничества и коммерческие условия, если они есть.'] },
      { title: 'Контакт', text: ['contact@ainow.ge — укажи магазин или тему в заголовке письма. Коммерческие отношения проверяются отдельно и раскрываются читателям.'] },
    ]),
  },
} satisfies Record<ActiveLocale, Record<InfoPageKey, DiscoveryInfoPage>>;
