package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.bookmarks.CreateBookMarksRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.bookmarks.BookmarksModel;
import com.example.app.data.remote.model.response.bookmarks.BookmarksResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface BookMarksApi {
    @GET("bookmarks")
    Call<ApiResponse<List<BookmarksModel>>>
    getBookmarks(
                 @Query("limit") String limit,
                 @Query("page") String page);

    @GET("bookmarks/{lessonId}")
    Call<ApiResponse<BookmarksModel>>
    getBookmarkByLessonId(@Path("lessonId") int lessonId, @Query("page") int page, @Query("limit") int limit);

    @POST("bookmarks/{lessonId}")
    Call<ApiResponse<BookmarksResponse>>
    createBookmark(@Path("lessonId") int lessonId,
                   @Body CreateBookMarksRequest request);

    @DELETE("bookmarks/{lessonId}")
    Call<ApiResponse<BookmarksResponse>>
    deleteBookmark(@Path("lessonId") int lessonId);

}
