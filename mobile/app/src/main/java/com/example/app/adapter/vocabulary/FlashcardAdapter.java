package com.example.app.adapter.vocabulary;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;

import java.util.ArrayList;
import java.util.List;

public class FlashcardAdapter extends RecyclerView.Adapter<FlashcardAdapter.FlashcardViewHolder> {
    private final List<VocaItemsResponse> flashcards = new ArrayList<>();

    public void setData(List<VocaItemsResponse> items) {
        flashcards.clear();
        if (items != null) {
            flashcards.addAll(items);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public FlashcardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_flashcard, parent, false);
        return new FlashcardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FlashcardViewHolder holder, int position) {
        holder.bind(flashcards.get(position));
    }

    @Override
    public int getItemCount() {
        return flashcards.size();
    }

    static class FlashcardViewHolder extends RecyclerView.ViewHolder {
        private static final long FLIP_HALF_DURATION_MS = 140;

        private final View root;
        private final CardView cardFront;
        private final CardView cardBack;
        private final TextView tvFrontWord;
        private final TextView tvBackMeaning;
        private boolean showingBack = false;
        private boolean animating = false;

        FlashcardViewHolder(@NonNull View itemView) {
            super(itemView);
            root = itemView.findViewById(R.id.flashcard_root);
            cardFront = itemView.findViewById(R.id.card_front);
            cardBack = itemView.findViewById(R.id.card_back);
            tvFrontWord = itemView.findViewById(R.id.tv_front_word);
            tvBackMeaning = itemView.findViewById(R.id.tv_back_meaning);
            root.setCameraDistance(itemView.getResources().getDisplayMetrics().density * 8000);
        }

        void bind(VocaItemsResponse item) {
            tvFrontWord.setText(nonBlankOrFallback(item.getPhrase(), "Flashcard"));
            tvBackMeaning.setText(nonBlankOrFallback(item.getMeaning(), ""));
            showFront();
            root.setOnClickListener(v -> toggleFace());
        }

        private void toggleFace() {
            if (animating) {
                return;
            }
            animating = true;
            root.animate()
                    .rotationY(90f)
                    .setDuration(FLIP_HALF_DURATION_MS)
                    .withEndAction(() -> {
                        if (showingBack) {
                            showFront();
                        } else {
                            showBack();
                        }
                        root.setRotationY(-90f);
                        root.animate()
                                .rotationY(0f)
                                .setDuration(FLIP_HALF_DURATION_MS)
                                .withEndAction(() -> animating = false)
                                .start();
                    })
                    .start();
        }

        private void showFront() {
            showingBack = false;
            root.setRotationY(0f);
            cardFront.setVisibility(View.VISIBLE);
            cardBack.setVisibility(View.GONE);
        }

        private void showBack() {
            showingBack = true;
            cardFront.setVisibility(View.GONE);
            cardBack.setVisibility(View.VISIBLE);
        }

        private String nonBlankOrFallback(String value, String fallback) {
            return value == null || value.trim().isEmpty() ? fallback : value;
        }
    }
}
