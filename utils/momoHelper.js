import axios from "axios";
import { momoConfig, getMomoToken } from "../config/momo.js";
import { v4 as uuidv4 } from "uuid";

const requestToPay = async (amount, phoneNumber, userId, description) => {
  const token = await getMomoToken();
  const referenceId = uuidv4();

  try {
    const response = await axios.post(
      `${momoConfig.baseUrl}${momoConfig.collectionUrl}`,
      {
        amount,
        currency: "RWF",
        externalId: userId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phoneNumber,
        },
        payerMessage: description,
        payeeNote: "Film Nyarwanda Payment",
      },
      {
        headers: {
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": momoConfig.subscriptionKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, referenceId, data: response.data };
  } catch (error) {
    console.error("❌ MoMo Payment Error:", error.response?.data || error);
    return { success: false, error: error.response?.data || error };
  }
};

export default requestToPay;
