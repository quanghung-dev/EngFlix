package com.example.app.data.remote.model.response.progress;

import com.google.gson.annotations.SerializedName;

public class ProgressSumarysResponse {
    @SerializedName("completed")
    private int completed;
    @SerializedName("uncompleted")
    private int uncompleted;
    public int getCompleted() {
        return completed;
    }
    public int getUncompleted() {
        return uncompleted;
    }

}
