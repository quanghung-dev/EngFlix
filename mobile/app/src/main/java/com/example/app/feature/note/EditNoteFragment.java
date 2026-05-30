package com.example.app.feature.note;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.app.R;
import com.example.app.data.remote.model.request.note.UpdateNoteRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.bookmarks.BookmarksResponse;
import com.example.app.data.repository.BookMarksRepository;
import com.example.app.utils.BaseCallback;

public class EditNoteFragment extends Fragment {
    private BookMarksRepository bookMarksRepository;
    private TextView tv_content;
    private TextView tv_phonetic;
    private EditText et_note;
    private TextView btn_update;
    private TextView btn_delete;
    private int TranscriptId;
    private Toolbar toolbar;
    private UpdateNoteRequest request;

    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_edit_note, container, false);
        bookMarksRepository = new BookMarksRepository(requireContext());
        tv_content = view.findViewById(R.id.tv_content);
        tv_phonetic = view.findViewById(R.id.tv_phonetic);
        et_note = view.findViewById(R.id.et_note);
        btn_update = view.findViewById(R.id.btn_update);
        btn_delete = view.findViewById(R.id.btn_delete);
        toolbar = view.findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        Bundle bundle = getArguments();
        if(bundle != null){
            String content = bundle.getString("content");
            String phonetic = bundle.getString("phonetic");
            String note = bundle.getString("note");
            tv_content.setText(content);
            tv_phonetic.setText(phonetic);
            et_note.setText(note);
            TranscriptId = bundle.getInt("transcriptId");
            btn_delete.setOnClickListener(v -> {
                deleteNote();
            });
            btn_update.setOnClickListener(v -> {
                updateNote();
            });
        }
        return view;
    }
    public void updateNote(){
        String note = et_note.getText().toString().trim();
        if(note.isEmpty()){
            Toast.makeText(requireContext(), "Vui lòng nhập nội dung ghi chú!", Toast.LENGTH_SHORT).show();
            return;
        }
        request = new UpdateNoteRequest(note);
        bookMarksRepository.updateBookmark(TranscriptId,request,new BaseCallback<ApiResponse<BookmarksResponse>>() {
            @Override
            public void onSuccess(ApiResponse<BookmarksResponse> data) {
                Toast.makeText(requireContext(), "Cập nhật ghi chú thành công", Toast.LENGTH_SHORT).show();
                Navigation.findNavController(getView()).popBackStack();
            }
            @Override
            public void onError(String message) {
                Toast.makeText(requireContext(), "Cập nhật ghi chú thất bại: " + message, Toast.LENGTH_SHORT).show();
            }
        });


    }
    public void deleteNote(){
        bookMarksRepository.deleteBookmark(TranscriptId,new BaseCallback<ApiResponse<BookmarksResponse>>(){
            @Override
            public void onSuccess(ApiResponse<BookmarksResponse> data) {
                Toast.makeText(requireContext(), "Xóa ghi chú thành công", Toast.LENGTH_SHORT).show();
                Navigation.findNavController(getView()).popBackStack();
            }

            @Override
            public void onError(String message) {
                Toast.makeText(requireContext(), "Xóa ghi chú thất bại: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }

}
