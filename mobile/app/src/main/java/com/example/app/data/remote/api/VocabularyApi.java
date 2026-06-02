package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.vocaDecks.AddItemsToDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.CreateVocaDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.UpdateDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.UpdateVocaItemRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface VocabularyApi {
    @GET("vocabulary-categories")
    Call<ApiResponse<List<VocaCategoryResponse>>> getVocaCategories();

    @GET("vocabulary-decks")
    Call<ApiResponse<List<VocaDecksResponse>>> getVocaDecks(
            @Query("category_id") int categoryId
    );

    @GET("vocabulary-decks/mine")
    Call<ApiResponse<List<VocaDecksResponse>>> getMyVocaDecks();

    @POST("vocabulary-decks")
    Call<ApiResponse<VocaDecksResponse>> createVocaDeck(
            @Body CreateVocaDeckRequest request
    );

    @PUT("vocabulary-decks/{id}")
    Call<ApiResponse<VocaDecksResponse>> updateDeck(
            @Path("id") int id,
            @Body UpdateDeckRequest request
    );

    @DELETE("vocabulary-decks/{id}")
    Call<ApiResponse<VocaDecksResponse>> deleteDeck(
            @Path("id") int id
    );

    @GET("vocabulary-decks/{deckId}/items")
    Call<ApiResponse<List<VocaItemsResponse>>> getVocaItemsByDeckId(
            @Path("deckId") int deckId
    );

    @POST("vocabulary-decks/{deckId}/items")
    Call<ApiResponse<VocaItemsResponse>> addVocaItemToDeck(
            @Path("deckId") int deckId,
            @Body AddItemsToDeckRequest request
    );

    @PUT("vocabulary-decks/{deckId}/items/{itemId}")
    Call<ApiResponse<VocaItemsResponse>> updateItem(
            @Path("deckId") int deckId,
            @Path("itemId") int itemId,
            @Body UpdateVocaItemRequest request
    );

    @DELETE("vocabulary-decks/{deckId}/items/{itemId}")
    Call<ApiResponse<VocaItemsResponse>> deleteItem(
            @Path("deckId") int deckId,
            @Path("itemId") int itemId
    );

    @GET("vocabulary-items")
    Call<ApiResponse<List<VocaItemsResponse>>> getVocaItems();
}
