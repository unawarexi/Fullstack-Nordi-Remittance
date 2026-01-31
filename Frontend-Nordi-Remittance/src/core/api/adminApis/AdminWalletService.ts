/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const baseURL = "http://localhost:3000/api/admin/wallets";

// List wallets with optional query params (including user)
export const listWallets = (params?: any) =>
  axios.get(baseURL, { params });

// Get a single wallet by ID
export const getWallet = (id: string) =>
  axios.get(`${baseURL}/${id}`);

// Create a new wallet
export const createWallet = (data: any) =>
  axios.post(baseURL, data);

// Update a wallet
export const updateWallet = (id: string, data: any) =>
  axios.put(`${baseURL}/${id}`, data);

// Delete a wallet
export const deleteWallet = (id: string) =>
  axios.delete(`${baseURL}/${id}`);

// Set wallet status
export const setWalletStatus = (id: string, data: any) =>
  axios.patch(`${baseURL}/${id}/status`, data);

// Set wallet limits
export const setWalletLimits = (id: string, data: any) =>
  axios.patch(`${baseURL}/${id}/limits`, data);

// Freeze or unfreeze wallet
export const freezeWallet = (id: string, data: any) =>
  axios.patch(`${baseURL}/${id}/freeze`, data);

// Get aggregated wallet stats
export const getWalletStats = () =>
  axios.get(`${baseURL}/stats/aggregate`);

// Add funds to a wallet
export const addFunds = (id: string, data: any) =>
  axios.post(`${baseURL}/${id}/add-funds`, data);

// Withdraw funds from a wallet
export const withdrawFunds = (id: string, data: any) =>
  axios.post(`${baseURL}/${id}/withdraw-funds`, data);