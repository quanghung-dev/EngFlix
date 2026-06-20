package com.example.app.data.remote.model.request.auth;

public class UpdateProfileRequest {

    private String name;
    private String phone;

    public UpdateProfileRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }
}
