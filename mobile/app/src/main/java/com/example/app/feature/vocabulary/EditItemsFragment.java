package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatImageButton;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.vocabulary.EditItemsAdapter;
import com.example.app.data.remote.model.request.vocaDecks.AddItemsToDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.UpdateDeckRequest;
import com.example.app.data.remote.model.request.vocaDecks.UpdateVocaItemRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class EditItemsFragment extends Fragment {
    public static final String REQUEST_EDIT_ITEMS_SAVED = "edit_items_saved";

    private EditItemsAdapter editItemsAdapter;
    private VocabularyRepository vocabularyRepository;
    private int deckId = -1;
    private String deckName = "";
    private String deckDescription = "";
    private String deckLevel = "";
    private String deckThumbnailUrl = "";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_edit_items, container, false);

        AppCompatImageButton btnBack = view.findViewById(R.id.btnBack);
        AppCompatImageButton btnConfirm = view.findViewById(R.id.btnConfirm);
        FloatingActionButton fabAddTerm = view.findViewById(R.id.fabAddTerm);
        EditText edtTitle = view.findViewById(R.id.edtTitle);
        RecyclerView rvTerms = view.findViewById(R.id.rvTerms);

        readArguments();
        vocabularyRepository = new VocabularyRepository(requireContext());
        editItemsAdapter = new EditItemsAdapter();
        rvTerms.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvTerms.setAdapter(editItemsAdapter);

        if (!isBlank(deckName)) {
            edtTitle.setText(deckName);
        }

        btnBack.setOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        btnConfirm.setOnClickListener(v -> saveChanges(edtTitle, btnConfirm));
        fabAddTerm.setOnClickListener(v -> {
            editItemsAdapter.addEmptyItem();
            rvTerms.smoothScrollToPosition(Math.max(0, editItemsAdapter.getItemCount() - 1));
        });

        fetchTerms();
        return view;
    }

    private void readArguments() {
        Bundle bundle = getArguments();
        if (bundle == null) {
            return;
        }
        deckId = bundle.getInt("deckId", -1);
        deckName = bundle.getString("deckName", "");
        deckDescription = bundle.getString("deckDescription", "");
        deckLevel = bundle.getString("deckLevel", "");
        deckThumbnailUrl = bundle.getString("deckThumbnailUrl", "");
    }

    private void saveChanges(EditText edtTitle, AppCompatImageButton btnConfirm) {
        String title = edtTitle.getText().toString().trim();
        if (deckId <= 0) {
            Toast.makeText(requireContext(), "Không tìm thấy bộ từ vựng", Toast.LENGTH_SHORT).show();
            return;
        }
        if (title.isEmpty()) {
            edtTitle.setError("Vui lòng nhập tiêu đề");
            return;
        }

        List<EditItemsAdapter.EditableVocabularyItem> itemsToSave = new ArrayList<>();
        for (EditItemsAdapter.EditableVocabularyItem item : editItemsAdapter.getItems()) {
            String term = item.getTerm().trim();
            String definition = item.getDefinition().trim();
            boolean isEmptyNewItem = item.getId() <= 0 && term.isEmpty() && definition.isEmpty();
            if (isEmptyNewItem) {
                continue;
            }
            if (term.isEmpty()) {
                Toast.makeText(requireContext(), "Vui lòng nhập thuật ngữ", Toast.LENGTH_SHORT).show();
                return;
            }
            if (definition.isEmpty()) {
                Toast.makeText(requireContext(), "Vui lòng nhập định nghĩa", Toast.LENGTH_SHORT).show();
                return;
            }
            itemsToSave.add(item);
        }

        btnConfirm.setEnabled(false);
        SaveTracker tracker = new SaveTracker(1 + itemsToSave.size(), btnConfirm, title);
        UpdateDeckRequest deckRequest = new UpdateDeckRequest(
                title,
                emptyToNull(deckDescription),
                emptyToNull(deckLevel),
                emptyToNull(deckThumbnailUrl)
        );
        vocabularyRepository.updateDeck(deckId, deckRequest, new BaseCallback<ApiResponse<VocaDecksResponse>>() {
            @Override
            public void onSuccess(ApiResponse<VocaDecksResponse> data) {
                tracker.markSuccess();
            }

            @Override
            public void onError(String message) {
                tracker.markError("Lỗi lưu tiêu đề: " + message);
            }
        });

        for (EditItemsAdapter.EditableVocabularyItem item : itemsToSave) {
            if (item.getId() > 0) {
                updateExistingItem(item, tracker);
            } else {
                addNewItem(item, tracker);
            }
        }
    }

    private void updateExistingItem(EditItemsAdapter.EditableVocabularyItem item, SaveTracker tracker) {
        String term = item.getTerm().trim();
        String definition = item.getDefinition().trim();
        UpdateVocaItemRequest request = new UpdateVocaItemRequest(
                item.getLessonId(),
                item.getTranscriptId(),
                term,
                normalize(term),
                definition,
                emptyToNull(item.getExampleSentence()),
                emptyToNull(item.getNote())
        );
        vocabularyRepository.updateItem(deckId, item.getId(), request, new BaseCallback<ApiResponse<VocaItemsResponse>>() {
            @Override
            public void onSuccess(ApiResponse<VocaItemsResponse> data) {
                tracker.markSuccess();
            }

            @Override
            public void onError(String message) {
                tracker.markError("Lỗi lưu thuật ngữ: " + message);
            }
        });
    }

    private void addNewItem(EditItemsAdapter.EditableVocabularyItem item, SaveTracker tracker) {
        String term = item.getTerm().trim();
        String definition = item.getDefinition().trim();
        AddItemsToDeckRequest request = new AddItemsToDeckRequest(
                null,
                null,
                term,
                normalize(term),
                definition,
                definition,
                null
        );
        vocabularyRepository.addVocaItemToDeck(deckId, request, new BaseCallback<ApiResponse<VocaItemsResponse>>() {
            @Override
            public void onSuccess(ApiResponse<VocaItemsResponse> data) {
                tracker.markSuccess();
            }

            @Override
            public void onError(String message) {
                tracker.markError("Lỗi thêm thuật ngữ: " + message);
            }
        });
    }

    private void fetchTerms() {
        if (deckId == -1) {
            Toast.makeText(requireContext(), "Không tìm thấy bộ từ vựng", Toast.LENGTH_SHORT).show();
            return;
        }

        vocabularyRepository.getVocabularyItemsByDeckId(deckId, new BaseCallback<ApiResponse<List<VocaItemsResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<VocaItemsResponse>> data) {
                if (!isAdded()) {
                    return;
                }
                editItemsAdapter.setData(data == null ? null : data.getData());
            }

            @Override
            public void onError(String message) {
                if (!isAdded()) {
                    return;
                }
                Toast.makeText(requireContext(), "Lỗi tải thuật ngữ: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String emptyToNull(String value) {
        return isBlank(value) ? null : value;
    }

    private class SaveTracker {
        private final int total;
        private final AppCompatImageButton btnConfirm;
        private final String savedTitle;
        private int completed = 0;
        private boolean failed = false;

        SaveTracker(int total, AppCompatImageButton btnConfirm, String savedTitle) {
            this.total = total;
            this.btnConfirm = btnConfirm;
            this.savedTitle = savedTitle;
        }

        void markSuccess() {
            if (failed) {
                return;
            }
            completed++;
            if (completed == total) {
                Bundle result = new Bundle();
                result.putString("deckName", savedTitle);
                getParentFragmentManager().setFragmentResult(REQUEST_EDIT_ITEMS_SAVED, result);
                Toast.makeText(requireContext(), "Đã lưu học phần", Toast.LENGTH_SHORT).show();
                Navigation.findNavController(requireView()).popBackStack();
            }
        }

        void markError(String message) {
            if (failed) {
                return;
            }
            failed = true;
            btnConfirm.setEnabled(true);
            Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
        }
    }
}
