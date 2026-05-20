package com.example.app.feature.study;

import com.example.app.data.remote.model.response.lessons.LessonsResponse;

import java.util.List;

public class LessonSection {
    private int idCategory;
    private String categoryName;
    private int totalLessons;
    List<LessonsResponse> lesssons;

    public LessonSection(int idCategory,String categoryName, int totalLessons, List<LessonsResponse> lesssons) {
        this.idCategory = idCategory;
        this.categoryName = categoryName;
        this.totalLessons = totalLessons;
        this.lesssons = lesssons;
    }

    public int getIdCategory() {
        return idCategory;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public int getTotalLessons() {
        return totalLessons;
    }

    public List<LessonsResponse> getLesssons() {
        return lesssons;
    }
}
