package com.example.app.feature.study;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.dictation.SentenceAdapter;
import com.example.app.adapter.pronunciation.ItemPronunciationAdapter;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.example.app.data.repository.PronunciationRepository;
import com.example.app.data.repository.TranscriptProgressRepository;
import com.example.app.data.repository.TranscriptsRepository;
import com.example.app.utils.YouTubeWebViewManager;

import java.util.ArrayList;
import java.util.List;

public class ListeningFragment extends Fragment {
    private ImageButton btnPrevious;
    private ImageButton btnNext;
    private ImageButton btnMic;
    private PronunciationRepository pronunciationRepository;
    private ItemPronunciationAdapter itemPronunciationAdapter;
    private SentenceAdapter sentenceAdapter;
    private YouTubeWebViewManager youTubeWebViewManager;
    private List<TranscriptsResponse> listTranscripts = new ArrayList<>();
    private TranscriptsRepository transcriptsRepository;
    private int lessonId = -1;
    private String lessonTitle;
    private String lessonVideoUrl;
    private int lessonDuration;
    private String lessonLevel;
    private ImageButton btnClose;
    private TextView tvToolbarTitle;
    private TextView tvProgress;
    private TextView tvTimer;
    private WebView webViewYoutube;
    private RecyclerView rvSentenceNumbers;
    private RecyclerView rvItemCard;
    private Button btnStart;
    private View layoutButtonBottom;
    private int currentSentenceIndex = 0;


    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_listening, container, false);
        btnPrevious = view.findViewById(R.id.btnPrevious);
        btnNext = view.findViewById(R.id.btnNext);
        btnMic = view.findViewById(R.id.btnMic);
        pronunciationRepository = new PronunciationRepository(requireContext());
        transcriptsRepository =new TranscriptsRepository(requireContext());
        btnClose = view.findViewById(R.id.btnClose);
        btnClose.setOnClickListener(v -> {
            Navigation.findNavController(v).popBackStack();
        });
        tvToolbarTitle = view.findViewById(R.id.tvToolbarTitle);
        tvProgress = view.findViewById(R.id.tvProgress);
        tvTimer = view.findViewById(R.id.tvTimer);
        webViewYoutube = view.findViewById(R.id.webViewYoutube);
        rvSentenceNumbers = view.findViewById(R.id.rvSentenceNumbers);
        youTubeWebViewManager = new YouTubeWebViewManager(webViewYoutube);
        rvItemCard = view.findViewById(R.id.rvItemCard);
        btnStart = view.findViewById(R.id.btnStart);
        layoutButtonBottom = view.findViewById(R.id.layoutButtonBottom);
        btnStart.setOnClickListener(v -> {
            btnStart.setVisibility(View.GONE);
            layoutButtonBottom.setVisibility(View.VISIBLE);
        });
        btnPrevious.setOnClickListener(v -> {
            selectSentence(currentSentenceIndex - 1);
        });
        btnNext.setOnClickListener(v -> {
            selectSentence(currentSentenceIndex + 1);
        });

        LinearLayoutManager layoutManager1 = new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false);
        sentenceAdapter = new SentenceAdapter(listTranscripts, new SentenceAdapter.OnItemClickListener(){
            @Override
            public void onItemClick(int position) {
                selectSentence(position);
            }
        });
        LinearLayoutManager layoutManager2 = new LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false);
        rvItemCard.setLayoutManager(layoutManager2);
        itemPronunciationAdapter = new ItemPronunciationAdapter(listTranscripts, new ItemPronunciationAdapter.OnItemClickListener(){
            @Override
            public void onItemClick(int position) {
                selectSentence(position);
            }
        });
        if(getArguments() != null){
            lessonId = getArguments().getInt("lessonId");
            lessonTitle = getArguments().getString("lessonTitle");
            lessonVideoUrl = getArguments().getString("lessonVideoUrl");
            lessonDuration = getArguments().getInt("lessonDuration");
            lessonLevel = getArguments().getString("lessonLevel");
            tvToolbarTitle.setText(lessonTitle);
            tvProgress.setText("0% hoàn thành");

            if(lessonId != -1){
             fetchTranscripts(lessonId);
            }
            else{
                android.util.Log.e("DictationFragment", "LỖI: Không nhận được lessonId từ màn hình trước!");
            }
            youTubeWebViewManager.setupYoutubeWebView(requireContext(),lessonVideoUrl);
        }
        rvSentenceNumbers.setLayoutManager(layoutManager1);
        rvSentenceNumbers.setAdapter(sentenceAdapter);
        rvItemCard.setAdapter(itemPronunciationAdapter);
        return view;
    }
    public void fetchTranscripts(int lessonId){
        transcriptsRepository.getTranscripts(lessonId, new TranscriptsRepository.TranscriptsCallback(){
            @Override
            public void onSuccess(List<TranscriptsResponse> data) {
                listTranscripts.clear();
                listTranscripts.addAll(data);
                sentenceAdapter.setData(listTranscripts);
                sentenceAdapter.setSelectedPosition(currentSentenceIndex);
                itemPronunciationAdapter.notifyDataSetChanged();
                itemPronunciationAdapter.setSelectedPosition(currentSentenceIndex);
                selectSentence(0);
            }
            @Override
            public void onError(String message) {
                Log.e("DictationFragment", "Lỗi tải dữ liệu: " + message);
            }
        });
    }
    public void selectSentence(int position){
        if(position < 0 || position >= listTranscripts.size()){
         return;
        }
        currentSentenceIndex = position;
        sentenceAdapter.setSelectedPosition(position);
        itemPronunciationAdapter.setSelectedPosition(position);
        rvSentenceNumbers.smoothScrollToPosition(position);
        rvItemCard.smoothScrollToPosition(position);
    }



}
