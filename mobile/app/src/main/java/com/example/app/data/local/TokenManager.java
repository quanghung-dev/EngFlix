package com.example.app.data.local;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static final String PREF_NAME = "EngFlix_prefs";
    private static final String KEY_ID_TOKEN = "id_token";
    private static final String KEY_REFRESH_TOKEN = "refresh_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USER_EMAIL = "user_email";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_AVATAR_URL = "avatar_url";
    private static final String KEY_USER_ROLE = "user_role";

    private static TokenManager instance;
    private final SharedPreferences prefs;
    private TokenManager(Context context) {
        prefs = context.getApplicationContext()
                .getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized TokenManager getInstance(Context context) {
        if (instance == null) {
            instance = new TokenManager(context);
        }
        return instance;
    }

    public void saveToken(String idToken, String refreshToken) {
        prefs.edit()
                .putString(KEY_ID_TOKEN, idToken)
                .putString(KEY_REFRESH_TOKEN, refreshToken)
                .apply();
    }


    public String getIdToken() {
        return prefs.getString(KEY_ID_TOKEN, null);
    }

    public String getavatarURL() {
        return prefs.getString(KEY_AVATAR_URL, null);
    }


    public String getRefreshToken() {
        return prefs.getString(KEY_REFRESH_TOKEN, null);
    }
    public String getUserId() { return prefs.getString(KEY_USER_ID, null); }
    public String getUserEmail() { return prefs.getString(KEY_USER_EMAIL, null); }
    public String getUserName() { return prefs.getString(KEY_USER_NAME, null); }
    public String getAvatarUrl() { return prefs.getString(KEY_AVATAR_URL, null); }
    public String getUserRole() {
        return prefs.getString(KEY_USER_ROLE, null);
    }

    public boolean hasToken() {
        return getIdToken() != null;
    }

    public void saveUserInfo(String userId, String email, String name, String avatarUrl, String userRole) {
        prefs.edit()
                .putString(KEY_USER_ID, userId)
                .putString(KEY_USER_EMAIL, email)
                .putString(KEY_USER_NAME, name)
                .putString(KEY_AVATAR_URL, avatarUrl)
                .putString(KEY_USER_ROLE, userRole)
                .apply();
    }

    public void clear() {
        prefs.edit().clear().apply();
    }

}