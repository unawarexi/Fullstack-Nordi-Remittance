import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import type {
  EmailTemplateData,
  TransactionDetail,
  AccountSummary,
  StatusBadge,
  AlertBox,
  KycProgress,
  LoanDetails,
  ContentSection,
  SecurityAlert,
  EmailButton,
  MiniTransaction,
  Feature,
  PortfolioSummary,
  Attachment,
  TicketInfo
} from '../../types/Mail.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_PATH = path.join(__dirname, "template", "Template.html");

// Safe replacement helper
function safeReplace(template: string, pattern: RegExp, replacement: string): string {
  return template.replace(pattern, () => replacement);
}

// Render conditional blocks
function renderConditionalBlock<T>(
  template: string, 
  blockName: string, 
  data: T | null | undefined, 
  renderFn: (data: T) => string
): string {
  const pattern = new RegExp(`{{#if ${blockName}}}([\\s\\S]*?){{/if}}`, 'gi');
  
  if (data !== null && data !== undefined) {
    // If data exists, render the content
    const rendered = renderFn(data);
    return safeReplace(template, pattern, rendered);
  } else {
    // If no data, remove the entire block
    return template.replace(pattern, '');
  }
}

// Render each loops
function renderEachLoop(template: string, loopName: string, items: any[], renderFn: (item: any, index: number) => string): string {
  const pattern = new RegExp(`{{#each ${loopName}}}([\\s\\S]*?){{/each}}`, 'gi');
  
  if (Array.isArray(items) && items.length > 0) {
    const rendered = items.map((item, index) => renderFn(item, index)).join('');
    return safeReplace(template, pattern, rendered);
  } else {
    return template.replace(pattern, '');
  }
}

// Individual section renderers
function renderTransactionDetails(details: TransactionDetail[]): string {
  if (!Array.isArray(details) || details.length === 0) return '';
  
  const rows = details.map(d => `
    <div class="transaction-row">
      <span class="transaction-label">${d.label}</span>
      <span class="transaction-value">${d.value}</span>
    </div>
  `).join('');
  
  return `
    <div class="transaction-card">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0B5394;">Transaction Details</h3>
      ${rows}
    </div>
  `;
}

function renderAccountSummary(summary: AccountSummary): string {
  return `
    <div class="account-summary">
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">${summary.label || 'Account Balance'}</p>
      <div class="balance-amount">${summary.currency} ${summary.balance}</div>
      <p style="margin: 0; font-size: 12px; opacity: 0.8;">${summary.account_number || ''}</p>
    </div>
  `;
}

function renderStatusBadge(status: StatusBadge): string {
  return `<span class="status-badge status-${status.type}">${status.text}</span>`;
}

function renderAlertBox(alert: AlertBox): string {
  return `
    <div class="alert-box alert-${alert.type}">
      ${alert.title ? `<h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${alert.title}</h4>` : ''}
      <div>${alert.content}</div>
    </div>
  `;
}

function renderKycProgress(progress: KycProgress): string {
  return `
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">KYC Verification Progress</p>
    <div class="kyc-progress">
      <div class="kyc-progress-bar" style="width: ${progress.percentage}%;"></div>
    </div>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #6B7280;">${progress.status_text}</p>
  `;
}

function renderLoanDetails(loanDetails: LoanDetails): string {
  const rows = loanDetails.items.map(item => `
    <div class="transaction-row">
      <span class="transaction-label">${item.label}</span>
      <span class="transaction-value">${item.value}</span>
    </div>
  `).join('');
  
  return `
    <div class="mini-statement">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0B5394;">${loanDetails.title}</h3>
      ${rows}
    </div>
  `;
}

