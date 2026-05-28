interface MarketingEmailProps {
    customerName: string;
    emailBody: string;
    promoCode: string;
    startsAt: string;
    endsAt: string;
}

export const getVPP21MarketingTemplate = ({
    customerName,
    emailBody,
    promoCode,
    startsAt,
    endsAt
}: MarketingEmailProps): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; padding: 40px 20px; border-top: 4px solid #7f0019; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <tr>
                <td align="center" style="padding-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #333333; letter-spacing: 2px;">VPP21 STATIONERY</h1>
                    <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #888888; letter-spacing: 1px;">Minimalist Lifestyle</p>
                </td>
            </tr>
            <tr>
                <td style="color: #444444; font-size: 15px; line-height: 1.6; padding-bottom: 30px;">
                    <p style="margin-top: 0;">Xin chào <strong>${customerName}</strong>,</p>
                    <div style="white-space: pre-line; color: #444444;">
                        ${emailBody}
                    </div>
                </td>
            </tr>
            <tr>
                <td style="background-color: #fcf8f8; border: 1px solid #f2e6e6; padding: 20px; border-radius: 4px; text-align: center; padding-bottom: 25px;">
                    <span style="font-size: 12px; text-transform: uppercase; color: #7f0019; font-weight: 600; letter-spacing: 1px;">Thông tin ưu đãi</span>
                    <h2 style="margin: 10px 0; font-size: 22px; color: #7f0019; font-weight: 700;">Chương trình: ${promoCode}</h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666;">Thời gian áp dụng từ ngày ${startsAt} đến ${endsAt}</p>
                    <a href="https://yourwebsite.com/shop" style="background-color: #7f0019; color: #ffffff; display: inline-block; padding: 12px 30px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px;">Khám phá ngay</a>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};
