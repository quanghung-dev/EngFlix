package com.example.app.data.remote.interceptor;

import androidx.annotation.NonNull;

import com.example.app.data.local.TokenManager;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GetTokenResult;

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
        String token = getValidToken();
        if (token == null) {
            return chain.proceed(originalRequest);
        }
        Request newRequest = originalRequest.newBuilder()
                .header("Authorization", "Bearer " + token)
                .build();
        return chain.proceed(newRequest);
    }
    private String getValidToken() {
        if (!tokenManager.hasToken()) {
            return null;
        }

        FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();

        if (user != null) {
            try {
                GetTokenResult tokenResult = Tasks.await(user.getIdToken(false));
                String freshToken = tokenResult.getToken();
                if (freshToken != null && !freshToken.isEmpty()) {
                    tokenManager.saveToken(freshToken, "");
                    return freshToken;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return tokenManager.getIdToken();
    }

}

