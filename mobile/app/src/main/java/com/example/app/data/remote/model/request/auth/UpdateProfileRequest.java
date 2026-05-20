package com.example.app.data.remote.model.request.auth;

public class UpdateProfileRequest {

    private String idToken;
    private String displayName;
    private boolean returnSecureToken;

    public UpdateProfileRequest(String idToken, String displayName, boolean returnSecureToken) {
        this.idToken = idToken;
        this.displayName = displayName;
        this.returnSecureToken = returnSecureToken;
    }
}
