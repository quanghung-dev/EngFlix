package com.example.app.adapter.vocabulary;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;

public class VocabularyCardAdapter extends RecyclerView.Adapter<VocabularyCardAdapter.VocabularyCardViewHolder> {

    public VocabularyCardAdapter() {

    }

    @NonNull
    @Override
    public VocabularyCardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_lesson_card, parent, false);
        return new VocabularyCardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VocabularyCardViewHolder holder, int position) {

    }

    @Override
    public int getItemCount() {
        return 0;
    }

    public class VocabularyCardViewHolder extends RecyclerView.ViewHolder {
        public VocabularyCardViewHolder(@NonNull View itemView) {
            super(itemView);
            cardThumbnail = itemView.findViewById(R.id.iv_card_thumbnail);
            cardTitle = itemView.findViewById(R.id.tv_card_title);
            cardWordCount = itemView.findViewById(R.id.tv_card_word_count);
        }

        ImageView cardThumbnail;
        TextView  cardTitle;
        TextView  cardWordCount;
    }
}
