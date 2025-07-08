import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectCurrentOrder } from "../features/order/orderSlice";
import { useNavigate } from "react-router-dom";
import "../Stripe.css";

export default function RazorpayCheckout() {
  const currentOrder = useSelector(selectCurrentOrder);
  const navigate = useNavigate();

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    try {
      // Step 1: Create order on backend
      const { data } = await axios.post("/payment/create-order", {
        amount: currentOrder.totalAmount,
        orderId: currentOrder.id,
      });

      // Step 2: Configure Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // from .env
        amount: data.order.amount,
        currency: "INR",
        name: "My MERN Store",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async (response) => {
          // Step 3: Verify payment on backend
          const verifyRes = await axios.post("/payment/verify-payment", {
            ...response,
            orderId: currentOrder.id,
          });

          if (verifyRes.data.success) {
            alert("Payment Successful!");
            navigate(`/order-success/${currentOrder.id}`);
          } else {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Failed to initiate payment.");
    }
  };

  return (
    <div className="Stripe">
      <button onClick={handleRazorpayPayment} className="pay-now-button">
        Pay Now ₹{currentOrder.totalAmount}
      </button>
    </div>
  );
}

