package com.example.app.utils;

public interface BaseCallback<T> {
    void onSuccess(T data);
    void onError(String message);
}
