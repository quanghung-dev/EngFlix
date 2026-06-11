package com.example.app.adapter.vocabulary;

import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;

import java.util.ArrayList;
import java.util.List;

public class EditItemsAdapter extends RecyclerView.Adapter<EditItemsAdapter.EditItemViewHolder> {
    private final List<EditableVocabularyItem> items = new ArrayList<>();

    public void setData(List<VocaItemsResponse> vocaItems) {
        items.clear();
        if (vocaItems != null) {
            for (VocaItemsResponse item : vocaItems) {
                items.add(new EditableVocabularyItem(item));
            }
        }
        notifyDataSetChanged();
    }

    public void addEmptyItem() {
        items.add(new EditableVocabularyItem(0, "", ""));
        notifyItemInserted(items.size() - 1);
    }

    public List<EditableVocabularyItem> getItems() {
        return items;
    }

    @NonNull
    @Override
    public EditItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_edit_items, parent, false);
        return new EditItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull EditItemViewHolder holder, int position) {
        holder.bind(items.get(position));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    public static class EditableVocabularyItem {
        private final int id;
        private final Integer lessonId;
        private final Integer transcriptId;
        private final String exampleSentence;
        private final String note;
        private String term;
        private String definition;

        EditableVocabularyItem(int id, String term, String definition) {
            this.id = id;
            this.lessonId = null;
            this.transcriptId = null;
            this.exampleSentence = null;
            this.note = null;
            this.term = term == null ? "" : term;
            this.definition = definition == null ? "" : definition;
        }

        EditableVocabularyItem(VocaItemsResponse item) {
            this.id = item.getId();
            this.lessonId = item.getLesson_id() > 0 ? item.getLesson_id() : null;
            this.transcriptId = item.getTranscript_id() > 0 ? item.getTranscript_id() : null;
            this.exampleSentence = item.getExample_sentence();
            this.note = item.getNote();
            this.term = item.getPhrase() == null ? "" : item.getPhrase();
            this.definition = item.getMeaning() == null ? "" : item.getMeaning();
        }

        public int getId() {
            return id;
        }

        public String getTerm() {
            return term;
        }

        public String getDefinition() {
            return definition;
        }

        public Integer getLessonId() {
            return lessonId;
        }

        public Integer getTranscriptId() {
            return transcriptId;
        }

        public String getExampleSentence() {
            return exampleSentence;
        }

        public String getNote() {
            return note;
        }
    }

    static class EditItemViewHolder extends RecyclerView.ViewHolder {
        private final EditText edtTerm;
        private final EditText edtDefinition;
        private TextWatcher termWatcher;
        private TextWatcher definitionWatcher;

        EditItemViewHolder(@NonNull View itemView) {
            super(itemView);
            edtTerm = itemView.findViewById(R.id.edtTerm);
            edtDefinition = itemView.findViewById(R.id.edtDefinition);
        }

        void bind(EditableVocabularyItem item) {
            if (termWatcher != null) {
                edtTerm.removeTextChangedListener(termWatcher);
            }
            if (definitionWatcher != null) {
                edtDefinition.removeTextChangedListener(definitionWatcher);
            }

            edtTerm.setText(item.term);
            edtDefinition.setText(item.definition);

            termWatcher = new SimpleTextWatcher() {
                @Override
                public void afterTextChanged(Editable editable) {
                    item.term = editable.toString();
                }
            };
            definitionWatcher = new SimpleTextWatcher() {
                @Override
                public void afterTextChanged(Editable editable) {
                    item.definition = editable.toString();
                }
            };

            edtTerm.addTextChangedListener(termWatcher);
            edtDefinition.addTextChangedListener(definitionWatcher);
        }
    }

    private abstract static class SimpleTextWatcher implements TextWatcher {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {
        }
    }
}
