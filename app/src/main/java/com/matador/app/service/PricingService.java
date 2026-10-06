package com.matador.app.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;


// TODO: adapt price response to shape of full api response to be able to pass ask, spread, currency, etc later
@Service
public class PricingService {

    private final RestTemplate restTemplate;

    @Value("${pricing.api.url:https://y4t9nq2bqf.execute-api.eu-west-2.amazonaws.com/v1/quotes")
    private String pricingApiUrl;

    @Value("${pricing.api.key:}")
    private String apiKey;

    public PricingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


public BigDecimal getCurrentPrice(String ticker) {
    try {
        String url = pricingApiUrl + "/" + ticker;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", apiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<PriceResponse> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            PriceResponse.class
        );
        
        if (response.getBody() == null || response.getBody().getData().getPrice() == null) {
            throw new IllegalStateException("No price available for ticker: " + ticker);
        }
        
        return response.getBody().getData().getPrice();
    } catch (Exception e) {
        throw new RuntimeException(
            String.format("Failed to fetch current price for ticker: %s. Error: %s", ticker, e.getMessage()),
            e
        );
    }
}


    public static class PriceResponse {
        private PriceData data;

        public PriceData getData() {
            return data;
        }

        public void setData(PriceData data) {
            this.data = data;
        }
    }

    public static class PriceData {
        private String symbol;
        private BigDecimal price;

        public String getSymbol() {
            return symbol;
        }

        public void setSymbol(String symbol) {
            this.symbol = symbol;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }
    }
}
