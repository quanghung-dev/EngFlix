package com.example.app.feature.note;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.widget.Toolbar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.app.R;
import com.example.app.data.remote.model.request.bookmarks.CreateBookMarksRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.bookmarks.BookmarksResponse;
import com.example.app.data.repository.BookMarksRepository;
import com.example.app.utils.BaseCallback;

public class AddNoteFragment extends Fragment {
    private BookMarksRepository bookMarksRepository;
    private TextView tvSentenceEn;
    private TextView tvSentenceVi;
    private EditText etNote;
    private TextView btnCreateNote;
    private Toolbar toolbar;

    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_add_note, container, false);
        bookMarksRepository = new BookMarksRepository(requireContext());
        tvSentenceEn = view.findViewById(R.id.tvSentenceEn);
        tvSentenceVi = view.findViewById(R.id.tvSentenceVi);
        btnCreateNote = view.findViewById(R.id.btnCreateNote);
        etNote = view.findViewById(R.id.etNote);
        toolbar = view.findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        Bundle bundle = getArguments();
        if (bundle != null) {
            Integer lessonId = bundle.getInt("lessonId");
            Integer transcriptId = bundle.getInt("transcriptId");
            String sentenceEn = bundle.getString("sentenceEn");
            String sentenceVi = bundle.getString("sentenceVi");
            tvSentenceEn.setText(sentenceEn);
            tvSentenceVi.setText(sentenceVi);
            btnCreateNote.setOnClickListener(v -> {
                String note = etNote.getText().toString().trim();
                if (note.isEmpty()) {
                    Toast.makeText(requireContext(), "Vui lòng nhập nội dung ghi chú!", Toast.LENGTH_SHORT).show();
                    return;
                }
                bookMarksRepository.createBookmark(lessonId, new CreateBookMarksRequest(transcriptId, note), new BaseCallback<ApiResponse<BookmarksResponse>>(){
                    @Override
                    public void onSuccess(ApiResponse<BookmarksResponse> data) {
                        Toast.makeText(requireContext(), "Thêm ghi chú thành công", Toast.LENGTH_SHORT).show();
                        Navigation.findNavController(v).popBackStack();
                    }
                    @Override
                    public void onError(String message) {
                        Toast.makeText(requireContext(), "Thêm ghi chú thất bại: " + message, Toast.LENGTH_SHORT).show();
                    }
                });
            });
        }
        return view;
    }
}
