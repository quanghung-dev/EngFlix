package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.AuthApi;
import com.example.app.data.remote.api.UserApi;
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

        // 1. Đăng ký trên Firebase
        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        FirebaseUser user = mAuth.getCurrentUser();
                        if (user != null) {
                            // 2. Cập nhật Tên hiển thị
                            UserProfileChangeRequest profileUpdates = new UserProfileChangeRequest.Builder()
                                    .setDisplayName(name)
                                    .build();

                            user.updateProfile(profileUpdates).addOnCompleteListener(updateTask -> {
                                if (updateTask.isSuccessful()) {
                                    // 3. Lấy ID Token bảo mật
                                    user.getIdToken(true).addOnCompleteListener(tokenTask -> {
                                        if (tokenTask.isSuccessful()) {
                                            String idToken = tokenTask.getResult().getToken();
                                            tokenManager.saveToken(idToken, "");
                                            callback.onSuccess("Đăng ký thành công");
                                        } else {
                                            callback.onError("Lỗi lấy Token sau đăng ký");
                                        }
                                    });
                                } else {
                                    callback.onError("Lỗi cập nhật hồ sơ");
                                }
                            });
                        } else {
                            callback.onError("Không tìm thấy người dùng Firebase sau đăng ký");
                        }
                    } else {
                        String errorMsg = task.getException() != null ? task.getException().getMessage() : "Lỗi đăng ký Firebase";
                        callback.onError(errorMsg);
                    }
                });
    }

    public void login(String email, String password, authCallBack<UserResponse> callback) {
        FirebaseAuth mAuth = FirebaseAuth.getInstance();

        // 1. Đăng nhập bằng Firebase
        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        FirebaseUser user = mAuth.getCurrentUser();
                        if (user != null) {
                            // 2. Lấy ID Token
                            user.getIdToken(true).addOnCompleteListener(tokenTask -> {
                                if (tokenTask.isSuccessful()) {
                                    String idToken = tokenTask.getResult().getToken();
                                    tokenManager.saveToken(idToken, "");

                                    authApi.auth().enqueue(new Callback<ApiResponse<UserResponse>>() {
                                        @Override
                                        public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                                            if (response.isSuccessful() && response.body() != null) {
                                                UserResponse userResponse = response.body().getData();
                                                tokenManager.saveUserInfo(
                                                        userResponse.getUid(),
                                                        userResponse.getEmail(),
                                                        userResponse.getName(),
                                                        userResponse.getAvatarUrl(),
                                                        userResponse.getUserRole()
                                                );
                                                callback.onSuccess(userResponse);
                                            } else {
                                                callback.onError("Lỗi đồng bộ server: Code " + response.code());
                                            }
                                        }
                                        @Override
                                        public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                                            callback.onError("Lỗi đồng bộ server: Code " + t.getMessage());
                                        }
                                    });

                                } else {
                                    callback.onError("Lỗi xác thực Token");
                                }
                            });
                        } else {
                            callback.onError("Không tìm thấy người dùng Firebase sau đăng nhập");
                        }
                    } else {
                        String errorMsg = task.getException() != null ? task.getException().getMessage() : "Sai tài khoản hoặc mật khẩu";
                        callback.onError(errorMsg);
                    }
                });
    }


}
