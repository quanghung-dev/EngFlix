package com.example.app.diaglog;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

import com.example.app.R;

public class SpoilerWarning extends DialogFragment {
    private Button btnCancel;
    private Button btnContinue;

    public interface OnWarningDialogListener {
        void onContinueClicked();
        void onCancelClicked();
    }
    private OnWarningDialogListener listener;
    public void setListener(OnWarningDialogListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        if (getDialog() != null && getDialog().getWindow() != null) {
            getDialog().getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        }
        return inflater.inflate(R.layout.dialog_spoiler_warning, container, false);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getDialog() != null && getDialog().getWindow() != null) {
            getDialog().getWindow().setBackgroundDrawableResource(android.R.color.transparent);

            int width = (int) (getResources().getDisplayMetrics().widthPixels * 0.90);
            getDialog().getWindow().setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT);
        }
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        btnCancel = view.findViewById(R.id.btnCancel);
        btnContinue = view.findViewById(R.id.btnContinue);
        btnCancel.setOnClickListener(v -> {
            if (listener != null) {
                listener.onCancelClicked();
            }
            dismiss();
        });
        btnContinue.setOnClickListener(v -> {
            if (listener != null) {
                listener.onContinueClicked();
            }
            dismiss();
        });

    }

}
