package com.example.app.adapter.note;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.bookmarks.BookmarksModel;
import com.example.app.data.remote.model.response.bookmarks.noteResponse;

import java.util.List;

public class ListNoteAdapter extends RecyclerView.Adapter<ListNoteAdapter.ListNoteViewHolder> {
    private List<BookmarksModel> bookmarksModels;
    private OnNoteClickListener listener;

    public interface OnNoteClickListener {
        void onNoteClick(int position, noteResponse note);
        void onDeleteClick(int position);
    }

    public ListNoteAdapter(List<BookmarksModel> bookmarksModels, OnNoteClickListener listener) {
        this.bookmarksModels = bookmarksModels;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ListNoteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.fragment_my_notes_section, parent, false);
        return new ListNoteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ListNoteViewHolder holder, int position) {
        BookmarksModel currentBookmark = bookmarksModels.get(position);
        holder.tv_lesson_title.setText(currentBookmark.getLessonTitle());
        holder.tv_note_count.setText(currentBookmark.getTranscripts().size() + " ghi chú");
        holder.tv_badge.setText(String.valueOf(currentBookmark.getTranscripts().size()));
        ItemNoteAdapter itemNoteAdapter = new ItemNoteAdapter(currentBookmark.getTranscripts(),new ItemNoteAdapter.OnNoteClickListener () {
            @Override
            public void onNoteClick(int position, noteResponse note) {
                if (listener != null) {
                    listener.onNoteClick(position, note);
                }
            }

            @Override
            public void onDeleteClick(int position, noteResponse note) {
                if (listener != null) {
                    listener.onDeleteClick(position);
                }
            }
        });
        holder.rv_bookmarks.setAdapter(itemNoteAdapter);


    }

    @Override
    public int getItemCount() {
        if (bookmarksModels != null) {
            return bookmarksModels.size();
        }
        return 0;
    }

    public class ListNoteViewHolder extends RecyclerView.ViewHolder {
        public ListNoteViewHolder(@NonNull View itemView) {
            super(itemView);
            tv_lesson_title = itemView.findViewById(R.id.tv_lesson_title);
            tv_note_count = itemView.findViewById(R.id.tv_note_count);
            tv_badge = itemView.findViewById(R.id.tv_badge);
            rv_bookmarks = itemView.findViewById(R.id.rv_bookmarks);
            LinearLayoutManager layoutManager = new LinearLayoutManager(itemView.getContext(), LinearLayoutManager.VERTICAL, false);
            rv_bookmarks.setLayoutManager(layoutManager);

        }
        TextView tv_lesson_title;
        TextView tv_note_count;
        TextView tv_badge;
        RecyclerView rv_bookmarks;

    }
}
