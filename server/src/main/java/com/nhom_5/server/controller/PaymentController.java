package com.nhom_5.server.controller;

import com.nhom_5.server.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;
import java.util.*;

@RestController
@RequestMapping("/payment/vnpay")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayConfig vnPayConfig;
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE payment DROP CONSTRAINT IF EXISTS payment_method_check");
            System.out.println("Dropped payment_method_check constraint successfully.");
        } catch (Exception e) {
            System.out.println("Could not drop constraint: " + e.getMessage());
        }
    }

    @GetMapping("/create-url")
    public ResponseEntity<?> createPaymentUrl(@RequestParam("amount") long amount) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        // VNPay uses amount * 100
        long amountVal = amount * 100;
        
        String vnp_TxnRef = "BK-" + System.currentTimeMillis();
        String vnp_IpAddr = "127.0.0.1";
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountVal));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;

        Map<String, String> result = new HashMap<>();
        result.put("url", paymentUrl);
        
        return ResponseEntity.ok(result);
    }
}
