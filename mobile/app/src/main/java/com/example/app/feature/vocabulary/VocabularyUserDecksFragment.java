package com.example.app.feature.vocabulary;

import android.util.Log;

import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.List;

public class VocabularyUserDecksFragment extends VocabularyDecksPageFragment {
    private static final String TAG = "VocabularyUserDecks";

    @Override
    protected boolean shouldShowDeck(boolean isDefaultDeck) {
        return !isDefaultDeck;
    }

    @Override
    protected String getEmptyMessage() {
        return "Chưa có bộ từ vựng người dùng";
    }

    @Override
    protected void loadData() {
        getParentFragmentManager().setFragmentResultListener(
                REQUEST_REFRESH_USER_DECKS,
                this,
                (requestKey, result) -> fetchMyDecks()
        );
        fetchMyDecks();
    }

    private void fetchMyDecks() {
        vocabularyRepository.getMyVocabularyDecks(new BaseCallback<ApiResponse<List<VocaDecksResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<VocaDecksResponse>> data) {
                List<VocaDecksResponse> decks = new ArrayList<>();
                if (data != null && data.getData() != null) {
                    decks.addAll(data.getData());
                }
                showDecksInSingleSection("Bộ từ vựng cá nhân", decks);
            }

            @Override
            public void onError(String message) {
                Log.e(TAG, "Lỗi tải bộ từ vựng cá nhân: " + message);
                showDecksInSingleSection("Bộ từ vựng cá nhân", new ArrayList<>());
            }
        });
    }
}
