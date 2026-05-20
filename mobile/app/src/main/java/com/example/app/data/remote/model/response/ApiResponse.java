package com.example.app.data.remote.model.response;

import com.google.gson.annotations.SerializedName;

public class ApiResponse<T> {
    @SerializedName("data")
    private T data;
    private MetaResponse meta;
    private ErrorResponse error;

    public T getData() {
        return data;
    }

    public MetaResponse getMeta() {
        return meta;
    }

    public ErrorResponse getError() {
        return error;
    }

    public static class MetaResponse{
        private int limit;
        private int page;
        private int total;
        @SerializedName("total_pages")
        private int totalPages;

        public int getLimit() {
            return limit;
        }
        public int getPage() {
            return page;
        }
        public int getTotal() {
            return total;
        }
        public int getTotalPages() {
            return totalPages;
        }
    }
    public static class ErrorResponse{
        private String message;
        private int code;

        public String getMessage() {
            return message;
        }
        public int getCode() {
            return code;
        }
    }


}
