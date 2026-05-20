package com.example.app.data.remote.api;

import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.user.UserResponse;

import retrofit2.Call;
import retrofit2.http.POST;

public interface AuthApi {
    @POST("auth/sync")
    Call<ApiResponse<UserResponse>> auth();
}