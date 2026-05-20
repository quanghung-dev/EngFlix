package com.example.app.utils;

import com.example.app.BuildConfig;

public class Constants {
    public static final String BASE_URL = BuildConfig.BASE_URL;
    public static final String FIREBASE_API_KEY = BuildConfig.FIREBASE_API_KEY;
    public static final String FIREBASE_SIGNUP_URL =
            "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="
                    + FIREBASE_API_KEY;
}