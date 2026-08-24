import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { UploadModule } from './upload/upload.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { BannersModule } from './banners/banners.module';
import { BlogModule } from './blog/blog.module';
import { FaqModule } from './faq/faq.module';
import { NovaPoshtaModule } from './nova-poshta/nova-poshta.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { PaymentsModule } from './payments/payments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmailModule,
    CategoriesModule,
    ProductsModule,
    UploadModule,
    OrdersModule,
    CartModule,
    DiscountsModule,
    ReviewsModule,
    SettingsModule,
    BannersModule,
    BlogModule,
    FaqModule,
    NovaPoshtaModule,
    WishlistModule,
    LoyaltyModule,
    FlashSalesModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
