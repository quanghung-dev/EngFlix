package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import com.example.app.R;
import com.example.app.adapter.vocabulary.FlashcardAdapter;
import com.example.app.adapter.vocabulary.VocaItemsAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.List;

public class FlashcardFragment extends Fragment {
    private final List<VocaItemsResponse> flashcards = new ArrayList<>();
    private FlashcardAdapter flashcardAdapter;
    private VocaItemsAdapter vocaItemsAdapter;
    private VocabularyRepository vocabularyRepository;
    private ViewPager2 viewPagerFlashcards;
    private RecyclerView rvVocabularyWords;
    private LinearLayout dotIndicatorContainer;
    private TextView tvProgress;
    private TextView tvTermCount;
    private TextView tvUsername;
    private TextView tvBadge;
    private ViewPager2.OnPageChangeCallback pageChangeCallback;
    private int deckId = -1;
    private String deckName = "";
    private String categoryName = "";
    private String deckDescription = "";
    private String deckLevel = "";
    private String deckThumbnailUrl = "";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_flashcard, container, false);

        ImageView btnBack = view.findViewById(R.id.btn_back);
        ImageView btnMore = view.findViewById(R.id.btn_more);
        tvProgress = view.findViewById(R.id.tv_progress);
        tvTermCount = view.findViewById(R.id.tv_term_count);
        tvUsername = view.findViewById(R.id.tv_username);
        tvBadge = view.findViewById(R.id.tv_badge);
        dotIndicatorContainer = view.findViewById(R.id.dot_indicator_container);
        viewPagerFlashcards = view.findViewById(R.id.viewpager_flashcards);
        rvVocabularyWords = view.findViewById(R.id.rv_vocabulary_words);

        readArguments();
        vocabularyRepository = new VocabularyRepository(requireContext());
        flashcardAdapter = new FlashcardAdapter();
        viewPagerFlashcards.setAdapter(flashcardAdapter);
        rvVocabularyWords.setLayoutManager(new NonScrollableLinearLayoutManager(requireContext()));
        rvVocabularyWords.setNestedScrollingEnabled(false);
        vocaItemsAdapter = new VocaItemsAdapter(flashcards, (position, vocaItem) -> {
            if (position >= 0 && position < flashcards.size()) {
                viewPagerFlashcards.setCurrentItem(position, true);
            }
        });
        rvVocabularyWords.setAdapter(vocaItemsAdapter);
        pageChangeCallback = new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                updateProgress(position);
            }
        };
        viewPagerFlashcards.registerOnPageChangeCallback(pageChangeCallback);

        bindDeckInfo();
        showEmptyState();
        getParentFragmentManager().setFragmentResultListener(
                EditItemsFragment.REQUEST_EDIT_ITEMS_SAVED,
                getViewLifecycleOwner(),
                (requestKey, result) -> {
                    deckName = result.getString("deckName", deckName);
                    bindDeckInfo();
                    fetchFlashcards();
                }
        );
        btnBack.setOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        btnMore.setOnClickListener(v -> {
            Bundle bundle = new Bundle();
            bundle.putInt("deckId", deckId);
            bundle.putString("deckName", deckName);
            bundle.putString("categoryName", categoryName);
            bundle.putString("deckDescription", deckDescription);
            bundle.putString("deckLevel", deckLevel);
            bundle.putString("deckThumbnailUrl", deckThumbnailUrl);
            Navigation.findNavController(v).navigate(R.id.action_flashcardFragment_to_editItemsFragment, bundle);
        });
        fetchFlashcards();

        return view;
    }

    private void readArguments() {
        Bundle bundle = getArguments();
        if (bundle == null) {
            return;
        }
        deckId = bundle.getInt("deckId", -1);
        deckName = bundle.getString("deckName", "");
        categoryName = bundle.getString("categoryName", "");
        deckDescription = bundle.getString("deckDescription", "");
        deckLevel = bundle.getString("deckLevel", "");
        deckThumbnailUrl = bundle.getString("deckThumbnailUrl", "");
    }

    private void bindDeckInfo() {
        if (!isBlank(deckName)) {
            tvUsername.setText(deckName);
        }
        tvBadge.setText(isBlank(categoryName) ? "Cá nhân" : categoryName);
    }

    private void fetchFlashcards() {
        if (deckId == -1) {
            Toast.makeText(requireContext(), "Không tìm thấy bộ từ vựng", Toast.LENGTH_SHORT).show();
            return;
        }

        vocabularyRepository.getVocabularyItemsByDeckId(deckId, new BaseCallback<ApiResponse<List<VocaItemsResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<VocaItemsResponse>> data) {
                if (!isAdded()) {
                    return;
                }
                flashcards.clear();
                if (data != null && data.getData() != null) {
                    flashcards.addAll(data.getData());
                }
                flashcardAdapter.setData(flashcards);
                vocaItemsAdapter.notifyDataSetChanged();
                rvVocabularyWords.requestLayout();
                if (flashcards.isEmpty()) {
                    showEmptyState();
                    return;
                }
                viewPagerFlashcards.setCurrentItem(0, false);
                updateProgress(0);
            }

            @Override
            public void onError(String message) {
                if (!isAdded()) {
                    return;
                }
                showEmptyState();
                Toast.makeText(requireContext(), "Lỗi tải flashcard: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showEmptyState() {
        tvProgress.setText("0/0");
        tvTermCount.setText("0 thuật ngữ");
        renderDots(0, 0);
    }

    private void updateProgress(int position) {
        int total = flashcards.size();
        if (total == 0) {
            showEmptyState();
            return;
        }
        int current = Math.min(position + 1, total);
        tvProgress.setText(current + "/" + total);
        tvTermCount.setText(total + " thuật ngữ");
        renderDots(position, total);
    }

    private void renderDots(int selectedPosition, int total) {
        dotIndicatorContainer.removeAllViews();
        if (total == 0) {
            return;
        }

        int dotCount = Math.min(total, 8);
        int selectedDot = total <= dotCount
                ? selectedPosition
                : (int) Math.floor((double) selectedPosition * dotCount / total);
        selectedDot = Math.min(selectedDot, dotCount - 1);

        for (int i = 0; i < dotCount; i++) {
            View dot = new View(requireContext());
            boolean active = i == selectedDot;
            int size = dp(active ? 8 : 6);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(size, size);
            params.setMargins(dp(3), 0, dp(3), 0);
            dot.setLayoutParams(params);
            dot.setBackground(ContextCompat.getDrawable(
                    requireContext(),
                    active ? R.drawable.bg_dot_active : R.drawable.bg_dot_inactive
            ));
            dotIndicatorContainer.addView(dot);
        }
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static class NonScrollableLinearLayoutManager extends LinearLayoutManager {
        NonScrollableLinearLayoutManager(android.content.Context context) {
            super(context);
        }

        @Override
        public boolean canScrollVertically() {
            return false;
        }
    }

    @Override
    public void onDestroyView() {
        if (viewPagerFlashcards != null && pageChangeCallback != null) {
            viewPagerFlashcards.unregisterOnPageChangeCallback(pageChangeCallback);
        }
        super.onDestroyView();
    }
}
