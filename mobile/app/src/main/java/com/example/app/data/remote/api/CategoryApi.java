package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.category.CreateCategoryRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.categories.CategoryDeleteResponse;
import com.example.app.data.remote.model.response.categories.CategoryResponse;
import com.google.android.gms.common.api.Api;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface CategoryApi {

    @GET("categories")
    Call<ApiResponse<List<CategoryResponse>>> getCategories(
            @Query("limit") int limit,
            @Query("page") int page
    );
    @POST("admin/categories")
    Call<ApiResponse<CategoryResponse>> createCategory(@Body CreateCategoryRequest request);

    @DELETE("admin/categories/{id}")
    Call<ApiResponse<CategoryResponse>> deleteCategory(@Path("id") int id);

}
