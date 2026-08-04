import puppeteer, { PDFOptions } from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================================================================================
// HANDLEBARS HELPERS
// ====================================================================================

handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

handlebars.registerHelper('lookup', function (obj, key) {
  return obj && obj[key] !== undefined ? obj[key] : '';
});

handlebars.registerHelper('substr', function (str, start, len) {
  return (str || '').toString().substr(start, len).toUpperCase();
});

// ====================================================================================
// TEMPLATE CACHE
// ====================================================================================

const templateCache = new Map<string, HandlebarsTemplateDelegate>();

const loadTemplate = (templateName: string): HandlebarsTemplateDelegate => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = path.join(__dirname, 'template', `${templateName}.html`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const compiledTemplate = handlebars.compile(templateContent);

  templateCache.set(templateName, compiledTemplate);
  return compiledTemplate;
};

// ====================================================================================
// DEFAULT BRANDING
// ====================================================================================

const DEFAULT_BRANDING = {
  INSTITUTION_NAME: 'Nordi Remittance',
  TAGLINE: 'Digital Banking & Remittance',
  LOGO_URL: 'https://fhdzjrj.stripocdn.email/content/guids/CABINET_d682b1c5c3e6ca19c2b709cadb8e0af619ba854080ca1e19025c86180c64ecd0/images/top_logoremovebgpreview.png',
  PRIMARY_COLOR: '#0b5394',
  SECONDARY_COLOR: '#1e40af',
  ACCENT_COLOR: '#10b981',
  DANGER_COLOR: '#ef4444'
};

// ====================================================================================
// TYPES
// ====================================================================================

export interface PDFGenerationOptions {
  templateName?: string;
  data?: Record<string, any>;
  branding?: Record<string, any>;
  pdfOptions?: PDFOptions;
}

export interface AccountStatementOptions {
  user: Record<string, any>;
  account: Record<string, any>;
  transactions: any[];
  period: { from: Date; to: Date };
  branding?: Record<string, any>;
}

export interface TransactionReceiptOptions {
  transaction: Record<string, any>;
  user: Record<string, any>;
  branding?: Record<string, any>;
}

export interface LoanDocumentOptions {
  loan: Record<string, any>;
  user: Record<string, any>;
  schedule: any[];
  branding?: Record<string, any>;
}

// ====================================================================================
// PDF GENERATOR
// ====================================================================================

/**
 * Generate a PDF from an HTML template using Puppeteer
 */
