package com.example.app.data.remote.model.request.auth;

public class RegisterRequest {
    private String email;
    private String password;
    private boolean returnSecureToken;


    public RegisterRequest(String email, String password, boolean returnSecureToken) {
        this.email = email;
        this.password = password;
        this.returnSecureToken = returnSecureToken;
    }
}
