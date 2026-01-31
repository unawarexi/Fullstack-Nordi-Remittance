import type {
  EmailTemplateData,
  BaseTemplateData,
  UserAccountData,
  KycStatusData,
  TransactionData,
  CardIssuedData,
  LoanApplicationData,
  SecurityAlertData,
  InvestmentData,
  PasswordResetData,
  StatementData,
  SupportTicketData,
  PromotionData,
  RegulatoryReportData,
  SocialLinks,
  NavigationLinks,
  // New types for controller integration
  EmailVerificationData,
  PasswordChangedData,
  EmailChangeData,
  TwoFactorEnabledData,
  TwoFactorDisabledData,
  AccountDeletionData,
  LoanDisbursedData,
  CardBlockedData,
  CardReportedData,
  AdminAccountData,
  AccountStatusData,
  AccountRestoredData,
  DisputeClaimData,
  SavingsGoalData,
  LoginAlertData,
  OtpEmailData
} from '../../types/Mail.types.js';

class EmailContentGenerator {
  private readonly baseUrl: string;
  private readonly supportEmail: string;
  private readonly companyName: string;
  private readonly year: number;
  private readonly socialLinks: SocialLinks;
  private readonly navLinks: NavigationLinks;

  constructor() {
    this.baseUrl = process.env.BASE_URL || "https://remit.nordea.com";
    this.supportEmail = process.env.SUPPORT_EMAIL || "support@nordea-remittance.com";
    this.companyName = "Nordea Remittance";
    this.year = new Date().getFullYear();
    
    this.socialLinks = {
      facebook: "https://www.facebook.com/Nordea",
      twitter: "https://twitter.com/Nordea",
      youtube: "https://www.youtube.com/user/Nordea",
      linkedin: "https://www.linkedin.com/company/nordea"
    };
    
    this.navLinks = {
      login: `${this.baseUrl}/auth/login`,
      transactions: `${this.baseUrl}/transactions`,
      services: `${this.baseUrl}/services`,
      support: `${this.baseUrl}/support`,
      website: this.baseUrl,
      privacy: `${this.baseUrl}/privacy`,
      terms: `${this.baseUrl}/terms`
    };
  }

  getBaseTemplateData(): BaseTemplateData {
    return {
      EMAIL_TITLE: '',
      GREETING: '',
      MAIN_CONTENT: '',
      COMPANY_NAME: this.companyName,
      YEAR: this.year,
      SOCIAL_FACEBOOK: this.socialLinks.facebook,
      SOCIAL_TWITTER: this.socialLinks.twitter,
      SOCIAL_YOUTUBE: this.socialLinks.youtube,
      SOCIAL_LINKEDIN: this.socialLinks.linkedin,
      LINK_LOGIN: this.navLinks.login,
      LINK_TRANSACTIONS: this.navLinks.transactions,
      LINK_SERVICES: this.navLinks.services,
      LINK_SUPPORT: this.navLinks.support,
      LINK_WEBSITE: this.navLinks.website,
      LINK_PRIVACY: this.navLinks.privacy,
      LINK_TERMS: this.navLinks.terms,
      FOOTER_TEXT: `This email was sent by ${this.companyName}. For support, contact ${this.supportEmail}`,
      FOOTER_IMAGE: "https://fhdzjrj.stripocdn.email/content/guids/CABINET_d682b1c5c3e6ca19c2b709cadb8e0af619ba854080ca1e19025c86180c64ecd0/images/5.jpg"
    };
  }

