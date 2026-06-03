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
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.example.app.data.repository.TranscriptProgressRepository;
import com.example.app.data.repository.TranscriptsRepository;
import com.example.app.utils.YouTubeWebViewManager;

import java.util.ArrayList;
import java.util.List;

public class ListeningFragment extends Fragment {
    private SentenceAdapter sentenceAdapter;
    private YouTubeWebViewManager youTubeWebViewManager;
    private List<TranscriptsResponse> listTranscripts = new ArrayList<>();
    private TranscriptsRepository transcriptsRepository;
    private int lessonId = -1;
    private String lessonTitle;
    private String lessonDescription;
    private String lessonThumbnailUrl;
    private String lessonVideoUrl;
    private int lessonDuration;
    private String lessonLevel;
    private ImageButton btnClose;
    private TextView tvToolbarTitle;
    private TextView tvProgress;
    private TextView tvTimer;
    private WebView webViewYoutube;
    private RecyclerView rvSentenceNumbers;
    private ImageButton ivnumerical;
    private ImageButton btnPlaySentence;
    private ImageButton btnReplay;
    private ImageButton btnBookmark;
    private ImageButton btnFlag;
    private RecyclerView rvWordCards;
    private TextView vietnamese;
    private Button btnStart;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_listening, container, false);

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
        ivnumerical = view.findViewById(R.id.ivnumerical);
        btnPlaySentence = view.findViewById(R.id.btnPlaySentence);
        btnReplay = view.findViewById(R.id.btnReplay);
        btnBookmark = view.findViewById(R.id.btnBookmark);
        btnFlag = view.findViewById(R.id.btnFlag);
        rvWordCards = view.findViewById(R.id.rvWordCards);
        vietnamese = view.findViewById(R.id.vietnamese);
        btnStart = view.findViewById(R.id.btnStart);
        youTubeWebViewManager = new YouTubeWebViewManager(webViewYoutube);
        LinearLayoutManager layoutManager = new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false);
        sentenceAdapter = new SentenceAdapter(listTranscripts, new SentenceAdapter.OnItemClickListener(){
            @Override
            public void onItemClick(int position) {

            }
        });
        if(getArguments() != null){
            lessonId = getArguments().getInt("lessonId");
            lessonTitle = getArguments().getString("lessonTitle");
            lessonDescription = getArguments().getString("lessonDescription");
            lessonThumbnailUrl = getArguments().getString("lessonThumbnailUrl");
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
        rvSentenceNumbers.setLayoutManager(layoutManager);
        rvSentenceNumbers.setAdapter(sentenceAdapter);
        return view;
    }
    public void fetchTranscripts(int lessonId){
        transcriptsRepository.getTranscripts(lessonId, new TranscriptsRepository.TranscriptsCallback(){
            @Override
            public void onSuccess(List<TranscriptsResponse> data) {
                listTranscripts.clear();
                listTranscripts.addAll(data);
                sentenceAdapter.notifyDataSetChanged();
            }
            @Override
            public void onError(String message) {
                Log.e("DictationFragment", "Lỗi tải dữ liệu: " + message);
            }
        });
    }



}
