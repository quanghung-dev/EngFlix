package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.UserApi;
import com.example.app.data.remote.model.request.auth.UpdateProfileRequest;
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

    public interface userCallBack<T> {
        void onSuccess(T data);

        void onError(String message);
    }

    public void getProfile(userCallBack<UserResponse> callback) {
        userApi.getProfile().enqueue(new Callback<ApiResponse<UserResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                UserResponse userData = getBodyData(response);
                if (userData != null) {
                    callback.onSuccess(userData);
                } else {
                    callback.onError(getErrorMessage(response));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }

    public void updateProfile(UpdateProfileRequest request, userCallBack<UserResponse> callback) {
        userApi.updateProfile(request).enqueue(new Callback<ApiResponse<UserResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<UserResponse>> call, Response<ApiResponse<UserResponse>> response) {
                UserResponse userData = getBodyData(response);
                if (userData != null) {
                    callback.onSuccess(userData);
                } else {
                    callback.onError(getErrorMessage(response));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<UserResponse>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }

    private UserResponse getBodyData(Response<ApiResponse<UserResponse>> response) {
        if (response.isSuccessful() && response.body() != null) {
            return response.body().getData();
        }
        return null;
    }

    private String getErrorMessage(Response<?> response) {
        try {
            if (response.errorBody() != null) {
                return response.errorBody().string();
            }
        } catch (Exception e) {
            return e.getMessage();
        }
        return response.isSuccessful()
                ? "Server khong tra ve thong tin nguoi dung"
                : "Code " + response.code();
    }
}
