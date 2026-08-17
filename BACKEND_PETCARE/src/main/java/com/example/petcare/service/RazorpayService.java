package com.example.petcare.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public com.razorpay.Order createRazorpayOrder(int amount)
            throws RazorpayException {

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", amount * 100); // paise
        options.put("currency", "INR");
        options.put("receipt", "rcpt_" + System.currentTimeMillis());

        // ✅ EXPLICIT Razorpay Order
        return client.orders.create(options);
    }

    public boolean verifySignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) throws RazorpayException {

        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        String generatedSignature =
                Utils.getHash(payload, keySecret);

        return generatedSignature.equals(razorpaySignature);
    }
}
