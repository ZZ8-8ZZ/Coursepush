import { Resend } from 'resend';
import { appConfig } from '../config/env.js';

const resend = new Resend(appConfig.resendApiKey);

export class EmailService {
  static async sendVerificationCode(email, code) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'CoursePush <noreply@coursepush.com>', // 这里的域名需要根据 Resend 配置调整，如果是测试阶段可以使用 resend 提供的默认域名
        to: [email],
        subject: 'CoursePush 验证码',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>找回密码验证码</h2>
            <p>您好，您正在进行找回密码操作。</p>
            <p>您的验证码是：<strong style="font-size: 24px; color: #4F46E5;">${code}</strong></p>
            <p>验证码在 10 分钟内有效。如果不是您本人操作，请忽略此邮件。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error('发送邮件失败');
      }

      return data;
    } catch (err) {
      console.error('Email service error:', err);
      throw new Error('发送验证邮件失败，请稍后重试');
    }
  }
}
