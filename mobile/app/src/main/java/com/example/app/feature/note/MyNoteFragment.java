package com.example.app.feature.note;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.note.ListNoteAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.bookmarks.BookmarksModel;
import com.example.app.data.remote.model.response.bookmarks.BookmarksResponse;
import com.example.app.data.remote.model.response.bookmarks.noteResponse;
import com.example.app.data.repository.BookMarksRepository;
import com.example.app.data.repository.TranscriptBookmarksRepository;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.List;

public class MyNoteFragment extends Fragment {
    private ListNoteAdapter adapter;
    private List<BookmarksModel> bookmarksModels = new ArrayList<>();
    private BookMarksRepository bookMarksRepository;
    private Toolbar toolbar;
    private EditText et_search;
    private RecyclerView rv_sections;
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_my_notes, container, false);
        bookMarksRepository = new BookMarksRepository(requireContext());
        toolbar = view.findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        et_search = view.findViewById(R.id.et_search);
        LinearLayoutManager layoutManager = new LinearLayoutManager(getContext(), LinearLayoutManager.VERTICAL, false);
        rv_sections = view.findViewById(R.id.rv_sections);
        rv_sections.setLayoutManager(layoutManager);
        adapter = new ListNoteAdapter(bookmarksModels, new ListNoteAdapter.OnNoteClickListener() {
            @Override
            public void onNoteClick(int lessonPosition, int notePosition, noteResponse note) {
                Bundle bundle = new Bundle();
                bundle.putInt("transcriptId", note.getTranscriptId());
                bundle.putString("note", note.getNote());
                bundle.putString("content", note.getContent());
                bundle.putString("phonetic", note.getPhonetic());
                bundle.putString("vietnamese", note.getVietnamese());
                Navigation.findNavController(view).navigate(R.id.action_DictationFragment_to_editNoteFragment, bundle);
            }

            @Override
            public void onDeleteClick(int lessonPosition, int notePosition, noteResponse note) {
                removeNote(lessonPosition, notePosition, note);
            }
        });
        fetchData();
        rv_sections.setAdapter(adapter);
        return view;
    }
    public void fetchData(){
        bookMarksRepository.getBookmarks(null,null, null, new BaseCallback<ApiResponse<List<BookmarksModel>>>() {
            @Override
            public void onSuccess(ApiResponse<List<BookmarksModel>> data) {
                if (data.getData() != null) {
                    bookmarksModels.clear();
                    bookmarksModels.addAll(data.getData());
                    adapter.notifyDataSetChanged();
                }
            }
            @Override
            public void onError(String message) {
                Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
            }
        });
    }
    public void removeNote(int lessonPosition, int notePosition, noteResponse note) {
        bookMarksRepository.deleteBookmark(note.getTranscriptId(), new BaseCallback<ApiResponse<BookmarksResponse>>() {
            @Override
            public void onSuccess(ApiResponse<BookmarksResponse> data) {
                Toast.makeText(requireContext(), "Xóa ghi chú thành công", Toast.LENGTH_SHORT).show();
                if (lessonPosition >= 0 && lessonPosition < bookmarksModels.size()) {
                    BookmarksModel lesson = bookmarksModels.get(lessonPosition);
                    if (lesson.getTranscripts() != null && notePosition >= 0
                            && notePosition < lesson.getTranscripts().size()) {
                        lesson.getTranscripts().remove(notePosition);
                        if (lesson.getTranscripts().isEmpty()) {
                            bookmarksModels.remove(lessonPosition);
                            adapter.notifyItemRemoved(lessonPosition);
                            adapter.notifyItemRangeChanged(lessonPosition, bookmarksModels.size());
                        } else {
                            adapter.notifyItemChanged(lessonPosition);
                        }
                    }
                }
            }

            @Override
            public void onError(String message) {
                Log.e("Error", message);
                Toast.makeText(requireContext(), "Lỗi xóa ghi chú", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

