package com.example.app.data.remote.model.response.auth;

public class FirebaseLoginResponse {
    private String kind;
    private String localId;
    private String email;
    private String displayName;
    private String idToken;
    private Boolean registered;
    private String refreshToken;
    private String expiresIn;

    public String getKind() {
        return kind;
    }

    public String getLocalId() {
        return localId;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIdToken() {
        return idToken;
    }

    public Boolean getRegistered() {
        return registered;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getExpiresIn() {
        return expiresIn;
    }
}
