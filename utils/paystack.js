import fetch from "node-fetch";

export const initializePaystackTransaction = async ({
  amount,
  email,
  callback_url,
}) => {
  const paystackUrl = `https://api.paystack.co/transaction/initialize`;

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const body = {
    email,
    amount: amount * 100, // Paystack expects the amount in should be in the subunit of the currency i.e 1 GHS = 100 pesewas
    currency: "GHS",
    callback_url,
  };

  try {
    const response = await fetch(paystackUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Paystack transaction initialization failed");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    throw new Error(error.message);
  }
};
