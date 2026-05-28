import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getVPP21MarketingTemplate } from 'src/templates/emailTemplate';

interface SaleData {
  name: string;
  discountPercent: number;
  applyType: string;
  startsAt: Date;
  endsAt: Date;
}

interface Recipient {
  email: string;
  name: string;
}

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor(private config: ConfigService) {
    this.resend = new Resend(config.getOrThrow('RESEND_API_KEY'));
  }

  async sendPasswordResetEmail(toEmail: string, resetLink: string) {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Đặt lại mật khẩu',
      html: `<p>Bấm vào đây để đặt lại mật khẩu <a href="${resetLink}">Đặt lại mật khẩu</a>!</p>`,
    });
  }

  /**
   * Gửi email thông báo sale cho một khách hàng
   * @param toEmail - Email khách hàng
   * @param customerName - Tên khách hàng
   * @param saleData - Thông tin chương trình sale
   */
  async sendSaleNotificationEmail(
    toEmail: string,
    customerName: string,
    saleData: SaleData,
  ) {
    const emailBody = `Chúng tôi vừa khởi động chương trình sale "${saleData.name}" với mức giảm giá ${saleData.discountPercent}% dành cho bạn. Đây là cơ hội tuyệt vời để mua sắm các sản phẩm yêu thích với giá tốt nhất!`;

    const template = getVPP21MarketingTemplate({
      customerName,
      emailBody,
      promoCode: saleData.name,
      startsAt: saleData.startsAt.toLocaleDateString('vi-VN'),
      endsAt: saleData.endsAt.toLocaleDateString('vi-VN'),
    });

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: `🎉 Sale: ${saleData.name} - Giảm giá ${saleData.discountPercent}% đang diễn ra!`,
      html: template,
    });
  }

  /**
   * Gửi email sale theo batch cho nhiều khách hàng
   * Xử lý rate limiting để tránh vượt quá giới hạn Resend API
   * @param recipients - Danh sách email và tên khách hàng
   * @param saleData - Thông tin chương trình sale
   */
  async sendBulkSaleEmails(recipients: Recipient[], saleData: SaleData) {
    const BATCH_SIZE = 20; // Gửi 20 email mỗi lần
    const DELAY_MS = 100; // Delay 100ms giữa các batch
    let successCount = 0;
    let failedCount = 0;

    console.log(
      `[EmailService] Bắt đầu gửi email sale "${saleData.name}" cho ${recipients.length} khách hàng`,
    );

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);

      console.log(
        `[EmailService] Đang gửi batch ${batchNumber}/${totalBatches} (${batch.length} email): ${batch.map((b) => b.email).join(', ')}`,
      );

      const promises = batch.map((recipient) =>
        this.sendSaleNotificationEmail(
          recipient.email,
          recipient.name,
          saleData,
        )
          .then(() => {
            successCount++;
            console.log(
              `[EmailService] ✓ Gửi thành công email tới ${recipient.email}`,
            );
          })
          .catch((err) => {
            failedCount++;
            console.error(
              `[EmailService] ✗ Lỗi gửi email tới ${recipient.email}:`,
              err,
            );
            // Không throw, tiếp tục gửi email khác
          }),
      );

      await Promise.allSettled(promises);

      // Delay trước batch tiếp theo (trừ batch cuối)
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log(
      `[EmailService] ✓ Hoàn thành gửi email sale "${saleData.name}": ${successCount} thành công, ${failedCount} thất bại`,
    );
  }
}
