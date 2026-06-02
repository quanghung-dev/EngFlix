package com.example.app.adapter.dictation;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import java.util.ArrayList;
import java.util.List;

public class WordCardAdapter extends RecyclerView.Adapter<WordCardAdapter.WordCardViewHolder> {

    private List<WorkCardModel> list = new ArrayList<>();

    public interface OnWordClickListener {
        void onWordClick(int position, WorkCardModel word);
    }
    private OnWordClickListener listener;

    public WordCardAdapter(List<WorkCardModel> list,OnWordClickListener listener) {
        this.list = list;
        this.listener = listener;
    }

    public void setData(List<WorkCardModel> list) {
        this.list = list;
        notifyDataSetChanged();
    }
    public void revealWord(int position) {
        if (position >= 0 && position < list.size()) {
            list.get(position).setSelected(true);
            list.get(position).setCorrect(false);
            notifyItemChanged(position);
        }
    }

    public void revealCorrectPrefixWords(int correctPrefixCount) {
        for (int i = 0; i < list.size(); i++) {
            WorkCardModel word = list.get(i);
            if (i < correctPrefixCount) {
                word.setSelected(true);
                word.setCorrect(true);
            } else if (word.isCorrect()) {
                word.setSelected(false);
                word.setCorrect(false);
            }
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public WordCardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_word_card, parent, false);
        return new WordCardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull WordCardViewHolder holder, int position) {
        WorkCardModel currentWord = list.get(position);
            if (currentWord.isSelected()) {
                if (currentWord.isCorrect()) {
                    holder.tvWord.setBackgroundResource(R.drawable.bg_word_correct);
                    holder.tvWord.setTextColor(android.graphics.Color.parseColor("#FFFFFF"));
                } else {
                    holder.tvWord.setBackgroundResource(R.drawable.bg_card_white);
                    holder.tvWord.setTextColor(android.graphics.Color.parseColor("#1A1A1A"));
                }
                holder.tvWord.setText(currentWord.getWord());
            }
            else{
                holder.tvWord.setBackgroundResource(R.drawable.bg_word_hidden);
                String hiddenText = currentWord.getWord().replaceAll("[a-zA-Z0-9]", "*");
                holder.tvWord.setText(hiddenText);
                holder.tvWord.setTextColor(android.graphics.Color.parseColor("#999999"));
            }
            holder.tvWord.setOnClickListener(v -> {
                if(!currentWord.isSelected()){
                    listener.onWordClick(position,currentWord);
                }
            });
    }

    @Override
    public int getItemCount() {
        if (list != null) {
            return list.size();
        }
        return 0;
    }

    public class WordCardViewHolder extends RecyclerView.ViewHolder {

        public WordCardViewHolder(@NonNull View itemView) {
            super(itemView);
            this.tvWord = itemView.findViewById(R.id.tvWord);
        }
        TextView tvWord;
    }


}
