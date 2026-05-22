package com.example.app.data.remote.api;

import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;

public interface VocabularyApi {
    @GET("vocabulary-categories")
    Call<ApiResponse<List<VocaCategoryResponse>>> getVocaCategories();

    @GET("vocabulary-decks")
    Call<ApiResponse<List<VocaDecksResponse>>> getVocaDecks();

    @GET("vocabulary-items")
    Call<ApiResponse<List<VocaItemsResponse>>> getVocaItems();

}
