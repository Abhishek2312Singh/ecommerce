package com.rks.productservice.dto.requestDto;

public class ProductRequest {
    private Long id;
    private String prodId;
    private String prodName;
    private Long prodQuantity;
    private Double prodPrice;
    private String prodDesc;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProdId() {
        return prodId;
    }

    public void setProdId(String prodId) {
        this.prodId = prodId;
    }

    public String getProdName() {
        return prodName;
    }

    public void setProdName(String prodName) {
        this.prodName = prodName;
    }

    public Long getProdQuantity() {
        return prodQuantity;
    }

    public void setProdQuantity(Long prodQuantity) {
        this.prodQuantity = prodQuantity;
    }

    public Double getProdPrice() {
        return prodPrice;
    }

    public void setProdPrice(Double prodPrice) {
        this.prodPrice = prodPrice;
    }

    public String getProdDesc() {
        return prodDesc;
    }

    public void setProdDesc(String prodDesc) {
        this.prodDesc = prodDesc;
    }
}
