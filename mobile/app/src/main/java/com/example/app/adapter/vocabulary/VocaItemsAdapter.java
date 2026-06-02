package com.example.app.adapter.vocabulary;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;

import java.util.ArrayList;
import java.util.List;

public class VocaItemsAdapter extends RecyclerView.Adapter<VocaItemsAdapter.VocaItemsViewHolder> {
    private List<VocaItemsResponse> vocaItems = new ArrayList<>();
    private OnClickCardListener listener;

    public VocaItemsAdapter(List<VocaItemsResponse> vocaItems, OnClickCardListener listener) {
        this.vocaItems = vocaItems;
        this.listener = listener;
    }
    public interface OnClickCardListener{
        void onClick(int position, VocaItemsResponse vocaItem);

    }

    @NonNull
    @Override
    public VocaItemsViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_vocabulary_word, parent, false);
        return new VocaItemsViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VocaItemsViewHolder holder, int position) {
        VocaItemsResponse vocaItem = vocaItems.get(position);
        holder.tvWord.setText(vocaItem.getPhrase());
        holder.tvWordTag.setText("Từ mới");
        holder.tvIPA.setText(vocaItem.getNormalized_phrase());
        String meaningText = vocaItem.getMeaning();
        if (meaningText == null || meaningText.trim().isEmpty()) {
            meaningText = vocaItem.getExample_sentence();
        }
        holder.tvMeaning.setText(meaningText);
        holder.itemView.setOnClickListener(v -> {
            int currentPosition = holder.getBindingAdapterPosition();
            if (currentPosition != RecyclerView.NO_POSITION) {
                listener.onClick(currentPosition, vocaItems.get(currentPosition));
            }
        });
    }

    @Override
    public int getItemCount() {
        if(vocaItems != null){
            return vocaItems.size();
        }
        return 0;
    }

    public class VocaItemsViewHolder extends RecyclerView.ViewHolder {
        public VocaItemsViewHolder(@NonNull View itemView) {
            super(itemView);
            tvWord = itemView.findViewById(R.id.tvWord);
            tvWordTag = itemView.findViewById(R.id.tvWordTag);
            tvIPA = itemView.findViewById(R.id.tvIPA);
            tvMeaning = itemView.findViewById(R.id.tvMeaning);
        }
        TextView tvWord;
        TextView tvWordTag;

        TextView tvIPA;
        TextView tvMeaning;
    }
}
