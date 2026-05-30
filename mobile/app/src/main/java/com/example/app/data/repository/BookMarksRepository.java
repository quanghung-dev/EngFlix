package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.BookMarksApi;
import com.example.app.data.remote.model.request.bookmarks.CreateBookMarksRequest;
import com.example.app.data.remote.model.request.note.UpdateNoteRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.bookmarks.BookmarksModel;
import com.example.app.data.remote.model.response.bookmarks.BookmarksResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookMarksRepository {
    private final BookMarksApi bookMarksApi;
    public BookMarksRepository(Context context) {
        this.bookMarksApi = RetrofitClient.getInstance(context).getBookMarksApi();
    }
    public void getBookmarks(Integer lessonId, String limit, String page, BaseCallback<ApiResponse<List<BookmarksModel>>> callback) {
        bookMarksApi.getBookmarks(lessonId, limit, page).enqueue(new ApiCallWrapper<>(callback));
    }
    public void getBookmarkByLessonId(int lessonId, int page, int limit, BaseCallback<ApiResponse<BookmarksModel>> callback) {
        bookMarksApi.getBookmarkByLessonId(lessonId, page, limit).enqueue(new ApiCallWrapper<>(callback));
    }
    public void createBookmark(int lessonId, CreateBookMarksRequest request, BaseCallback<ApiResponse<BookmarksResponse>> callback) {
        bookMarksApi.createBookmark(lessonId, request).enqueue(new ApiCallWrapper<>(callback));
    }
    public void deleteBookmark(int transcriptId, BaseCallback<ApiResponse<BookmarksResponse>> callback) {
        bookMarksApi.deleteBookmark(transcriptId).enqueue(new ApiCallWrapper<>(callback));
    }
    public void updateBookmark(int transcriptId, UpdateNoteRequest request, BaseCallback<ApiResponse<BookmarksResponse>> callback) {
        bookMarksApi.updateBookmark(transcriptId, request).enqueue(new ApiCallWrapper<>(callback));
    }
}
