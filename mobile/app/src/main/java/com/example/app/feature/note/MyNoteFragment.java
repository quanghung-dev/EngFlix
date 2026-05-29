package com.example.app.feature.note;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;

public class MyNoteFragment extends Fragment {
    private Toolbar toolbar;
    private EditText et_search;
    private RecyclerView rv_sections;
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_my_notes, container, false);
        toolbar = view.findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        et_search = view.findViewById(R.id.et_search);
        rv_sections = view.findViewById(R.id.rv_sections);
        return view;
    }
}

