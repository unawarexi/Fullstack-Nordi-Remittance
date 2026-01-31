
import axios from 'axios';

const PLAID_CLIENT_ID = 'your_client_id';
const PLAID_SECRET = 'your_secret';
const PLAID_ENV = 'sandbox'; // Use 'development' or 'production' for respective environments

const plaidUrl = `https://${PLAID_ENV}.plaid.com/institutions/get`;

export const fetchBanks = async () => {
  try {
    const response = await axios.post(plaidUrl, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      country_codes: ['US', 'GB', 'ES', 'FR', 'DE'],
      options: {
        include_optional_metadata: true,
      },
    });
    return response.data.institutions;
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
};
