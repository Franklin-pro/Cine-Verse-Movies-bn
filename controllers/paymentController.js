import stripe from "../config/stripe.js";
import requestToPay from "../utils/momoHelper.js";
import Payment from "../models/Payment.model.js";

// 💵 MoMo payment
export const payWithMoMo = async (req, res) => {
  const { amount, phoneNumber, userId, description } = req.body;

  try {
    const payment = await requestToPay(amount, phoneNumber, userId, description);
    if (payment.success) {
      const newPayment = new Payment({
        amount,
        currency: "RWF",
        paymentMethod: "MoMo",
        paymentStatus: "pending",
        paymentDate: new Date(),
        userId,
        movieId: req.params.id,
      });
      await newPayment.save();
      res.status(200).json({ message: "MoMo payment initiated", payment });
    } else {
      res.status(400).json({ message: "MoMo payment failed", error: payment.error });
    }
  } catch (error) {
    res.status(500).json({ message: "MoMo Payment Error", error: error.message });
  }
};

// 💳 Stripe payment
export const payWithStripe = async (req, res) => {
  const { amount, email } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: "rwf",
      receipt_email:email,
      description: "Film Nyarwanda Movie Purchase",
    });

    const newPayment = new Payment({
      amount,
      currency: "RWF",
      paymentMethod: "Stripe",
      paymentStatus: "pending",
      paymentDate: new Date(),
      userId,
      movieId: req.params.id,
    });
    await newPayment.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      message: "Stripe payment created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Stripe Payment Error", error: error.message });
  }
};
