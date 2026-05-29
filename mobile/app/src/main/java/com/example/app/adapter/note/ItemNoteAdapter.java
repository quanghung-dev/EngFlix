package com.example.app.adapter.note;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.app.R;
import com.example.app.data.remote.model.response.bookmarks.noteResponse;

import java.util.ArrayList;
import java.util.List;

public class ItemNoteAdapter extends RecyclerView.Adapter<ItemNoteAdapter.ItemNoteViewHolder> {
    private List<noteResponse> noteResponses = new ArrayList<>();
    private OnNoteClickListener listener;
    public interface OnNoteClickListener {
        void onNoteClick(int position, noteResponse note);
        void onDeleteClick(int position, noteResponse note);
    }

    public ItemNoteAdapter(List<noteResponse> noteResponses, OnNoteClickListener listener) {
        this.noteResponses = noteResponses;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ItemNoteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_transcript_bookmark, parent, false);
        return new ItemNoteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemNoteViewHolder holder, int position) {
        noteResponse currentNote = noteResponses.get(position);
        holder.tv_note.setText(currentNote.getNote());
        holder.tv_content.setText(currentNote.getContent());
        holder.tv_phonetic.setText(currentNote.getPhonetic());
        holder.tv_vietnamese.setText(currentNote.getVietnamese());
        holder.tv_created_at.setText(currentNote.getCreatedAt());

        holder.itemView.setOnClickListener(v -> {
            int currentPos = holder.getBindingAdapterPosition();
            if (currentPos != RecyclerView.NO_POSITION && listener != null) {
                listener.onNoteClick(currentPos, noteResponses.get(currentPos));
            }
        });

        holder.btn_delete.setOnClickListener(v -> {
            int currentPos = holder.getBindingAdapterPosition();
            if (currentPos != RecyclerView.NO_POSITION && listener != null) {
                listener.onDeleteClick(currentPos, noteResponses.get(currentPos));
            }
        });
    }

    @Override
    public int getItemCount() {
        if (noteResponses != null) {
            return noteResponses.size();
        }
        return 0;
    }

    public class ItemNoteViewHolder extends RecyclerView.ViewHolder {
        public ItemNoteViewHolder(@NonNull View itemView) {
            super(itemView);
            tv_note = itemView.findViewById(R.id.tv_note);
            tv_content = itemView.findViewById(R.id.tv_content);
            tv_phonetic = itemView.findViewById(R.id.tv_phonetic);
            tv_vietnamese = itemView.findViewById(R.id.tv_vietnamese);
            tv_created_at = itemView.findViewById(R.id.tv_created_at);
            btn_delete = itemView.findViewById(R.id.btn_delete);
        }
        TextView tv_note;
        TextView tv_content;
        TextView tv_phonetic;
        TextView tv_vietnamese;
        TextView tv_created_at;
        TextView btn_delete;
    }
}
