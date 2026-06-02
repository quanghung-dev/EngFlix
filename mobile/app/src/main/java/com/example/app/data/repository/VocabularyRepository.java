package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.VocabularyApi;
import com.example.app.data.remote.model.request.vocaDecks.AddItemsToDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.CreateVocaDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.UpdateDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.UpdateVocaItemRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.util.List;

public class VocabularyRepository {
    private final VocabularyApi vocabularyApi;

    public VocabularyRepository(Context context) {
        this.vocabularyApi = RetrofitClient.getInstance(context).getVocabularyApi();
    }

    public void getVocabularyCategories(BaseCallback<ApiResponse<List<VocaCategoryResponse>>> callback){
        vocabularyApi.getVocaCategories().enqueue(new ApiCallWrapper<>(callback));
    }

    public void getVocabularyDecks(int categoryId, BaseCallback<ApiResponse<List<VocaDecksResponse>>> callback) {
        vocabularyApi.getVocaDecks(categoryId).enqueue(new ApiCallWrapper<>(callback));
    }

    public void getMyVocabularyDecks(BaseCallback<ApiResponse<List<VocaDecksResponse>>> callback) {
        vocabularyApi.getMyVocaDecks().enqueue(new ApiCallWrapper<>(callback));
    }

    public void createVocaDeck(CreateVocaDeckRequest request, BaseCallback<ApiResponse<VocaDecksResponse>> callback) {
        vocabularyApi.createVocaDeck(request).enqueue(new ApiCallWrapper<>(callback));
    }

    public void updateDeck(int id, UpdateDeckRequest request, BaseCallback<ApiResponse<VocaDecksResponse>> callback) {
        vocabularyApi.updateDeck(id, request).enqueue(new ApiCallWrapper<>(callback));
    }

    public void deleteDeck(int id, BaseCallback<ApiResponse<VocaDecksResponse>> callback) {
        vocabularyApi.deleteDeck(id).enqueue(new ApiCallWrapper<>(callback));
    }

    public void getVocabularyItemsByDeckId(int deckId, BaseCallback<ApiResponse<List<VocaItemsResponse>>> callback) {
        vocabularyApi.getVocaItemsByDeckId(deckId).enqueue(new ApiCallWrapper<>(callback));
    }

    public void addVocaItemToDeck(int deckId, AddItemsToDeckRequest request, BaseCallback<ApiResponse<VocaItemsResponse>> callback) {
        vocabularyApi.addVocaItemToDeck(deckId, request).enqueue(new ApiCallWrapper<>(callback));
    }

    public void updateItem(int deckId, int itemId, UpdateVocaItemRequest request, BaseCallback<ApiResponse<VocaItemsResponse>> callback) {
        vocabularyApi.updateItem(deckId, itemId, request).enqueue(new ApiCallWrapper<>(callback));
    }

    public void deleteItem(int deckId, int itemId, BaseCallback<ApiResponse<VocaItemsResponse>> callback) {
        vocabularyApi.deleteItem(deckId, itemId).enqueue(new ApiCallWrapper<>(callback));
    }

    public void getVocabularyItems(BaseCallback<ApiResponse<List<VocaItemsResponse>>> callback) {
        vocabularyApi.getVocaItems().enqueue(new ApiCallWrapper<>(callback));
    }
}
