package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.progress.CreateProgressRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.progress.ProgressResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ProgressApi {
    @GET("learning-history")
    Call<ApiResponse<List<ProgressResponse>>> getProgress();
    @POST("learning-history")
    Call<ApiResponse<ProgressResponse>> createProgress(@Body CreateProgressRequest request);
    @GET("learning-history/finished")
    Call<ApiResponse<List<ProgressResponse>>> getProgressFinished();
    @GET("learning-history/unfinished")
    Call<ApiResponse<List<ProgressResponse>>> getProgressUnfinished();
}
