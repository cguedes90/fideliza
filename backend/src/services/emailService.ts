import nodemailer from 'nodemailer';

interface LeadEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    // Se não há configuração de email, não inicializar o transporter
    if (!emailUser || !emailPass) {
      console.warn('Email credentials not configured. Email notifications disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  async sendLeadNotification(leadData: LeadEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email transporter not configured. Skipping email notification.');
      return false;
    }

    const leadEmailTo = process.env.LEAD_EMAIL_TO || 'contato@inovamentelabs.com.br';
    const emailFrom = process.env.EMAIL_FROM || 'noreply@fidelizapontos.com';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Novo Lead - FidelizaPontos</h1>
        </div>
        
        <div style="background: white; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Detalhes do Lead</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555; width: 120px;">Nome:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${leadData.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
                  <a href="mailto:${leadData.email}" style="color: #667eea; text-decoration: none;">${leadData.email}</a>
                </td>
              </tr>
              ${leadData.phone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Telefone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
                  <a href="tel:${leadData.phone}" style="color: #667eea; text-decoration: none;">${leadData.phone}</a>
                </td>
              </tr>
              ` : ''}
              ${leadData.company ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Empresa:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${leadData.company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #555; vertical-align: top;">Data:</td>
                <td style="padding: 10px 0; color: #333;">${new Date().toLocaleString('pt-BR')}</td>
              </tr>
            </table>
          </div>
          
          ${leadData.message ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Mensagem:</h3>
            <div style="background: #f1f3f4; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #333; line-height: 1.5;">${leadData.message}</p>
            </div>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0 0 0; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>FidelizaPontos</strong> - Sistema de Fidelidade SaaS<br>
              Este lead foi capturado através da landing page em ${new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
      NOVO LEAD - FIDELIZAPONTOS
      
      Detalhes do Lead:
      Nome: ${leadData.name}
      Email: ${leadData.email}
      ${leadData.phone ? `Telefone: ${leadData.phone}` : ''}
      ${leadData.company ? `Empresa: ${leadData.company}` : ''}
      Data: ${new Date().toLocaleString('pt-BR')}
      
      ${leadData.message ? `Mensagem:\n${leadData.message}` : ''}
      
      --
      FidelizaPontos - Sistema de Fidelidade SaaS
      Lead capturado em ${new Date().toLocaleDateString('pt-BR')}
    `;

    try {
      const mailOptions = {
        from: `"FidelizaPontos" <${emailFrom}>`,
        to: leadEmailTo,
        subject: 'Lead FidelizaPontos',
        text: textContent,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Lead email sent successfully to ${leadEmailTo}`);
      return true;
    } catch (error) {
      console.error('Error sending lead email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();