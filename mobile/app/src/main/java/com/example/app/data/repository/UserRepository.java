package com.example.app.data.repository;

import android.content.Context;

import androidx.annotation.NonNull;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.UserApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.user.UserResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserRepository {
    private final UserApi userApi;

    public UserRepository(Context context) {
        this.userApi = RetrofitClient.getInstance(context).getUserApi();
    }

    public interface userCallBack<T>{
        void onSuccess(T data);
        void onError(String message);
    }

    public void getProfile(userCallBack<UserResponse> callback) {
        userApi.getProfile().enqueue(new Callback<ApiResponse<UserResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                 if (response.isSuccessful() && response.body() != null ){
                     UserResponse userData = response.body().getData();
                     callback.onSuccess(userData);
                 }
                 else {
                     try {
                         String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                         callback.onError(errorDetail);
                     } catch (Exception e){
                         callback.onError(e.getMessage());
                     }
                 }
            }
            @Override
            public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }

    public void updateProfile(com.example.app.data.remote.model.request.auth.UpdateProfileRequest request, userCallBack<UserResponse> callback) {
        userApi.updateProfile(request).enqueue(new Callback<ApiResponse<UserResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                 if (response.isSuccessful() && response.body() != null ){
                     UserResponse userData = response.body().getData();
                     callback.onSuccess(userData);
                 }
                 else {
                     try {
                         String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                         callback.onError(errorDetail);
                     } catch (Exception e){
                         callback.onError(e.getMessage());
                     }
                 }
            }
            @Override
            public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }
}