export const generatePDFFromTemplate = async (options: PDFGenerationOptions): Promise<Buffer> => {
  const { templateName = 'pdf-base', data = {}, branding = {}, pdfOptions = {} } = options;

  const mergedBranding = { ...DEFAULT_BRANDING, ...branding };
  const referenceId = `NORDI-${Date.now().toString(36).toUpperCase()}`;
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const templateData = {
    ...data,
    ...mergedBranding,
    REFERENCE_ID: data.REFERENCE_ID || referenceId,
    GENERATED_DATE: data.GENERATED_DATE || generatedDate,
    PAGE_NUMBER: '{{page}}',
    TOTAL_PAGES: '{{pages}}'
  };

  const template = loadTemplate(templateName);
  const html = template(templateData);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // v22 format
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0']
    });

    const defaultPdfOptions: PDFOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 0 15mm; display: flex; justify-content: space-between; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <span style="color: #0b5394; font-weight: 600;">Nordi Remittance</span>
          <span>Digital Banking & Remittance</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    };

    const pdfBuffer = await page.pdf({
      ...defaultPdfOptions,
      ...pdfOptions
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// ====================================================================================
// ACCOUNT STATEMENT PDF
// ====================================================================================

export const generateAccountStatement = async (options: AccountStatementOptions): Promise<Buffer> => {
  const { user, account, transactions = [], period, branding = {} } = options;

  const totalIn = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalOut = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0);

  const stats = [
    { label: 'Opening Balance', value: `${account.currency} ${(account.balance - totalIn + totalOut).toFixed(2)}` },
    { label: 'Total Credits', value: `${account.currency} ${totalIn.toFixed(2)}`, class: 'success' },
    { label: 'Total Debits', value: `${account.currency} ${totalOut.toFixed(2)}`, class: 'danger' },
    { label: 'Closing Balance', value: `${account.currency} ${(account.balance || 0).toFixed(2)}`, class: 'primary' },
  ];

  const summary = [
    { label: 'Account Name', value: user.fullName || user.email },
    { label: 'Account Type', value: (account.type || 'Personal').toUpperCase() },
    { label: 'Account Number', value: account.accountNumber || '—' },
    { label: 'Statement Period', value: `${period.from.toLocaleDateString('en-GB')} – ${period.to.toLocaleDateString('en-GB')}` },
    { label: 'Currency', value: account.currency || 'USD' },
    { label: 'Status', value: account.status || 'Active', class: account.status === 'active' ? 'success' : 'warning' },
  ];

  const tableData = transactions.slice(0, 500).map(t => ({
    date: new Date(t.createdAt).toLocaleDateString('en-GB'),
    reference: t.reference || t._id?.toString().slice(-8),
    description: t.description || t.type,
    type: t.type?.toUpperCase(),
    amount: `${t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}`,
    balance: `${t.runningBalance ? t.runningBalance.toFixed(2) : '—'}`
  }));

  const tableColumns = [
    { header: 'Date', key: 'date' },
    { header: 'Reference', key: 'reference' },
    { header: 'Description', key: 'description' },
    { header: 'Type', key: 'type' },
    { header: 'Amount', key: 'amount' },
    { header: 'Balance', key: 'balance' },
  ];

  return generatePDFFromTemplate({
    templateName: 'pdf-base',
    data: {
      DOCUMENT_TITLE: 'Account Statement',
      DOCUMENT_SUBTITLE: `For the period ending ${period.to.toLocaleDateString('en-GB')}`,
      SUMMARY: summary,
      SUMMARY_TITLE: 'Account Information',
      STATS: stats,
      TABLE_TITLE: 'Transaction History',
      TABLE_COLUMNS: tableColumns,
      TABLE_DATA: tableData,
      DOC_STATUS: 'Official Statement',
    },
    branding,
  });
};

// ====================================================================================
// TRANSACTION RECEIPT PDF
// ====================================================================================

export const generateTransactionReceipt = async (options: TransactionReceiptOptions): Promise<Buffer> => {
  const { transaction, user, branding = {} } = options;

  const summary = [
    { label: 'Transaction ID', value: transaction.reference || transaction._id?.toString() },
    { label: 'Date & Time', value: new Date(transaction.createdAt).toLocaleString('en-GB') },
    { label: 'Customer Name', value: user.fullName || user.email },
    { label: 'Account Number', value: transaction.accountNumber || '—' },
    { label: 'Type', value: (transaction.type || 'Transfer').toUpperCase() },
    { label: 'Amount', value: `${transaction.currency || 'USD'} ${(transaction.amount || 0).toFixed(2)}`, class: 'primary' },
  ];

  const infoBox = transaction.status === 'successful' || transaction.status === 'completed'
    ? { type: 'success', title: 'Transaction Successful', content: `This transaction has been successfully processed and verified.` }
    : { type: 'warning', title: `Transaction ${transaction.status}`, content: `This transaction is currently marked as ${transaction.status}.` };

  return generatePDFFromTemplate({
    templateName: 'pdf-base',
    data: {
      DOCUMENT_TITLE: 'Transaction Receipt',
      DOCUMENT_SUBTITLE: 'Electronic Transaction Record',
      REFERENCE_ID: transaction.reference,
      SUMMARY: summary,
      SUMMARY_TITLE: 'Transaction Details',
      INFO_BOX: infoBox,
      DOC_STATUS: transaction.status === 'successful' ? 'Verified' : 'Pending',
      SHOW_SIGNATURE: true,
      SIGNER1_NAME: 'Nordi Remittance',
      SIGNER1_TITLE: 'Digital Authorisation',
      SIGNER2_NAME: user.fullName || 'Customer',
      SIGNER2_TITLE: 'Account Holder',
    },
    branding,
  });
};

// ====================================================================================
// LOAN DOCUMENT PDF
// ====================================================================================

export const generateLoanDocument = async (options: LoanDocumentOptions): Promise<Buffer> => {
  const { loan, user, schedule = [], branding = {} } = options;

  const summary = [
    { label: 'Loan Reference', value: loan.reference || loan._id?.toString().slice(-8) },
    { label: 'Borrower Name', value: user.fullName || user.email },
    { label: 'Loan Amount', value: `${loan.currency || 'USD'} ${(loan.amount || 0).toFixed(2)}`, class: 'primary' },
    { label: 'Interest Rate', value: `${loan.interestRate || 0}%` },
    { label: 'Tenure', value: `${loan.tenure || 0} Months` },
    { label: 'Status', value: (loan.status || 'Active').toUpperCase(), class: loan.status === 'active' ? 'success' : 'warning' },
  ];

  const tableData = schedule.map(s => ({
    installment: s.installmentNumber,
    dueDate: new Date(s.dueDate).toLocaleDateString('en-GB'),
    principal: `${loan.currency || 'USD'} ${s.principal.toFixed(2)}`,
    interest: `${loan.currency || 'USD'} ${s.interest.toFixed(2)}`,
    total: `${loan.currency || 'USD'} ${s.total.toFixed(2)}`,
    status: s.status?.toUpperCase() || 'PENDING'
  }));

  const tableColumns = [
    { header: 'No.', key: 'installment' },
    { header: 'Due Date', key: 'dueDate' },
    { header: 'Principal', key: 'principal' },
    { header: 'Interest', key: 'interest' },
    { header: 'Total Payment', key: 'total' },
    { header: 'Status', key: 'status' },
  ];

  return generatePDFFromTemplate({
    templateName: 'pdf-base',
    data: {
      DOCUMENT_TITLE: 'Loan Agreement & Schedule',
      DOCUMENT_SUBTITLE: 'Repayment Schedule and Terms',
      REFERENCE_ID: loan.reference,
      SUMMARY: summary,
      SUMMARY_TITLE: 'Loan Details',
      TABLE_TITLE: 'Repayment Schedule',
      TABLE_COLUMNS: tableColumns,
      TABLE_DATA: tableData,
      DOC_STATUS: 'Official Document',
      SHOW_SIGNATURE: true,
      SIGNER1_NAME: 'Nordi Remittance',
      SIGNER1_TITLE: 'Lending Operations',
      SIGNER2_NAME: user.fullName || 'Borrower',
      SIGNER2_TITLE: 'Acknowledged',
    },
    branding,
  });
};

export default {
  generatePDFFromTemplate,
  generateAccountStatement,
  generateTransactionReceipt,
  generateLoanDocument
};
