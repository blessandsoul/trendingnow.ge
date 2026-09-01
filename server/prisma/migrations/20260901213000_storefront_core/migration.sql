-- CreateTable
CREATE TABLE `storefront_categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `description` VARCHAR(500) NULL,
    `imageUrl` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `storefront_categories_slug_key`(`slug`),
    INDEX `storefront_categories_parentId_idx`(`parentId`),
    INDEX `storefront_categories_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storefront_products` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `name` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `brand` VARCHAR(180) NOT NULL DEFAULT 'TrendingNow',
    `imageUrl` VARCHAR(500) NOT NULL,
    `salePrice` DECIMAL(12, 2) NOT NULL,
    `originalPrice` DECIMAL(12, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'GEL',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isNew` BOOLEAN NOT NULL DEFAULT false,
    `isBestseller` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `gallery` JSON NULL,
    `attributes` JSON NULL,
    `sourceRank` INTEGER NULL,
    `sourceCapturedAt` DATETIME(3) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `storefront_products_slug_key`(`slug`),
    INDEX `storefront_products_categoryId_isActive_idx`(`categoryId`, `isActive`),
    INDEX `storefront_products_isActive_isFeatured_idx`(`isActive`, `isFeatured`),
    INDEX `storefront_products_isActive_isBestseller_idx`(`isActive`, `isBestseller`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorites_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`userId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `publicCode` VARCHAR(40) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `firstName` VARCHAR(80) NOT NULL,
    `lastName` VARCHAR(80) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `deliveryAddress` VARCHAR(500) NOT NULL,
    `deliveryZone` ENUM('TBILISI', 'REGION') NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'SENT_FOR_DELIVERY', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `shipping` DECIMAL(12, 2) NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'GEL',
    `promoCode` VARCHAR(80) NULL,
    `telegramStatus` ENUM('PENDING', 'SENT', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'SKIPPED',
    `telegramError` VARCHAR(500) NULL,
    `telegramMessageId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_publicCode_key`(`publicCode`),
    INDEX `orders_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `orders_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `orders_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `productSlug` VARCHAR(180) NOT NULL,
    `productName` VARCHAR(300) NOT NULL,
    `productBrand` VARCHAR(180) NOT NULL,
    `productImageUrl` VARCHAR(500) NOT NULL,
    `categoryName` VARCHAR(180) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `lineTotal` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `storefront_categories` ADD CONSTRAINT `storefront_categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `storefront_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `storefront_products` ADD CONSTRAINT `storefront_products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `storefront_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `storefront_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `storefront_products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Bootstrap categories used by the current public catalog.
INSERT INTO `storefront_categories`
(`id`, `slug`, `name`, `description`, `imageUrl`, `sortOrder`, `isFeatured`, `isActive`, `updatedAt`)
VALUES
('category-fashion', 'fashion', 'მოდა', 'ყოველდღიური ტანსაცმელი და აქსესუარები', '/storefront/trendingnow/category-fashion-v2.webp', 0, true, true, CURRENT_TIMESTAMP(3)),
('category-home', 'home', 'სახლი', 'პრაქტიკული ნივთები სახლისთვის', '/storefront/trendingnow/category-home-v2.webp', 1, true, true, CURRENT_TIMESTAMP(3)),
('category-technology', 'technology', 'ტექნიკა', 'სასარგებლო ტექნიკა ყოველდღიური გამოყენებისთვის', '/storefront/trendingnow/category-tech-v2.webp', 2, true, true, CURRENT_TIMESTAMP(3)),
('category-automotive', 'automotive', 'ავტო', 'ხელსაწყოები და აქსესუარები ავტომობილისთვის', '/storefront/trendingnow/category-auto-v2.webp', 3, true, true, CURRENT_TIMESTAMP(3)),
('category-sport', 'sport', 'სპორტი', 'ტანსაცმელი და ნივთები აქტიური დღისთვის', '/storefront/trendingnow/category-sport-v2.webp', 4, true, true, CURRENT_TIMESTAMP(3)),
('category-care', 'care', 'მოვლა', 'დასუფთავებისა და მოვლის ტექნიკა', '/storefront/trendingnow/category-care-v2.webp', 5, true, true, CURRENT_TIMESTAMP(3));

-- Bootstrap the 18 currently published products. Order totals always use these
-- server-side prices; the API never trusts a price submitted by the browser.
INSERT INTO `storefront_products`
(`id`, `slug`, `name`, `description`, `brand`, `imageUrl`, `salePrice`, `originalPrice`, `currency`, `isFeatured`, `isNew`, `isBestseller`, `isActive`, `sourceRank`, `sourceCapturedAt`, `categoryId`, `updatedAt`)
VALUES
('601100060835831', 'product-601100060835831', 'ხალიჩისა და ავეჯის სარეცხი აპარატი', '800W, 22KPa, ავეჯისა და ხალიჩისთვის', 'TrendingNow', '/storefront/products-ai/601100060835831/01.webp', 155.44, 259.72, 'GEL', true, false, true, true, 1, '2026-08-27 15:25:32.000', 'category-care', CURRENT_TIMESTAMP(3)),
('601103219516618', 'product-601103219516618', 'პორტატული სტარტერი და საბურავის კომპრესორი', '10-in-1, 180 PSI, 8000mAh', 'TrendingNow', '/storefront/products-ai/601103219516618/01.webp', 96.37, 203.99, 'GEL', true, false, true, true, 2, '2026-08-27 15:25:32.000', 'category-automotive', CURRENT_TIMESTAMP(3)),
('601101560968489', 'product-601101560968489', 'უსადენო საბურავის კომპრესორი', '150 PSI, LED ეკრანი, USB დამუხტვა', 'TrendingNow', '/storefront/products-ai/601101560968489/01.webp', 40.15, 67.23, 'GEL', true, false, true, true, 3, '2026-08-27 15:25:32.000', 'category-automotive', CURRENT_TIMESTAMP(3)),
('606469311327985', 'product-606469311327985', 'კლასიკური ქუსლიანი სლაიდები', 'კვადრატული ცხვირი, ყოველდღიური ლუქი', 'TrendingNow', '/storefront/products-ai/606469311327985/01.webp', 22.84, 38.28, 'GEL', true, false, true, true, 5, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3)),
('601102305198387', 'product-601102305198387', 'ზაფხულის სპორტული კომპლექტი', 'მაისური და შორტი ერთ ნაკრებში', 'TrendingNow', '/storefront/products-ai/601102305198387/01.webp', 26.18, 48.61, 'GEL', true, false, true, true, 6, '2026-08-27 15:25:32.000', 'category-sport', CURRENT_TIMESTAMP(3)),
('601103076930545', 'product-601103076930545', 'ელექტრონული იატაკის სასწორი', 'LED ეკრანი და ტემპერატურის მაჩვენებელი', 'TrendingNow', '/storefront/products-ai/601103076930545/01.webp', 27.31, 58.15, 'GEL', true, false, true, true, 7, '2026-08-27 15:25:32.000', 'category-home', CURRENT_TIMESTAMP(3)),
('601101183929395', 'product-601101183929395', 'ორმაგი კამერიანი ავტორეგისტრატორი', '1080P წინა და 720P უკანა კამერა', 'TrendingNow', '/storefront/products-ai/601101183929395/01.webp', 26.45, 49.87, 'GEL', true, false, true, true, 8, '2026-08-27 15:25:32.000', 'category-automotive', CURRENT_TIMESTAMP(3)),
('601099526752299', 'product-601099526752299', 'Wi-Fi გარე კამერა', 'ბრუნვა, ღამის ხედვა და მოძრაობის სიგნალი', 'TrendingNow', '/storefront/products-ai/601099526752299/01.webp', 54.21, 114.34, 'GEL', true, false, true, true, 9, '2026-08-27 15:25:32.000', 'category-technology', CURRENT_TIMESTAMP(3)),
('605899070527412', 'product-605899070527412', 'ხელის ორთქლის საწმენდი', '1500W, სახლისა და მანქანისთვის', 'TrendingNow', '/storefront/products-ai/605899070527412/01.webp', 109.77, 210.33, 'GEL', true, false, true, true, 10, '2026-08-27 15:25:32.000', 'category-care', CURRENT_TIMESTAMP(3)),
('601103084183696', 'product-601103084183696', '10.1-ინჩიანი Android პლანშეტი', 'კლავიატურა, მაუსი და სტილუსი კომპლექტში', 'TrendingNow', '/storefront/products-ai/601103084183696/01.webp', 210.97, 357.90, 'GEL', true, false, false, true, 11, '2026-08-27 15:25:32.000', 'category-technology', CURRENT_TIMESTAMP(3)),
('601103787599019', 'product-601103787599019', '216-ნაწილიანი ხელსაწყოების ნაკრები', 'კომპაქტურ ყუთში, სახლისა და ავტომობილისთვის', 'TrendingNow', '/storefront/products-ai/601103787599019/01.webp', 40.28, 73.30, 'GEL', true, false, false, true, 12, '2026-08-27 15:25:32.000', 'category-automotive', CURRENT_TIMESTAMP(3)),
('601104461301615', 'product-601104461301615', 'USB დამტენი პლაზმური სანთებელა', 'ქარისგან დაცული და ალის გარეშე', 'TrendingNow', '/storefront/products-ai/601104461301615/01.webp', 8.45, 14.60, 'GEL', true, false, false, true, 14, '2026-08-27 15:25:32.000', 'category-home', CURRENT_TIMESTAMP(3)),
('601100102744841', 'product-601100102744841', 'ყოველდღიური პეჩვორკ სნიკერები', 'მსუბუქი მოდელი ქალაქისთვის', 'TrendingNow', '/storefront/products-ai/601100102744841/01.webp', 23.50, 37.37, 'GEL', false, false, false, true, 15, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3)),
('601105075616985', 'product-601105075616985', 'ყოველდღიური სამგზავრო ზურგჩანთა', 'ფართო განყოფილება ლეპტოპისთვის', 'TrendingNow', '/storefront/products-ai/601105075616985/01.webp', 19.58, 31.14, 'GEL', false, false, false, true, 18, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3)),
('4015451985', 'product-4015451985', 'HypeWear ბეისიქ ტოპი', 'მსუბუქი ყოველდღიური ფენა', 'TrendingNow', '/storefront/products-ai/4015451985/01.webp', 19.57, NULL, 'GEL', false, false, true, true, 1, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3)),
('1218081703', 'product-1218081703', 'TOP Textile ლონგსლივი', 'ბაზისური სილუეტი ყოველდღე', 'TrendingNow', '/storefront/products-ai/1218081703/01.webp', 26.27, 73.49, 'GEL', false, false, true, true, 3, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3)),
('2754279040', 'product-2754279040', 'CRB ბეისიქ მაისური', 'მარტივი ჭრა, ერთი ცალი', 'TrendingNow', '/storefront/products-ai/2754279040/01.webp', 13.92, 20.24, 'GEL', false, false, true, true, 8, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3)),
('2035758806', 'product-2035758806', 'Remisa უსაკერო ბიუსტჰალტერი', 'რბილი, კარკასის გარეშე მოდელი', 'TrendingNow', '/storefront/products-ai/2035758806/01.webp', 57.07, 344.49, 'GEL', false, false, false, true, 16, '2026-08-27 15:25:32.000', 'category-fashion', CURRENT_TIMESTAMP(3));
