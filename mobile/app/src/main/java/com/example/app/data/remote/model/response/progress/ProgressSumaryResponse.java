package com.example.app.data.remote.model.response.progress;

import com.google.gson.annotations.SerializedName;

public class ProgressSumaryResponse {
    @SerializedName("completed_count")
    private int completedCount;
    @SerializedName("unfinished_count")
    private int unfinishedCount;

    public int getCompletedCount() {
        return completedCount;
    }

    public int getUnfinishedCount() {
        return unfinishedCount;
    }
}
