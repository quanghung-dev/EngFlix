package com.example.app.data.remote.model.response.auth;

public class FirebaseSignUpResponse {
    private String kind;
    private String idToken ;
    private String email ;
    private String refreshToken ;
    private String localId ;
    private String expiresIn;

    public String getKind() {
        return kind;
    }
    public String getExpiresIn() {
        return expiresIn;
    }
    public String getIdToken() {
        return idToken;
    }

    public String getEmail() {
        return email;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getLocalId() {
        return localId;
    }
}
