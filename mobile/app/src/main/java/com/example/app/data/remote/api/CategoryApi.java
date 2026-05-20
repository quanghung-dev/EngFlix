package com.example.app.data.remote.api;

import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.categories.CategoryResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface CategoryApi {

    @GET("categories")
    Call<ApiResponse<List<CategoryResponse>>> getCategories(
            @Query("limit") int limit,
            @Query("page") int page
    );

}