function renderContentSections(sections: ContentSection[]): string {
  return sections.map(section => `
    <tr>
      <td align="left" style="padding: 10px 0;">
        ${section.title ? `<h3 style="margin: 0 0 12px 0; font-size: 18px; color: #0B5394; font-weight: 600;">${section.title}</h3>` : ''}
        <div style="color: #475569; font-size: 14px; line-height: 21px;">
          ${section.content}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderSecurityAlert(alert: SecurityAlert): string {
  const detailsHtml = alert.details ? alert.details.map(d => 
    `<p style="margin: 4px 0; font-size: 13px;"><strong>${d.label}:</strong> ${d.value}</p>`
  ).join('') : '';
  
  return `
    <div class="alert-box alert-error">
      <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #DC2626;">🔒 Security Alert</h4>
      <div>${alert.message}</div>
      ${alert.details ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">${detailsHtml}</div>` : ''}
    </div>
  `;
}

function renderButtons(buttons: EmailButton[]): string {
  return `
    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px;">
      <tr>
        ${buttons.map(btn => `
          <td align="center" style="padding: 0 5px;">
            <a href="${btn.url}" target="_blank" style="mso-line-height-rule: exactly; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: inline-block; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 600; ${btn.primary ? 'background-color: #0B5394; color: #ffffff;' : 'background-color: #F3F4F6; color: #374151;'}">
              ${btn.text}
            </a>
          </td>
        `).join('')}
      </tr>
    </table>
  `;
}

function renderMiniTransactions(transactions: MiniTransaction[]): string {
  const txHtml = transactions.map(tx => `
    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
      <div>
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">${tx.description}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">${tx.date}</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${tx.isCredit ? '#059669' : '#DC2626'};">
          ${tx.isCredit ? '+' : '-'}${tx.amount}
        </p>
        <span class="status-badge status-${tx.status}">${tx.statusText}</span>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="mini-statement">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0B5394;">Recent Transactions</h3>
      ${txHtml}
    </div>
  `;
}

function renderFeatures(features: Feature[]): string {
  const featureHtml = features.map(f => `
    <div class="feature-item">
      <div class="feature-icon">${f.icon}</div>
      <h4 style="margin: 8px 0; font-size: 14px; font-weight: 600; color: #374151;">${f.title}</h4>
      <p style="margin: 0; font-size: 12px; color: #6B7280;">${f.description}</p>
    </div>
  `).join('');
  
  return `
    <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0B5394; text-align: center;">Platform Features</h3>
    <div class="feature-grid">
      ${featureHtml}
    </div>
  `;
}

function renderPortfolioSummary(portfolio: PortfolioSummary): string {
  return `
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px;">Investment Portfolio</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">Total Value</p>
          <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold;">${portfolio.total_value}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">Returns</p>
          <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; color: ${portfolio.returns_positive ? '#D1FAE5' : '#FEE2E2'};">
            ${portfolio.returns}
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderAttachments(attachments: Attachment[]): string {
  const attachHtml = attachments.map(a => `
    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center;">
      <span style="font-size: 24px; margin-right: 12px;">📄</span>
      <div style="flex: 1;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">${a.name}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">${a.size}</p>
      </div>
      <a href="${a.url}" style="color: #0B5394; font-size: 12px; font-weight: 600; text-decoration: none;">Download</a>
    </div>
  `).join('');
  
  return `
    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #0B5394;">Attached Documents</h3>
    ${attachHtml}
  `;
}

function renderTicketInfo(ticket: TicketInfo): string {
  return `
    <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1E40AF;">Support Ticket #${ticket.ticket_id}</h3>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>Status:</strong> ${ticket.status}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>Priority:</strong> ${ticket.priority}</p>
      <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Assigned to:</strong> ${ticket.assigned_to}</p>
    </div>
  `;
}

function renderQuickTips(tips: string): string {
  return `
    <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 6px;">
      <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #92400E;">💡 Quick Tip</h4>
      <p style="margin: 0; font-size: 13px; color: #78350F;">${tips}</p>
    </div>
  `;
}

// Read and cache template
let cachedTemplate: string | null = null;
function getTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  cachedTemplate = fs.readFileSync(TEMPLATE_PATH, "utf8");
  return cachedTemplate;
}

// Main render function
export function render(templateData: EmailTemplateData = {} as EmailTemplateData): string {
  let html = getTemplate();

  // Replace simple placeholders
  const simpleReplacements: Array<keyof EmailTemplateData> = [
    'EMAIL_TITLE', 'GREETING', 'MAIN_CONTENT', 'ADDITIONAL_CONTENT',
    'HERO_IMAGE', 'FOOTER_IMAGE', 'FOOTER_TEXT',
    'COMPANY_NAME', 'YEAR',
    'SOCIAL_FACEBOOK', 'SOCIAL_TWITTER', 'SOCIAL_YOUTUBE', 'SOCIAL_LINKEDIN',
    'LINK_LOGIN', 'LINK_TRANSACTIONS', 'LINK_SERVICES', 'LINK_SUPPORT',
    'LINK_WEBSITE', 'LINK_PRIVACY', 'LINK_TERMS', 'UNSUBSCRIBE_LINK'
  ];

  simpleReplacements.forEach(key => {
    const pattern = new RegExp(`{{${String(key)}}}`, 'g');
    const value = templateData[key];
    html = html.replace(pattern, value ? String(value) : '');
  });

  // Render conditional blocks
  html = renderConditionalBlock(html, 'HERO_IMAGE', templateData.HERO_IMAGE, 
    (data) => `<tr><td align="center" style="padding: 0; margin: 0; padding: 10px 0; font-size: 0px;"><img src="${data}" alt="" style="display: block; font-size: 14px; border: 0; outline: none; text-decoration: none;" width="560" class="adapt-img" /></td></tr>`
  );

  html = renderConditionalBlock(html, 'ACCOUNT_SUMMARY', templateData.ACCOUNT_SUMMARY,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderAccountSummary(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'TRANSACTION_DETAILS', templateData.TRANSACTION_DETAILS,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderTransactionDetails(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'STATUS', templateData.STATUS,
    (data) => `<tr><td align="center" style="padding: 10px 0;">${renderStatusBadge(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'ALERT_BOX', templateData.ALERT_BOX,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderAlertBox(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'KYC_PROGRESS', templateData.KYC_PROGRESS,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderKycProgress(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'LOAN_DETAILS', templateData.LOAN_DETAILS,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderLoanDetails(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'SECURITY_ALERT', templateData.SECURITY_ALERT,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderSecurityAlert(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'BUTTONS', templateData.BUTTONS,
    (data) => `<tr><td align="center" style="padding: 20px 0;">${renderButtons(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'MINI_TRANSACTIONS', templateData.MINI_TRANSACTIONS,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderMiniTransactions(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'FEATURES', templateData.FEATURES,
    (data) => `<tr><td align="left" style="padding: 20px 0;">${renderFeatures(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'PORTFOLIO_SUMMARY', templateData.PORTFOLIO_SUMMARY,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderPortfolioSummary(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'ATTACHMENTS', templateData.ATTACHMENTS,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderAttachments(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'TICKET_INFO', templateData.TICKET_INFO,
    (data) => `<tr><td align="left" style="padding: 10px 0;">${renderTicketInfo(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'QUICK_TIPS', templateData.QUICK_TIPS,
    (data) => `<tr><td align="left" style="padding: 20px 0;">${renderQuickTips(data)}</td></tr>`
  );

  html = renderConditionalBlock(html, 'FOOTER_IMAGE', templateData.FOOTER_IMAGE,
    (data) => `<tr><td align="left" style="padding: 0 20px 10px 20px;"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px;"><tr><td align="center" valign="top" style="padding: 0; margin: 0; width: 560px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: separate; border-spacing: 0px; border-radius: 5px;" role="presentation"><tr><td align="center" style="padding: 0; margin: 0; font-size: 0"><img src="${data}" alt="" width="560" class="adapt-img" style="display: block; font-size: 14px; border: 0; outline: none; text-decoration: none;" /></td></tr></table></td></tr></table></td></tr>`
  );

  // Handle CONTENT_SECTIONS (each loop)
  if (templateData.CONTENT_SECTIONS && Array.isArray(templateData.CONTENT_SECTIONS)) {
    html = renderConditionalBlock(html, 'CONTENT_SECTIONS', templateData.CONTENT_SECTIONS,
      (data) => renderContentSections(data)
    );
  }

  // Clean up any remaining handlebars syntax
  html = html.replace(/{{#if\s+[^}]*}}[\s\S]*?{{\/if}}/gi, '');
  html = html.replace(/{{#each\s+[^}]*}}[\s\S]*?{{\/each}}/gi, '');
  html = html.replace(/{{#unless\s+[^}]*}}[\s\S]*?{{\/unless}}/gi, '');
  html = html.replace(/{{#with\s+[^}]*}}[\s\S]*?{{\/with}}/gi, '');
  html = html.replace(/{{\/[^}]+}}/gi, '');
  html = html.replace(/{{#[^}]+}}/gi, '');
  html = html.replace(/{{[^#\/][^}]*}}/g, '');
  html = html.replace(/{{{[^}]*}}}/g, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');

  return html;
}
