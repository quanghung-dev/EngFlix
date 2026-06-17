package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.CategoryApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.categories.CategoryDeleteResponse;
import com.example.app.data.remote.model.response.categories.CategoryResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CategoriesRepository {
    private final CategoryApi categoryApi;

    public CategoriesRepository(Context context) {
        this.categoryApi = RetrofitClient.getInstance(context).getCategoryApi();
    }

    public interface categoryCallback<T> {
        void onSuccess(T data);
        void onError(String message);
    }

    public void getCategory(int limit, int  page, categoryCallback<List<CategoryResponse>> callback){
        categoryApi.getCategories(limit, page).enqueue(new Callback<ApiResponse<List<CategoryResponse>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<CategoryResponse>>> call, Response<ApiResponse<List<CategoryResponse>>> response) {
                if (response.isSuccessful() && response.body() != null ){
                    List<CategoryResponse> categoryData = response.body().getData();
                    callback.onSuccess(categoryData);
                }
                else {
                    try {
                        String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                        callback.onError(errorDetail);
                    }
                    catch (Exception e) {
                        callback.onError(e.getMessage());
                    }
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<CategoryResponse>>> call, Throwable t) {
                callback.onError("Lỗi:" + t.getMessage());
            }
        });
    }
    public void deleteCategory(int id, categoryCallback<ApiResponse<CategoryResponse>> callback){
        categoryApi.deleteCategory(id).enqueue(new Callback<ApiResponse<CategoryResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<CategoryResponse>> call, Response<ApiResponse<CategoryResponse>> response) {
                if (response.isSuccessful() && response.body() != null){
                    callback.onSuccess(response.body());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CategoryResponse>> call, Throwable t) {
                callback.onError("Lỗi:" + t.getMessage());
            }
        });
    }



}
