// @ts-nocheck
import mongoose from "mongoose";
import { Wallets } from "./accounts.model.js";
import { Cards } from "../cards/cards.model.js";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/AppError.js";

export class CardWalletLinkService {
  /**
   * Link a card to an additional wallet (user-initiated)
   */
  static async linkCardToWallet(cardId: string, walletId: string, userId: string) {
    const card = await Cards.findOne({ cardId, user: userId });
    if (!card) throw new NotFoundError("Card not found");

    const wallet = await Wallets.findOne({ _id: walletId, user: userId, isDeleted: false });
    if (!wallet) throw new NotFoundError("Wallet not found");

    if (wallet.status !== "active") {
      throw new ValidationError("Cannot link card to an inactive wallet");
    }

    // Check if already linked
    const alreadyLinked = card.linkedWallets?.some(
      (lw: any) => lw.wallet?.toString() === walletId && lw.isActive
    );
    if (alreadyLinked || card.wallet?.toString() === walletId) {
      throw new ValidationError("Card is already linked to this wallet");
    }

    // Add to card's linkedWallets
    card.linkedWallets = card.linkedWallets || [];
    card.linkedWallets.push({
      wallet: new mongoose.Types.ObjectId(walletId),
      addedAt: new Date(),
      addedBy: userId,
      isActive: true,
    });
    card.updatedAt = new Date();
    await card.save();

    // Add to wallet's linkedCards
    if (!wallet.linkedCards?.includes(card._id as any)) {
      wallet.linkedCards = wallet.linkedCards || [];
      wallet.linkedCards.push(card._id as any);
      wallet.updatedAt = new Date();
      await wallet.save();
    }

    return { card, linkedWallet: wallet };
  }

  /**
   * Unlink a card from a wallet (user-initiated)
   */
  static async unlinkCardFromWallet(cardId: string, walletId: string, userId: string) {
    const card = await Cards.findOne({ cardId, user: userId });
    if (!card) throw new NotFoundError("Card not found");

    // Cannot unlink the primary wallet
    if (card.wallet?.toString() === walletId) {
      throw new ForbiddenError("Cannot unlink the primary wallet from a card. Change the primary wallet first.");
    }

    // Check the card is actually linked
    const linkIndex = card.linkedWallets?.findIndex(
      (lw: any) => lw.wallet?.toString() === walletId && lw.isActive
    );
    if (linkIndex === undefined || linkIndex === -1) {
      throw new ValidationError("Card is not linked to this wallet");
    }

    // If this wallet is the current funding source, switch to primary
    if (card.fundingSource?.toString() === walletId) {
      card.fundingSource = card.wallet;
    }

    // Deactivate the link (soft unlink for audit trail)
    (card.linkedWallets as any)[linkIndex].isActive = false;
    card.updatedAt = new Date();
    await card.save();

    // Remove from wallet's linkedCards
    const wallet = await Wallets.findById(walletId);
    if (wallet) {
      wallet.linkedCards = (wallet.linkedCards || []).filter(
        (cId: any) => cId.toString() !== (card._id as any).toString()
      );
      wallet.updatedAt = new Date();
      await wallet.save();
    }

    return { message: "Card unlinked from wallet successfully" };
  }

  /**
   * Set which wallet funds a card (user-initiated)
   */
  static async setCardFundingSource(cardId: string, walletId: string, userId: string) {
    const card = await Cards.findOne({ cardId, user: userId });
    if (!card) throw new NotFoundError("Card not found");

    const wallet = await Wallets.findOne({ _id: walletId, user: userId, isDeleted: false, status: "active" });
    if (!wallet) throw new NotFoundError("Wallet not found or not active");

    // Must be either primary or an active linked wallet
    const isPrimary = card.wallet?.toString() === walletId;
    const isLinked = card.linkedWallets?.some(
      (lw: any) => lw.wallet?.toString() === walletId && lw.isActive
    );

    if (!isPrimary && !isLinked) {
      throw new ValidationError("Wallet must be linked to the card before it can be set as funding source");
    }

    card.fundingSource = new mongoose.Types.ObjectId(walletId);
    card.updatedAt = new Date();
    await card.save();

    return { card, fundingSource: wallet };
  }

  /**
   * Admin: Fund a card's balance from any of the user's wallets
   */
  static async adminFundCardFromWallet(
    cardId: string,
    walletId: string,
    amount: number,
    adminId: string,
    currency: string = "USD"
  ) {
    if (!amount || amount <= 0) {
      throw new ValidationError("Amount must be greater than zero");
    }

    const card = await Cards.findOne({ cardId });
    if (!card) throw new NotFoundError("Card not found");

    const wallet = await Wallets.findOne({ _id: walletId, user: card.user, isDeleted: false });
    if (!wallet) throw new NotFoundError("Wallet not found for this user");

    if (wallet.status !== "active") {
      throw new ForbiddenError("Cannot fund from an inactive wallet");
    }

    // Check balance
    const currentBalance = wallet.balances?.get(currency) || 0;
    if (currentBalance < amount) {
      throw new ValidationError(`Insufficient balance in wallet. Available: ${currency} ${currentBalance.toFixed(2)}`);
    }

    // Debit wallet
    wallet.balances?.set(currency, currentBalance - amount);
    wallet.updatedAt = new Date();
    await wallet.save();

    // Credit card
    card.balance = (card.balance || 0) + amount;
    card.updatedAt = new Date();
    await card.save();

    return {
      card: { cardId: card.cardId, newBalance: card.balance },
      wallet: { walletId: wallet._id, newBalance: wallet.balances?.get(currency) },
      amount,
      currency,
      fundedBy: adminId,
    };
  }
}

export default CardWalletLinkService;
