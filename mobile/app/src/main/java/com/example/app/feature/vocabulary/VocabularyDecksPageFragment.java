package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.vocabulary.VocabularyCardAdapter;
import com.example.app.adapter.vocabulary.VocabularySectionAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class VocabularyDecksPageFragment extends Fragment {
    private static final String TAG = "VocabularyDecksPage";
    protected static final String REQUEST_REFRESH_USER_DECKS = "refresh_user_vocabulary_decks";

    protected final List<VocaCategoryResponse> categoryList = new ArrayList<>();
    protected final List<VocaCategoryResponse> visibleCategoryList = new ArrayList<>();
    protected final Map<Integer, List<VocaDecksResponse>> decksMap = new HashMap<>();
    private RecyclerView rvVocabularySections;
    private TextView tvEmptyState;
    protected VocabularySectionAdapter sectionAdapter;
    protected VocabularyRepository vocabularyRepository;

    protected abstract boolean shouldShowDeck(boolean isDefaultDeck);

    protected abstract String getEmptyMessage();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_decks_page, container, false);
        rvVocabularySections = view.findViewById(R.id.rv_vocabulary_sections);
        tvEmptyState = view.findViewById(R.id.tv_empty_state);
        tvEmptyState.setText(getEmptyMessage());

        rvVocabularySections.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.VERTICAL, false));
        vocabularyRepository = new VocabularyRepository(requireContext());
        sectionAdapter = new VocabularySectionAdapter(categoryList, (position, deck) -> {
            Bundle bundle = new Bundle();
            bundle.putInt("deckId", deck.getId());
            bundle.putString("deckName", deck.getName());
            bundle.putBoolean("isUserDeck", !deck.isDefault());
            if (position >= 0 && position < visibleCategoryList.size()) {
                bundle.putString("categoryName", visibleCategoryList.get(position).getName());
            }
            Navigation.findNavController(requireActivity(), R.id.nav_host_fragment)
                    .navigate(R.id.action_vocabularyFragment_to_detailItems, bundle);
        });
        rvVocabularySections.setAdapter(sectionAdapter);
        loadData();
        return view;
    }

    protected void loadData() {
        fetchCategories();
    }

    protected void fetchCategories() {
        vocabularyRepository.getVocabularyCategories(new BaseCallback<ApiResponse<List<VocaCategoryResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<VocaCategoryResponse>> response) {
                categoryList.clear();
                if (response != null && response.getData() != null) {
                    categoryList.addAll(response.getData());
                }
                fetchDecksForCategories();
            }

            @Override
            public void onError(String message) {
                Log.e(TAG, "Lỗi tải categories: " + message);
                Toast.makeText(requireContext(), "Lỗi tải dữ liệu danh mục!", Toast.LENGTH_SHORT).show();
                updateEmptyState();
            }
        });
    }

    private void fetchDecksForCategories() {
        decksMap.clear();
        if (categoryList.isEmpty()) {
            updateDisplayedSections();
            updateEmptyState();
            return;
        }

        for (VocaCategoryResponse category : categoryList) {
            final int currentCategoryId = category.getId();
            vocabularyRepository.getVocabularyDecks(currentCategoryId, new BaseCallback<ApiResponse<List<VocaDecksResponse>>>() {
                @Override
                public void onSuccess(ApiResponse<List<VocaDecksResponse>> data) {
                    List<VocaDecksResponse> filteredDecks = new ArrayList<>();
                    if (data != null && data.getData() != null) {
                        for (VocaDecksResponse deck : data.getData()) {
                            if (shouldShowDeck(deck.isDefault())) {
                                filteredDecks.add(deck);
                            }
                        }
                    }
                    decksMap.put(currentCategoryId, filteredDecks);
                    updateDisplayedSections();
                }

                @Override
                public void onError(String message) {
                    Log.e(TAG, "Lỗi tải deck cho category " + category.getId() + ": " + message);
                    decksMap.put(currentCategoryId, new ArrayList<>());
                    updateDisplayedSections();
                }
            });
        }
    }

    protected void showDecksInSingleSection(String sectionName, List<VocaDecksResponse> decks) {
        int sectionId = 0;
        categoryList.clear();
        visibleCategoryList.clear();
        decksMap.clear();

        VocaCategoryResponse category = new VocaCategoryResponse(sectionId, sectionName, null);
        categoryList.add(category);
        if (decks != null && !decks.isEmpty()) {
            visibleCategoryList.add(category);
            decksMap.put(sectionId, decks);
        }
        sectionAdapter.setData(visibleCategoryList, decksMap);
        updateEmptyState();
    }

    protected void updateDisplayedSections() {
        visibleCategoryList.clear();
        for (VocaCategoryResponse category : categoryList) {
            List<VocaDecksResponse> decks = decksMap.get(category.getId());
            if (decks != null && !decks.isEmpty()) {
                visibleCategoryList.add(category);
            }
        }
        sectionAdapter.setData(visibleCategoryList, decksMap);
        updateEmptyState();
    }

    private void updateEmptyState() {
        boolean hasDeck = false;
        for (List<VocaDecksResponse> decks : decksMap.values()) {
            if (decks != null && !decks.isEmpty()) {
                hasDeck = true;
                break;
            }
        }
        tvEmptyState.setVisibility(hasDeck ? View.GONE : View.VISIBLE);
        rvVocabularySections.setVisibility(hasDeck ? View.VISIBLE : View.GONE);
    }
}
