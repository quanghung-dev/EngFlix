package com.example.app.adapter.dictation;

public class WorkCardModel {
    private String word;
    private boolean isSelected;
    private boolean isCorrect;

    public WorkCardModel(String word, boolean isSelected) {
        this.word = word;
        this.isSelected = isSelected;
        this.isCorrect = false;
    }

    public String getWord() {
        return word;
    }

    public boolean isSelected() {
        return isSelected;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public void setSelected(boolean selected) {
        isSelected = selected;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }
}
