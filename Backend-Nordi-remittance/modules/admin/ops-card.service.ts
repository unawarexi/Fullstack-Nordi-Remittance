import mongoose from 'mongoose';
import Users from '../users/users.model.js';
import { Wallets } from '../accounts/accounts.model.js';
import { Cards, CardApplications } from '../cards/cards.model.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../../core/errors/AppError.js';
import { queueTemplatedMail } from '../../services/workers.js';
import { validateUserEligibility } from '../../core/guards/user-eligibility.guard.js';
import {
  hasPermission,
  logAdminAction,
  notifyUser,
  generateCardNumber,
  generateCVV
} from './ops.helpers.js';

export class OpsCardService {
  /**
   * Approve a card application
   */
  static async approveCard(currentUserId: string, cardId: string, data: any, ip: string, userAgent: string) {
    const canManage = await hasPermission(currentUserId, 'canManageCards');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to approve cards');
    }

    const id = cardId;
    const { creditLimit, notes } = data;

    const query: any = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { applicationId: id }] }
      : { applicationId: id };
    const application = await CardApplications.findOne(query);

    if (!application) {
      const cardQuery: any = mongoose.isValidObjectId(id)
        ? { $or: [{ _id: id }, { cardId: id }] }
        : { cardId: id };
      const existingCard = await Cards.findOne(cardQuery);
      if (!existingCard) throw new NotFoundError('Card application or card not found');
      
      existingCard.status = 'active';
      await existingCard.save();
      
      return { card: existingCard, status: 'active', isDirectActivation: true };
    }

    await validateUserEligibility(String(application.user), 'card approval');

    if (application.status !== 'pending' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot approve card with status: ${application.status}`);
    }

    application.status = 'approved';
    application.approvedBy = currentUserId as any;
    application.approvedAt = new Date();
    application.reviewNotes = notes;
    await application.save();

    const wallet = await Wallets.findOne({ user: application.user });
    if (!wallet) throw new NotFoundError('User wallet not found');

    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryMonth = new Date().getMonth() + 1;
    const expiryYear = new Date().getFullYear() + 4;

    const card = new Cards({
      user: application.user,
      wallet: wallet._id,
      cardNumber: cardNumber,
      cardholderName: 'Card Holder',
      cardType: application.cardType,
      cardBrand: 'visa',
      expiryMonth,
      expiryYear,
      cvv,
      status: 'pending_activation',
      isPhysical: !application.isVirtual,
      creditLimit: application.cardType === 'credit' ? creditLimit || application.requestedLimit || 5000 : undefined,
      availableCredit: application.cardType === 'credit' ? creditLimit || application.requestedLimit || 5000 : undefined,
      billingAddress: application.billingAddress,
      currency: application.currency || 'USD',
    });

    await card.save();

    const user = await Users.findById(application.user);
    if (user && user.firstName && user.lastName) {
      card.cardholderName = `${user.firstName} ${user.lastName}`.toUpperCase();
      await card.save();
    }

    await logAdminAction(
      currentUserId,
      'APPROVE_CARD',
      'card',
      (card._id as any).toString(),
      { applicationId: application._id, cardType: card.cardType, creditLimit: card.creditLimit },
      ip,
      userAgent,
      'success',
    );

    if (user) {
      await notifyUser(
        (user._id as any).toString(),
        'Card Approved!',
        `Your ${card.cardType} card application has been approved! Card ending in ${cardNumber.slice(-4)}`,
        'card',
        { cardId: card._id }
      );

      try {
        await queueTemplatedMail(String(user.email), {
          EMAIL_TITLE: 'Card Application Approved',
          GREETING: `Hello ${user.firstName},`,
          MAIN_CONTENT: `
            <p>Your <strong>${card.cardType}</strong> card application has been approved!</p>
            <p><strong>Card Details:</strong></p>
            <ul>
              <li>Card Type: ${card.cardType}</li>
              <li>Card Number: **** **** **** ${cardNumber.slice(-4)}</li>
              <li>Expiry: ${String(expiryMonth).padStart(2, '0')}/${expiryYear}</li>
              ${card.creditLimit ? `<li>Credit Limit: ${application.currency || 'USD'} ${card.creditLimit.toFixed(2)}</li>` : ''}
            </ul>
            <p>Your card will need to be activated before use.</p>
          `,
          COMPANY_NAME: 'Nordea Remittance',
          YEAR: new Date().getFullYear(),
          FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
        } as any);
      } catch (emailError) {
        console.error('Failed to send card approval email:', emailError);
      }
    }

    return {
      card: {
        id: card._id,
        cardNumberMasked: `**** **** **** ${cardNumber.slice(-4)}`,
        cardType: card.cardType,
        status: card.status,
        creditLimit: card.creditLimit,
        expiryMonth,
        expiryYear,
      },
      isDirectActivation: false
    };
  }

  /**
   * Reject a card application
   */
  static async rejectCard(currentUserId: string, cardId: string, data: any, ip: string, userAgent: string) {
    const canManage = await hasPermission(currentUserId, 'canManageCards');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to reject cards');
    }

    const id = cardId;
    const { reason, notes } = data;

    const query: any = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { applicationId: id }] }
      : { applicationId: id };
    const application = await CardApplications.findOne(query);

    if (!application) {
      const cardQuery: any = mongoose.isValidObjectId(id)
        ? { $or: [{ _id: id }, { cardId: id }] }
        : { cardId: id };
      const existingCard = await Cards.findOne(cardQuery);
      if (!existingCard) throw new NotFoundError('Card application or card not found');
      
      existingCard.status = 'blocked';
      existingCard.blockedReason = reason || 'Rejected by Admin';
      existingCard.blockedAt = new Date();
      await existingCard.save();
      
      return { card: existingCard, status: 'blocked', isDirectBlock: true };
    }

    if (application.status !== 'pending' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot reject card with status: ${application.status}`);
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewNotes = notes;
    application.reviewedBy = currentUserId as any;
    application.reviewedAt = new Date();
    await application.save();

    const user = await Users.findById(application.user);

    await logAdminAction(
      currentUserId,
      'REJECT_CARD',
      'card_application',
      (application._id as any).toString(),
      { reason, notes },
      ip,
      userAgent,
      'success',
    );

    if (user) {
      await notifyUser(
        (user._id as any).toString(),
        'Card Application Update',
        `Your card application has been reviewed. Unfortunately, we cannot approve it at this time.`,
        'card',
        { applicationId: application._id }
      );
    }

    return {
      application: {
        id: application._id,
        status: application.status,
        rejectionReason: reason,
      },
      isDirectBlock: false
    };
  }
}
