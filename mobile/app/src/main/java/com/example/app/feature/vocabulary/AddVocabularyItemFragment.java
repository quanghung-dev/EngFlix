package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.app.R;
import com.example.app.data.remote.model.request.vocaDecks.AddItemsToDeckRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;

import java.util.Locale;

public class AddVocabularyItemFragment extends Fragment {
    public static final String REQUEST_VOCABULARY_ITEM_CREATED = "vocabulary_item_created";

    private int deckId;
    private String deckName;
    private VocabularyRepository vocabularyRepository;
    private EditText edtPhrase;
    private EditText edtMeaning;
    private Button btnSaveVocabulary;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_add_vocabulary_item, container, false);
        ImageButton btnBack = view.findViewById(R.id.btnBack);
        TextView tvDeckName = view.findViewById(R.id.tvDeckName);
        edtPhrase = view.findViewById(R.id.edtPhrase);
        edtMeaning = view.findViewById(R.id.edtMeaning);
        btnSaveVocabulary = view.findViewById(R.id.btnSaveVocabulary);
        vocabularyRepository = new VocabularyRepository(requireContext());

        if (getArguments() != null) {
            deckId = getArguments().getInt("deckId", -1);
            deckName = getArguments().getString("deckName", "");
        }
        tvDeckName.setText(deckName);
        btnBack.setOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        btnSaveVocabulary.setOnClickListener(v -> saveVocabularyItem());
        return view;
    }

    private void saveVocabularyItem() {
        String phrase = edtPhrase.getText().toString().trim();
        String meaning = edtMeaning.getText().toString().trim();

        if (phrase.isEmpty()) {
            edtPhrase.setError("Vui lòng nhập từ vựng");
            return;
        }
        if (meaning.isEmpty()) {
            edtMeaning.setError("Vui lòng nhập nghĩa");
            return;
        }
        if (deckId <= 0) {
            Toast.makeText(requireContext(), "Không tìm thấy thư mục", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSaveVocabulary.setEnabled(false);
        String normalizedPhrase = phrase.toLowerCase(Locale.ROOT);
        AddItemsToDeckRequest request = new AddItemsToDeckRequest(
                null,
                null,
                phrase,
                normalizedPhrase,
                meaning,
                meaning,
                null
        );
        vocabularyRepository.addVocaItemToDeck(deckId, request, new BaseCallback<ApiResponse<VocaItemsResponse>>() {
            @Override
            public void onSuccess(ApiResponse<VocaItemsResponse> data) {
                getParentFragmentManager().setFragmentResult(REQUEST_VOCABULARY_ITEM_CREATED, new Bundle());
                Toast.makeText(requireContext(), "Đã lưu từ vựng", Toast.LENGTH_SHORT).show();
                Navigation.findNavController(requireView()).popBackStack();
            }

            @Override
            public void onError(String message) {
                btnSaveVocabulary.setEnabled(true);
                Toast.makeText(requireContext(), "Lỗi lưu từ vựng: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
