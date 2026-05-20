package com.example.app.adapter.dictation;

public class WorkCardModel {
    private String word;
    private boolean isSelected;

    public WorkCardModel(String word, boolean isSelected) {
        this.word = word;
        this.isSelected = isSelected;
    }

    public String getWord() {
        return word;
    }

    public boolean isSelected() {
        return isSelected;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public void setSelected(boolean selected) {
        isSelected = selected;
    }
}
