package com.example.app.adapter.dictation;

public class WorkCardModel {
    private String word;
    private boolean isSelected;
    private boolean isCorrect;
    private boolean isIncorrect;

    public WorkCardModel(String word, boolean isSelected) {
        this.word = word;
        this.isSelected = isSelected;
        this.isCorrect = false;
        this.isIncorrect = false;
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

    public boolean isIncorrect() {
        return isIncorrect;
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

    public void setIncorrect(boolean incorrect) {
        isIncorrect = incorrect;
    }
}
