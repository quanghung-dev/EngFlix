package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.AuthApi;
import com.example.app.data.remote.api.UserApi;
import com.example.app.data.remote.model.request.auth.UpdateProfileRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.user.UserResponse;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.UserProfileChangeRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthRepository {

    private final AuthApi authApi;
    private final UserApi userApi;
    private final TokenManager tokenManager;

    public AuthRepository(Context context) {
        this.authApi = RetrofitClient.getInstance(context).getAuthApi();
        this.userApi = RetrofitClient.getInstance(context).getUserApi();
        this.tokenManager = TokenManager.getInstance(context);
    }

    public interface authCallBack<T> {
        void onSuccess(T data);

        void onError(String message);
    }

    public void Register(String email, String password, String name, authCallBack<String> callback) {
        FirebaseAuth mAuth = FirebaseAuth.getInstance();

        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        String errorMsg = task.getException() != null
                                ? task.getException().getMessage()
                                : "Loi dang ky Firebase";
                        callback.onError(errorMsg);
                        return;
                    }

                    FirebaseUser user = mAuth.getCurrentUser();
                    if (user == null) {
                        callback.onError("Khong tim thay nguoi dung Firebase sau dang ky");
                        return;
                    }

                    UserProfileChangeRequest profileUpdates = new UserProfileChangeRequest.Builder()
                            .setDisplayName(name)
                            .build();

                    user.updateProfile(profileUpdates).addOnCompleteListener(updateTask -> {
                        if (!updateTask.isSuccessful()) {
                            user.delete().addOnCompleteListener(d -> {
                                clearAuthState();
                                callback.onError("Loi cap nhat ho so Firebase");
                            });
                            return;
                        }

                        user.getIdToken(true).addOnCompleteListener(tokenTask -> {
                            if (!tokenTask.isSuccessful() || tokenTask.getResult() == null) {
                                user.delete().addOnCompleteListener(d -> {
                                    clearAuthState();
                                    callback.onError("Loi lay token sau dang ky");
                                });
                                return;
                            }

                            tokenManager.saveToken(tokenTask.getResult().getToken(), "");
                            syncAuthenticatedUser(new authCallBack<UserResponse>() {
                                @Override
                                public void onSuccess(UserResponse data) {
                                    callback.onSuccess("Dang ky thanh cong");
                                }

                                @Override
                                public void onError(String message) {
                                    user.delete().addOnCompleteListener(d -> {
                                        clearAuthState();
                                        callback.onError(message);
                                    });
                                }
                            });
                        });
                    });
                });
    }

    public void login(String email, String password, authCallBack<UserResponse> callback) {
        FirebaseAuth mAuth = FirebaseAuth.getInstance();

        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        String errorMsg = task.getException() != null
                                ? task.getException().getMessage()
                                : "Sai tai khoan hoac mat khau";
                        callback.onError(errorMsg);
                        return;
                    }

                    FirebaseUser user = mAuth.getCurrentUser();
                    if (user == null) {
                        callback.onError("Khong tim thay nguoi dung Firebase sau dang nhap");
                        return;
                    }

                    user.getIdToken(true).addOnCompleteListener(tokenTask -> {
                        if (!tokenTask.isSuccessful() || tokenTask.getResult() == null) {
                            callback.onError("Loi xac thuc token");
                            return;
                        }

                        tokenManager.saveToken(tokenTask.getResult().getToken(), "");
                        syncAuthenticatedUser(new authCallBack<UserResponse>() {
                            @Override
                            public void onSuccess(UserResponse data) {
                                callback.onSuccess(data);
                            }

                            @Override
                            public void onError(String message) {
                                clearAuthState();
                                callback.onError(message);
                            }
                        });
                    });
                });
    }

    public void updateProfile(UpdateProfileRequest request, authCallBack<ApiResponse<UserResponse>> callback) {
        userApi.updateProfile(request).enqueue(new Callback<ApiResponse<UserResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError(getErrorMessage(response));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                callback.onError("Loi: " + t.getMessage());
            }
        });
    }

    private void syncAuthenticatedUser(authCallBack<UserResponse> callback) {
        authApi.auth().enqueue(new Callback<ApiResponse<UserResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    UserResponse userResponse = response.body().getData();
                    saveUserInfo(userResponse);
                    callback.onSuccess(userResponse);
                } else {
                    callback.onError("Loi dong bo server: " + getErrorMessage(response));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                callback.onError("Loi dong bo server: " + t.getMessage());
            }
        });
    }

    private void saveUserInfo(UserResponse userResponse) {
        tokenManager.saveUserInfo(
                userResponse.getUid(),
                userResponse.getEmail(),
                userResponse.getName(),
                userResponse.getAvatarUrl(),
                userResponse.getUserRole(),
                userResponse.getPhone()
        );
    }

    private void clearAuthState() {
        FirebaseAuth.getInstance().signOut();
        tokenManager.clear();
    }

    private String getErrorMessage(Response<?> response) {
        try {
            if (response.errorBody() != null) {
                return response.errorBody().string();
            }
        } catch (Exception e) {
            return e.getMessage();
        }
        return "Code " + response.code();
    }
}
