package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.VocabularyApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VocabularyRepository {
    private final VocabularyApi vocabularyApi;

    public VocabularyRepository(Context context) {
        this.vocabularyApi = RetrofitClient.getInstance(context).getVocabularyApi();
    }
    public interface VocabularyCallback<T> {
        void onSuccess(T data);
        void onError(String message);
    }
    public void getVocabularyCategories(VocabularyCallback<ApiResponse<List<VocaCategoryResponse>>> callback) {
        vocabularyApi.getVocaCategories().enqueue(new Callback<ApiResponse<List<VocaCategoryResponse>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<VocaCategoryResponse>>> call, Response<ApiResponse<List<VocaCategoryResponse>>> response) {
                if(response.isSuccessful() && response.body() != null){
                    callback.onSuccess(response.body());
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
            public void onFailure(Call<ApiResponse<List<VocaCategoryResponse>>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }

    public void getVocabularyDecks(VocabularyCallback<ApiResponse<List<VocaDecksResponse>>> callback) {
        vocabularyApi.getVocaDecks().enqueue(new Callback<ApiResponse<List<VocaDecksResponse>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<VocaDecksResponse>>> call, Response<ApiResponse<List<VocaDecksResponse>>> response) {
                if(response.isSuccessful() && response.body() != null){
                    callback.onSuccess(response.body());
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
            public void onFailure(Call<ApiResponse<List<VocaDecksResponse>>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }
    public void getVocabularyItems(VocabularyCallback<ApiResponse<List<VocaItemsResponse>>> callback) {
        vocabularyApi.getVocaItems().enqueue(new Callback<ApiResponse<List<VocaItemsResponse>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<VocaItemsResponse>>> call, Response<ApiResponse<List<VocaItemsResponse>>> response) {
                if(response.isSuccessful() && response.body() != null){
                 callback.onSuccess(response.body());
                }
                else{
                    try {
                        String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                        callback.onError(errorDetail);
                    } catch (Exception e){
                        callback.onError(e.getMessage());
                    }
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<VocaItemsResponse>>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }
}
