import { Resend } from 'resend';
import { appConfig } from '../config/env.js';

const resend = new Resend(appConfig.resendApiKey);

export class EmailService {
  static async sendVerificationCode(email, code) {
    try {
      // 在没有验证域名的测试阶段，Resend 要求使用 onboarding@resend.dev 作为发送者
      // 且只能发送给注册 Resend 账号时使用的邮箱
      const from = process.env.RESEND_FROM_EMAIL || 'admin@kcb.070701.xyz';
      
      const { data, error } = await resend.emails.send({
        from: `CoursePush <${from}>`,
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
        console.error('Resend error details:', error);
        throw new Error(error.message || '发送邮件失败');
      }

      return data;
    } catch (err) {
      console.error('Email service unexpected error:', err);
      throw new Error(err.message || '发送验证邮件失败，请稍后重试');
    }
  }
}
