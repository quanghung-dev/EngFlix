package com.example.app.feature.vocabulary;

public class VocabularyAvailableDecksFragment extends VocabularyDecksPageFragment {
    @Override
    protected boolean shouldShowDeck(boolean isDefaultDeck) {
        return isDefaultDeck;
    }

    @Override
    protected String getEmptyMessage() {
        return "Chưa có bộ từ vựng có sẵn";
    }
}
