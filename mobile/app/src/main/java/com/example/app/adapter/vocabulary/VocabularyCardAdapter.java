package com.example.app.adapter.vocabulary;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;

import java.util.ArrayList;
import java.util.List;

public class VocabularyCardAdapter extends RecyclerView.Adapter<VocabularyCardAdapter.VocabularyCardViewHolder> {
    private List<VocaDecksResponse> vocaCategories = new ArrayList<>();
    private boolean folderMode;
    public interface OnClickListener{
        void onClick(int position, VocaDecksResponse vocaCategory);
    }
    private OnClickListener listener;

    public void setData(List<VocaDecksResponse> vocaCategories){
        this.vocaCategories = vocaCategories;
        notifyDataSetChanged();
    }

    public VocabularyCardAdapter(List<VocaDecksResponse> vocaCategories, OnClickListener listener) {
        this(vocaCategories, listener, false);
    }

    public VocabularyCardAdapter(List<VocaDecksResponse> vocaCategories, OnClickListener listener, boolean folderMode) {
        this.vocaCategories = vocaCategories;
        this.listener = listener;
        this.folderMode = folderMode;
    }

    @NonNull
    @Override
    public VocabularyCardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        int layoutId = folderMode ? R.layout.item_vocabulary_folder : R.layout.item_vocabulary_card;
        View view = LayoutInflater.from(parent.getContext()).inflate(layoutId, parent, false);
        return new VocabularyCardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VocabularyCardViewHolder holder, int position) {
        VocaDecksResponse vocaCategory = vocaCategories.get(position);
        holder.cardTitle.setText(vocaCategory.getName());
        if (folderMode) {
            holder.cardWordCount.setText("Thư mục cá nhân");
        } else {
            holder.cardWordCount.setText(vocaCategory.getDescription());
        }
        holder.itemView.setOnClickListener(v -> {
            int currentPosition = holder.getBindingAdapterPosition();
            if (currentPosition != RecyclerView.NO_POSITION) {
                listener.onClick(currentPosition, vocaCategories.get(currentPosition));
            }
        });
    }

    @Override
    public int getItemCount() {
        if(vocaCategories != null){
            return vocaCategories.size();
        }
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
