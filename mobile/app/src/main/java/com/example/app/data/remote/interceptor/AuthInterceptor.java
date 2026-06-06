package com.example.app.data.remote.interceptor;

import android.util.Log;

import androidx.annotation.NonNull;

import com.example.app.data.local.TokenManager;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {

    private TokenManager tokenManager;
    public AuthInterceptor(TokenManager tokenManager) {
        this.tokenManager = tokenManager;
    }


    @Override
    @NonNull
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request originalRequest = chain.request();
        String url = originalRequest.url().toString();
        if (url.contains("identitytoolkit.googleapis.com")) {
            return chain.proceed(originalRequest);
        }
        String token = tokenManager.getIdToken();
        if (token == null) {
            return chain.proceed(originalRequest);
        }
        Request newRequest = originalRequest.newBuilder()
                .header("Authorization", "Bearer " + token)
                .build();
        Log.d("TokenCheck", "Token hiện tại là: " + token);
        return chain.proceed(newRequest);
    }

}

