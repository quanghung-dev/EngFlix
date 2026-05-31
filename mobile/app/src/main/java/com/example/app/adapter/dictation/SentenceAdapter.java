package com.example.app.adapter.dictation;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;

import java.util.ArrayList;
import java.util.List;

public class SentenceAdapter extends RecyclerView.Adapter<SentenceAdapter.SentenceViewHolder> {

    private List<TranscriptsResponse> list = new ArrayList<>();
    private List<Integer> completedTranscriptIds = new ArrayList<>();
    private int selectedPosition = 0;


    public interface OnItemClickListener {
        void onItemClick(int position);
    }
    private OnItemClickListener listener;
    public void setSelectedPosition(int position) {
        this.selectedPosition = position;
        notifyDataSetChanged();
    }

    public SentenceAdapter(List<TranscriptsResponse> newList, OnItemClickListener listener) {
        this.list = newList;
        this.listener = listener;
    }

    public void setData(List<TranscriptsResponse> newList) {
        this.list = newList;
        notifyDataSetChanged();
    }
    public void setCompletedTranscripts(List<Integer> completedIds){
        this.completedTranscriptIds = completedIds;
        notifyDataSetChanged();
    }
    public void addCompletedTranscript(int transcriptId) {
        if (!completedTranscriptIds.contains(transcriptId)) {
            completedTranscriptIds.add(transcriptId);
            notifyDataSetChanged();
        }
    }

    @NonNull
    @Override
    public SentenceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_sentence_number, parent, false);
        return new SentenceViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SentenceViewHolder holder, int position) {
        TranscriptsResponse currentSentence = list.get(position);
        holder.tvSentence.setText(String.valueOf(currentSentence.getSequence()));

        if (selectedPosition == position) {
            holder.tvSentence.setBackgroundResource(R.drawable.bg_icon_circle_blue);
            holder.tvSentence.setTextColor(android.graphics.Color.WHITE);
        } else if (completedTranscriptIds.contains(currentSentence.getId())) {
            holder.tvSentence.setBackgroundResource(R.drawable.bg_icon_circle_green);
            holder.tvSentence.setTextColor(android.graphics.Color.WHITE);
        } else {
            holder.tvSentence.setBackgroundResource(R.drawable.bg_circle_white);
            holder.tvSentence.setTextColor(android.graphics.Color.parseColor("#1A1A1A"));
        }
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(position);
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

    public class SentenceViewHolder extends RecyclerView.ViewHolder {
        public SentenceViewHolder(@NonNull View itemView) {
            super(itemView);
            this.tvSentence = itemView.findViewById(R.id.tvSentence);
        }
        TextView tvSentence;

    }


}