  accountCreatedEmail(userData: UserAccountData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Welcome to Nordea Remittance",
      GREETING: `Hello ${userData.firstName || ""},`,
      HERO_IMAGE: "https://fhdzjrj.stripocdn.email/content/guids/CABINET_d682b1c5c3e6ca19c2b709cadb8e0af619ba854080ca1e19025c86180c64ecd0/images/6.jpg",
      MAIN_CONTENT: `
        <p>Welcome to ${this.companyName}! Your account has been successfully created.</p>
        <p>We're excited to have you on board. You can now enjoy seamless money transfers, secure transactions, and much more.</p>
      `,
      ACCOUNT_SUMMARY: {
        label: "Account Number",
        account_number: userData.accountNumber || "—",
        currency: userData.currency || "USD",
        balance: userData.initialBalance || "0.00"
      },
      CONTENT_SECTIONS: [
        {
          title: "Getting Started",
          content: `
            <p>To complete your setup, please verify your email and complete KYC verification.</p>
            <p>Once verified, you'll have full access to all our services.</p>
          `
        }
      ],
      BUTTONS: [
        {
          text: "Complete Verification",
          url: userData.verificationUrl || `${this.baseUrl}/kyc/verify`,
          primary: true
        },
        {
          text: "Explore Dashboard",
          url: `${this.baseUrl}/dashboard`,
          primary: false
        }
      ],
      QUICK_TIPS: "Enable two-factor authentication for enhanced security of your account.",
      UNSUBSCRIBE_LINK: userData.userId ? `${this.baseUrl}/unsubscribe?user=${userData.userId}` : undefined
    };
  }

  kycStatusEmail(kycData: KycStatusData): EmailTemplateData {
    const statusConfig = {
      approved: {
        title: "KYC Verification Approved",
        alertType: "success" as const,
        message: "Your identity verification has been successfully completed!"
      },
      rejected: {
        title: "KYC Verification Requires Attention",
        alertType: "warning" as const,
        message: "Your verification documents need to be resubmitted."
      },
      pending: {
        title: "KYC Verification In Progress",
        alertType: "info" as const,
        message: "Your documents are being reviewed by our team."
      }
    };

    const config = statusConfig[kycData.status] || statusConfig.pending;

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: config.title,
      GREETING: `Hello ${kycData.firstName || ""},`,
      MAIN_CONTENT: `<p>Your KYC verification status has been updated.</p>`,
      ALERT_BOX: {
        type: config.alertType,
        title: "Verification Status",
        content: config.message
      },
      KYC_PROGRESS: kycData.status === "pending" ? {
        percentage: kycData.progress || 50,
        status_text: "Documents under review"
      } : undefined,
      CONTENT_SECTIONS: kycData.notes ? [{
        title: "Additional Information",
        content: kycData.notes
      }] : undefined,
      BUTTONS: kycData.status === "rejected" ? [{
        text: "Resubmit Documents",
        url: `${this.baseUrl}/kyc/resubmit`,
        primary: true
      }] : undefined,
      UNSUBSCRIBE_LINK: kycData.userId ? `${this.baseUrl}/unsubscribe?user=${kycData.userId}` : undefined
    };
  }

  transactionNotification(transactionData: TransactionData): EmailTemplateData {
    const isCredit = transactionData.type === "deposit" || transactionData.type === "transfer_in";
    
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: `Transaction ${transactionData.status === "completed" ? "Completed" : "Initiated"}`,
      GREETING: `Hello ${transactionData.userName || ""},`,
      MAIN_CONTENT: `
        <p>A ${transactionData.type} transaction has been ${transactionData.status === "completed" ? "completed" : "initiated"} on your account.</p>
      `,
      TRANSACTION_DETAILS: [
        { label: "Transaction Type", value: transactionData.type },
        { label: "Amount", value: `${transactionData.currency} ${transactionData.amount}` },
        { label: "Reference", value: transactionData.referenceNumber },
        { label: "Date", value: transactionData.createdAt || new Date().toLocaleString() },
        { label: "Status", value: transactionData.status }
      ],
      STATUS: {
        type: transactionData.status === "completed" ? "success" : transactionData.status === "failed" ? "failed" : "pending",
        text: transactionData.status.toUpperCase()
      },
      ACCOUNT_SUMMARY: {
        label: "Available Balance",
        currency: transactionData.currency || "USD",
        balance: transactionData.newBalance || "—",
        account_number: transactionData.accountNumber || "—"
      },
      BUTTONS: [{
        text: "View Transaction",
        url: `${this.baseUrl}/transactions/${transactionData.transactionId}`,
        primary: true
      }]
    };
  }

  cardIssuedEmail(cardData: CardIssuedData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Your Card Has Been Issued",
      GREETING: `Hello ${cardData.cardholderName || ""},`,
      MAIN_CONTENT: `
        <p>Great news! Your ${cardData.cardType} card has been successfully issued.</p>
      `,
      LOAN_DETAILS: {
        title: "Card Details",
        items: [
          { label: "Card Type", value: cardData.cardType },
          { label: "Card Brand", value: cardData.cardBrand },
          { label: "Last 4 Digits", value: `**** ${cardData.lastFour}` },
          { label: "Expiry", value: `${cardData.expiryMonth}/${cardData.expiryYear}` },
          { label: "Status", value: cardData.status }
        ]
      },
      ALERT_BOX: {
        type: "info",
        title: "Card Activation Required",
        content: "Please activate your card before first use. You can activate it through the mobile app or web dashboard."
      },
      BUTTONS: [
        {
          text: "Activate Card",
          url: `${this.baseUrl}/cards/${cardData.cardId}/activate`,
          primary: true
        },
        {
          text: "View Card Details",
          url: `${this.baseUrl}/cards/${cardData.cardId}`,
          primary: false
        }
      ]
    };
  }

  loanApplicationEmail(loanData: LoanApplicationData): EmailTemplateData {
    const statusConfig = {
      approved: {
        title: "Loan Application Approved",
        alertType: "success" as const,
        message: `Congratulations! Your loan application for ${loanData.currency} ${loanData.amount} has been approved.`
      },
      rejected: {
        title: "Loan Application Status Update",
        alertType: "error" as const,
        message: "We're unable to approve your loan application at this time."
      },
      under_review: {
        title: "Loan Application Under Review",
        alertType: "info" as const,
        message: "Your loan application is currently being reviewed by our team."
      }
    };

    const config = statusConfig[loanData.status] || statusConfig.under_review;

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: config.title,
      GREETING: `Hello ${loanData.applicantName || ""},`,
      MAIN_CONTENT: `<p>Your loan application status has been updated.</p>`,
      ALERT_BOX: {
        type: config.alertType,
        title: "Application Status",
        content: config.message
      },
      LOAN_DETAILS: {
        title: "Loan Information",
        items: [
          { label: "Loan Type", value: loanData.loanType },
          { label: "Requested Amount", value: `${loanData.currency} ${loanData.requestedAmount}` },
          { label: "Term", value: `${loanData.term} months` },
          { label: "Application ID", value: loanData.applicationId },
          { label: "Status", value: loanData.status }
        ]
      },
      BUTTONS: loanData.status === "approved" ? [{
        text: "Accept Offer",
        url: `${this.baseUrl}/loans/${loanData.loanId}/accept`,
        primary: true
      }] : [{
        text: "View Application",
        url: `${this.baseUrl}/loans/applications/${loanData.applicationId}`,
        primary: true
      }]
    };
  }

  securityAlertEmail(alertData: SecurityAlertData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Security Alert - Unusual Activity Detected",
      GREETING: `Hello ${alertData.userName || ""},`,
      MAIN_CONTENT: `
        <p>We detected unusual activity on your account that requires your attention.</p>
      `,
      SECURITY_ALERT: {
        message: alertData.alertMessage || "Suspicious activity detected on your account.",
        details: [
          { label: "Alert Type", value: alertData.alertType },
          { label: "Detected At", value: alertData.detectedAt },
          { label: "IP Address", value: alertData.ipAddress },
          { label: "Location", value: alertData.location || "Unknown" }
        ]
      },
      ALERT_BOX: {
        type: "error",
        title: "⚠️ Action Required",
        content: "If this wasn't you, please secure your account immediately by changing your password."
      },
      BUTTONS: [
        {
          text: "Review Activity",
          url: `${this.baseUrl}/security/alerts/${alertData.alertId}`,
          primary: true
        },
        {
          text: "Change Password",
          url: `${this.baseUrl}/settings/security/password`,
          primary: false
        }
      ]
    };
  }

  investmentUpdateEmail(investmentData: InvestmentData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Investment Portfolio Update",
      GREETING: `Hello ${investmentData.userName || ""},`,
      MAIN_CONTENT: `
        <p>Your investment portfolio has been updated. Here's a summary of your holdings.</p>
      `,
      PORTFOLIO_SUMMARY: {
        total_value: `${investmentData.currency} ${investmentData.totalValue}`,
        returns: investmentData.returns,
        returns_positive: investmentData.returnsPositive
      },
      MINI_TRANSACTIONS: investmentData.recentTransactions?.map(tx => ({
        description: tx.assetName,
        date: tx.date,
        amount: `${tx.currency} ${tx.amount}`,
        isCredit: tx.type === "buy",
        status: tx.status,
        statusText: tx.status.toUpperCase()
      })),
      BUTTONS: [{
        text: "View Portfolio",
        url: `${this.baseUrl}/investments/portfolio`,
        primary: true
      }]
    };
  }

  passwordResetEmail(userData: PasswordResetData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Password Reset Request",
      GREETING: `Hello ${userData.firstName || ""},`,
      MAIN_CONTENT: `
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
      `,
      ALERT_BOX: {
        type: "warning",
        title: "Security Notice",
        content: "If you didn't request this password reset, please ignore this email or contact support immediately."
      },
      BUTTONS: [{
        text: "Reset Password",
        url: userData.resetUrl,
        primary: true
      }],
      UNSUBSCRIBE_LINK: userData.userId ? `${this.baseUrl}/unsubscribe?user=${userData.userId}` : undefined
    };
  }

  statementGeneratedEmail(statementData: StatementData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Account Statement Ready",
      GREETING: `Hello ${statementData.userName || ""},`,
      MAIN_CONTENT: `
        <p>Your ${statementData.statementType} account statement is now available for download.</p>
      `,
      CONTENT_SECTIONS: [{
        title: "Statement Period",
        content: `
          <p><strong>From:</strong> ${statementData.startDate}</p>
          <p><strong>To:</strong> ${statementData.endDate}</p>
          <p><strong>Format:</strong> ${statementData.fileFormat.toUpperCase()}</p>
        `
      }],
      ATTACHMENTS: [{
        name: `Statement_${statementData.startDate}_${statementData.endDate}.${statementData.fileFormat}`,
        size: statementData.fileSize || "Unknown",
        url: statementData.fileUrl
      }],
      BUTTONS: [{
        text: "Download Statement",
        url: statementData.fileUrl,
        primary: true
      }]
    };
  }

  supportTicketEmail(ticketData: SupportTicketData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: `Support Ticket #${ticketData.ticketId} Update`,
      GREETING: `Hello ${ticketData.userName || ""},`,
      MAIN_CONTENT: `
        <p>Your support ticket has been updated.</p>
      `,
      TICKET_INFO: {
        ticket_id: ticketData.ticketId,
        status: ticketData.status,
        priority: ticketData.priority,
        assigned_to: ticketData.assignedTo || "Support Team"
      },
      CONTENT_SECTIONS: [{
        title: "Latest Update",
        content: ticketData.latestMessage || "No updates available."
      }],
      BUTTONS: [{
        text: "View Ticket",
        url: `${this.baseUrl}/support/tickets/${ticketData.ticketId}`,
        primary: true
      }]
    };
  }

  promotionEmail(promoData: PromotionData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: promoData.title || "Special Offer Just for You!",
      GREETING: `Hello ${promoData.userName || ""},`,
      HERO_IMAGE: promoData.bannerImage,
      MAIN_CONTENT: `
        <p>${promoData.description}</p>
      `,
      CONTENT_SECTIONS: [{
        title: "How to Redeem",
        content: promoData.redeemInstructions || "Use the button below to claim your offer."
      }],
      BUTTONS: [{
        text: promoData.ctaText || "Claim Offer",
        url: promoData.ctaUrl,
        primary: true
      }],
      ADDITIONAL_CONTENT: `
        <p style="font-size:12px;color:#6B7280;">Offer expires: ${promoData.expiryDate}</p>
      `
    };
  }

  regulatoryReportEmail(reportData: RegulatoryReportData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Regulatory Report Submitted",
      GREETING: "Dear Compliance Team,",
      MAIN_CONTENT: `
        <p>A ${reportData.reportType} report has been ${reportData.status}.</p>
      `,
      CONTENT_SECTIONS: [{
        title: "Report Details",
        content: `
          <ul style="margin-left:18px;">
            <li><strong>Report Type:</strong> ${reportData.reportType}</li>
            <li><strong>Regulator:</strong> ${reportData.regulatorName}</li>
            <li><strong>Period:</strong> ${reportData.startDate} to ${reportData.endDate}</li>
            <li><strong>Deadline:</strong> ${reportData.submissionDeadline}</li>
            <li><strong>Status:</strong> ${reportData.status}</li>
          </ul>
        `
      }],
      BUTTONS: [{
        text: "View Report",
        url: `${this.baseUrl}/admin/reports/${reportData.reportId}`,
        primary: true
      }]
    };
  }

  // ============================================================================
  // NEW EMAIL TEMPLATES FOR CONTROLLER INTEGRATION
  // ============================================================================

  /**
   * Email verification with link or code
   */
  emailVerificationEmail(data: EmailVerificationData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Verify Your Email Address",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>Thank you for registering with ${this.companyName}!</p>
        <p>Please verify your email address to complete your account setup and access all features.</p>
        ${data.verificationCode ? `
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6B7280;">Your verification code is:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0B5394;">${data.verificationCode}</p>
          </div>
        ` : ''}
      `,
      ALERT_BOX: {
        type: "info",
        title: "Link Expires Soon",
        content: `This verification link will expire in ${data.expiresIn || "24 hours"} for security reasons.`
      },
      BUTTONS: [{
        text: "Verify Email",
        url: data.verificationUrl,
        primary: true
      }],
      QUICK_TIPS: "If you didn't create an account with us, please ignore this email.",
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Password changed confirmation
   */
  passwordChangedEmail(data: PasswordChangedData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Password Changed Successfully",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>Your password has been successfully changed.</p>
        <p>If you made this change, no further action is required.</p>
      `,
      CONTENT_SECTIONS: [{
        title: "Change Details",
        content: `
          <p><strong>Changed at:</strong> ${data.changedAt}</p>
          ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ''}
          ${data.userAgent ? `<p><strong>Device:</strong> ${data.userAgent}</p>` : ''}
        `
      }],
      ALERT_BOX: {
        type: "warning",
        title: "⚠️ Didn't make this change?",
        content: "If you did not change your password, your account may be compromised. Please reset your password immediately and contact support."
      },
      BUTTONS: [
        {
          text: "Reset Password",
          url: `${this.baseUrl}/auth/forgot-password`,
          primary: true
        },
        {
          text: "Contact Support",
          url: `${this.baseUrl}/support`,
          primary: false
        }
      ],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Email change verification
   */
  emailChangeVerificationEmail(data: EmailChangeData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Verify Your New Email Address",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>You requested to change your email address to: <strong>${data.newEmail}</strong></p>
        <p>Please use the verification code below to confirm this change:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6B7280;">Your verification code is:</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0B5394;">${data.verificationCode}</p>
        </div>
      `,
      ALERT_BOX: {
        type: "warning",
        title: "Security Notice",
        content: `This code expires in ${data.expiresIn || "15 minutes"}. If you didn't request this change, please secure your account immediately.`
      },
      BUTTONS: [{
        text: "Go to Settings",
        url: `${this.baseUrl}/settings/security`,
        primary: true
      }],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Two-factor authentication enabled
   */
  twoFactorEnabledEmail(data: TwoFactorEnabledData): EmailTemplateData {
    const methodLabels = {
      sms: 'SMS',
      email: 'Email',
      authenticator: 'Authenticator App'
    };

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Two-Factor Authentication Enabled",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>Two-factor authentication has been successfully enabled on your account.</p>
        <p>Your account is now more secure! You'll need to provide a verification code each time you log in.</p>
      `,
      CONTENT_SECTIONS: [
        {
          title: "2FA Details",
          content: `
            <p><strong>Method:</strong> ${methodLabels[data.method]}</p>
            <p><strong>Enabled at:</strong> ${data.enabledAt}</p>
          `
        },
        ...(data.backupCodes && data.backupCodes.length > 0 ? [{
          title: "🔑 Backup Codes",
          content: `
            <p>Save these backup codes in a secure place. You can use them to access your account if you lose access to your 2FA device.</p>
            <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; font-family: monospace; margin: 10px 0;">
              ${data.backupCodes.map(code => `<p style="margin: 4px 0;">${code}</p>`).join('')}
            </div>
            <p style="color: #DC2626; font-weight: 600;">⚠️ Each code can only be used once!</p>
          `
        }] : [])
      ],
      ALERT_BOX: {
        type: "success",
        title: "✓ Account Secured",
        content: "Your account now has an extra layer of protection against unauthorized access."
      },
      BUTTONS: [{
        text: "Manage Security Settings",
        url: `${this.baseUrl}/settings/security`,
        primary: true
      }],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Two-factor authentication disabled
   */
  twoFactorDisabledEmail(data: TwoFactorDisabledData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Two-Factor Authentication Disabled",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>Two-factor authentication has been disabled on your account.</p>
        <p>Your account is now less secure. We strongly recommend re-enabling 2FA to protect your account.</p>
      `,
      CONTENT_SECTIONS: [{
        title: "Details",
        content: `
          <p><strong>Disabled at:</strong> ${data.disabledAt}</p>
          ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ''}
        `
      }],
      ALERT_BOX: {
        type: "error",
        title: "⚠️ Security Warning",
        content: "If you didn't disable 2FA, your account may be compromised. Please change your password immediately and contact support."
      },
      BUTTONS: [
        {
          text: "Re-enable 2FA",
          url: `${this.baseUrl}/settings/security/2fa`,
          primary: true
        },
        {
          text: "Change Password",
          url: `${this.baseUrl}/settings/security/password`,
          primary: false
        }
      ],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Account deletion request
   */
  accountDeletionRequestEmail(data: AccountDeletionData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Account Deletion Request",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>We received a request to permanently delete your account.</p>
        <p>Use the verification code below to confirm this action:</p>
        <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #991B1B;">Deletion verification code:</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #DC2626;">${data.verificationCode}</p>
        </div>
      `,
      ALERT_BOX: {
        type: "error",
        title: "⚠️ This action is irreversible!",
        content: `Once deleted, your account and all associated data will be permanently removed. This code expires in ${data.expiresIn || "15 minutes"}.`
      },
      CONTENT_SECTIONS: [{
        title: "What will be deleted",
        content: `
          <ul style="margin-left: 18px; color: #6B7280;">
            <li>Your profile and personal information</li>
            <li>Transaction history and records</li>
            <li>Saved payment methods and cards</li>
            <li>All associated accounts and wallets</li>
          </ul>
        `
      }],
      BUTTONS: [{
        text: "Cancel Deletion",
        url: `${this.baseUrl}/settings`,
        primary: false
      }],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Loan disbursed notification
   */
  loanDisbursedEmail(data: LoanDisbursedData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Loan Funds Disbursed",
      GREETING: `Hello ${data.applicantName || ""},`,
      MAIN_CONTENT: `
        <p>Great news! Your loan has been approved and the funds have been disbursed to your account.</p>
      `,
      ACCOUNT_SUMMARY: {
        label: "Disbursed Amount",
        account_number: data.disbursedTo,
        currency: data.currency,
        balance: data.amount
      },
      LOAN_DETAILS: {
        title: "Loan Details",
        items: [
          { label: "Loan ID", value: data.loanId },
          { label: "Loan Type", value: data.loanType },
          { label: "Amount", value: `${data.currency} ${data.amount}` },
          { label: "Disbursed At", value: data.disbursedAt },
          { label: "First Payment Due", value: data.repaymentStartDate },
          { label: "Monthly Payment", value: `${data.currency} ${data.monthlyPayment}` }
        ]
      },
      ALERT_BOX: {
        type: "success",
        title: "✓ Funds Available",
        content: "The loan amount is now available in your account and ready to use."
      },
      BUTTONS: [
        {
          text: "View Loan Details",
          url: `${this.baseUrl}/loans/${data.loanId}`,
          primary: true
        },
        {
          text: "View Repayment Schedule",
          url: `${this.baseUrl}/loans/${data.loanId}/schedule`,
          primary: false
        }
      ]
    };
  }

  /**
   * Card blocked notification
   */
  cardBlockedEmail(data: CardBlockedData): EmailTemplateData {
    const blockedByLabels = {
      user: 'You',
      admin: 'Our security team',
      system: 'Our automated security system'
    };

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Card Blocked",
      GREETING: `Hello ${data.cardholderName || ""},`,
      MAIN_CONTENT: `
        <p>Your ${data.cardType} card ending in ${data.lastFour} has been blocked.</p>
      `,
      LOAN_DETAILS: {
        title: "Card Details",
        items: [
          { label: "Card", value: `**** **** **** ${data.lastFour}` },
          { label: "Type", value: data.cardType },
          { label: "Blocked At", value: data.blockedAt },
          { label: "Blocked By", value: blockedByLabels[data.blockedBy] },
          { label: "Reason", value: data.reason }
        ]
      },
      ALERT_BOX: data.blockedBy !== 'user' ? {
        type: "warning",
        title: "Action Required",
        content: "If you didn't request this block, please contact our support team immediately."
      } : {
        type: "info",
        title: "Card Secured",
        content: "Your card has been blocked as requested. You can unblock it anytime from your dashboard."
      },
      BUTTONS: [
        {
          text: "Manage Card",
          url: `${this.baseUrl}/cards/${data.cardId}`,
          primary: true
        },
        {
          text: "Contact Support",
          url: `${this.baseUrl}/support`,
          primary: false
        }
      ]
    };
  }

  /**
   * Card reported lost/stolen
   */
  cardReportedEmail(data: CardReportedData): EmailTemplateData {
    const reportTypeLabels = {
      lost: 'Lost',
      stolen: 'Stolen',
      damaged: 'Damaged'
    };

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: `Card Reported ${reportTypeLabels[data.reportType]}`,
      GREETING: `Hello ${data.cardholderName || ""},`,
      MAIN_CONTENT: `
        <p>Your ${data.cardType} card ending in ${data.lastFour} has been reported as ${data.reportType}.</p>
        <p>The card has been permanently blocked and cannot be used for any transactions.</p>
      `,
      LOAN_DETAILS: {
        title: "Report Details",
        items: [
          { label: "Card", value: `**** **** **** ${data.lastFour}` },
          { label: "Report Type", value: reportTypeLabels[data.reportType] },
          { label: "Reported At", value: data.reportedAt },
          ...(data.caseNumber ? [{ label: "Case Number", value: data.caseNumber }] : [])
        ]
      },
      ALERT_BOX: {
        type: "info",
        title: "Next Steps",
        content: "We recommend ordering a replacement card. Any pending transactions on this card will be reviewed."
      },
      BUTTONS: [
        {
          text: "Order Replacement Card",
          url: `${this.baseUrl}/cards/new`,
          primary: true
        },
        {
          text: "View Recent Transactions",
          url: `${this.baseUrl}/transactions`,
          primary: false
        }
      ]
    };
  }

  /**
   * Admin account created
   */
  adminAccountCreatedEmail(data: AdminAccountData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Admin Account Created",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>An administrator account has been created for you at ${this.companyName}.</p>
        <p>You can now access the admin dashboard to manage users, transactions, and system settings.</p>
      `,
      CONTENT_SECTIONS: [
        {
          title: "Account Details",
          content: `
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Role:</strong> ${data.role}</p>
            <p><strong>Created By:</strong> ${data.createdBy}</p>
            <p><strong>Created At:</strong> ${data.createdAt}</p>
          `
        },
        ...(data.temporaryPassword ? [{
          title: "🔐 Temporary Password",
          content: `
            <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; font-family: monospace; margin: 10px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">${data.temporaryPassword}</p>
            </div>
            <p style="color: #DC2626; font-weight: 600;">⚠️ You must change this password upon first login!</p>
          `
        }] : [])
      ],
      ALERT_BOX: {
        type: "warning",
        title: "Security Notice",
        content: "Please change your password immediately after your first login and enable two-factor authentication."
      },
      BUTTONS: [{
        text: "Login to Admin Dashboard",
        url: `${this.baseUrl}/admin/login`,
        primary: true
      }]
    };
  }

  /**
   * Account status update (suspended, banned, restricted)
   */
  accountStatusUpdateEmail(data: AccountStatusData): EmailTemplateData {
    const statusConfig = {
      active: {
        title: "Account Reactivated",
        alertType: "success" as const,
        message: "Your account has been reactivated and you now have full access."
      },
      suspended: {
        title: "Account Suspended",
        alertType: "warning" as const,
        message: "Your account has been temporarily suspended."
      },
      banned: {
        title: "Account Terminated",
        alertType: "error" as const,
        message: "Your account has been permanently terminated."
      },
      restricted: {
        title: "Account Restricted",
        alertType: "warning" as const,
        message: "Your account has been restricted. Some features may be unavailable."
      }
    };

    const config = statusConfig[data.status];

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: config.title,
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>${config.message}</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        <p><strong>Effective Date:</strong> ${data.effectiveDate}</p>
      `,
      ALERT_BOX: {
        type: config.alertType,
        title: config.title,
        content: data.status === 'banned' 
          ? "This decision is final. If you believe this is a mistake, you may submit an appeal."
          : data.status === 'suspended' 
          ? "Please contact support if you believe this was done in error."
          : config.message
      },
      BUTTONS: data.appealUrl ? [{
        text: "Submit Appeal",
        url: data.appealUrl,
        primary: true
      }] : [{
        text: "Contact Support",
        url: `${this.baseUrl}/support`,
        primary: true
      }],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Account restored after fraud investigation
   */
  accountRestoredEmail(data: AccountRestoredData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "Account Restored",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>Good news! Your account has been restored and you now have full access to all features.</p>
        <p>We apologize for any inconvenience caused during the investigation.</p>
      `,
      CONTENT_SECTIONS: [{
        title: "Details",
        content: `
          <p><strong>Restored At:</strong> ${data.restoredAt}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
        `
      }],
      ALERT_BOX: {
        type: "success",
        title: "✓ Full Access Restored",
        content: "All restrictions have been lifted. Thank you for your patience and cooperation."
      },
      BUTTONS: [{
        text: "Go to Dashboard",
        url: `${this.baseUrl}/dashboard`,
        primary: true
      }],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Dispute claim notification
   */
  disputeClaimEmail(data: DisputeClaimData): EmailTemplateData {
    const statusConfig = {
      submitted: {
        title: "Dispute Claim Received",
        alertType: "info" as const,
        message: "We have received your dispute claim and will begin reviewing it shortly."
      },
      under_review: {
        title: "Dispute Claim Under Review",
        alertType: "info" as const,
        message: "Your dispute claim is currently being reviewed by our team."
      },
      resolved: {
        title: "Dispute Claim Resolved",
        alertType: "success" as const,
        message: "Your dispute claim has been resolved."
      },
      rejected: {
        title: "Dispute Claim Decision",
        alertType: "warning" as const,
        message: "After careful review, your dispute claim has been denied."
      }
    };

    const config = statusConfig[data.status];

    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: config.title,
      GREETING: `Hello ${data.userName || ""},`,
      MAIN_CONTENT: `<p>${config.message}</p>`,
      LOAN_DETAILS: {
        title: "Claim Details",
        items: [
          { label: "Claim ID", value: data.claimId },
          { label: "Transaction ID", value: data.transactionId },
          { label: "Amount", value: `${data.currency} ${data.amount}` },
          { label: "Claim Type", value: data.claimType },
          { label: "Status", value: data.status.replace('_', ' ').toUpperCase() },
          ...(data.submittedAt ? [{ label: "Submitted At", value: data.submittedAt }] : []),
          ...(data.updatedAt ? [{ label: "Last Updated", value: data.updatedAt }] : [])
        ]
      },
      ALERT_BOX: {
        type: config.alertType,
        title: "Status Update",
        content: config.message
      },
      CONTENT_SECTIONS: data.resolution || data.notes ? [{
        title: data.status === 'resolved' || data.status === 'rejected' ? "Resolution" : "Notes",
        content: data.resolution || data.notes || ''
      }] : undefined,
      BUTTONS: [{
        text: "View Claim Details",
        url: `${this.baseUrl}/disputes/${data.claimId}`,
        primary: true
      }]
    };
  }

  /**
   * Savings goal notification
   */
  savingsGoalEmail(data: SavingsGoalData): EmailTemplateData {
    const isCompleted = data.status === 'completed';
    
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: isCompleted ? "🎉 Savings Goal Achieved!" : "Savings Goal Update",
      GREETING: `Hello ${data.userName || ""},`,
      MAIN_CONTENT: isCompleted 
        ? `<p>Congratulations! You've reached your savings goal "${data.goalName}"!</p>`
        : `<p>Here's an update on your savings goal "${data.goalName}".</p>`,
      ACCOUNT_SUMMARY: {
        label: data.goalName,
        account_number: `${data.progress}% Complete`,
        currency: data.currency,
        balance: `${data.currentAmount} / ${data.targetAmount}`
      },
      KYC_PROGRESS: !isCompleted ? {
        percentage: data.progress,
        status_text: `${data.currency} ${data.currentAmount} of ${data.currency} ${data.targetAmount}`
      } : undefined,
      ALERT_BOX: isCompleted ? {
        type: "success",
        title: "🎉 Goal Achieved!",
        content: "You've successfully reached your savings target. Great job!"
      } : {
        type: "info",
        title: "Keep Going!",
        content: `You're ${data.progress}% of the way to your goal${data.deadline ? `. Deadline: ${data.deadline}` : ''}.`
      },
      BUTTONS: [{
        text: isCompleted ? "View Savings" : "Add More Savings",
        url: `${this.baseUrl}/savings/${data.goalId}`,
        primary: true
      }]
    };
  }

  /**
   * Login alert notification
   */
  loginAlertEmail(data: LoginAlertData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: "New Login to Your Account",
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>We detected a new login to your account. If this was you, no action is needed.</p>
      `,
      CONTENT_SECTIONS: [{
        title: "Login Details",
        content: `
          <p><strong>Time:</strong> ${data.loginAt}</p>
          <p><strong>IP Address:</strong> ${data.ipAddress}</p>
          ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
          ${data.device ? `<p><strong>Device:</strong> ${data.device}</p>` : ''}
          ${data.browser ? `<p><strong>Browser:</strong> ${data.browser}</p>` : ''}
        `
      }],
      ALERT_BOX: {
        type: "warning",
        title: "Wasn't you?",
        content: "If you don't recognize this login, please change your password immediately and enable two-factor authentication."
      },
      BUTTONS: [
        {
          text: "Review Activity",
          url: `${this.baseUrl}/settings/security/sessions`,
          primary: true
        },
        {
          text: "Change Password",
          url: `${this.baseUrl}/settings/security/password`,
          primary: false
        }
      ],
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  /**
   * Generic OTP email
   */
  otpEmail(data: OtpEmailData): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      EMAIL_TITLE: `Your Verification Code - ${data.purpose}`,
      GREETING: `Hello ${data.firstName || ""},`,
      MAIN_CONTENT: `
        <p>You requested a verification code for: <strong>${data.purpose}</strong></p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6B7280;">Your verification code is:</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0B5394;">${data.otpCode}</p>
        </div>
      `,
      ALERT_BOX: {
        type: "info",
        title: "Code Expires Soon",
        content: `This code will expire in ${data.expiresIn}. Do not share this code with anyone.`
      },
      QUICK_TIPS: "If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.",
      UNSUBSCRIBE_LINK: data.userId ? `${this.baseUrl}/unsubscribe?user=${data.userId}` : undefined
    };
  }

  customEmail(emailData: Partial<EmailTemplateData>): EmailTemplateData {
    return {
      ...this.getBaseTemplateData(),
      ...emailData
    };
  }
}

export default EmailContentGenerator;
