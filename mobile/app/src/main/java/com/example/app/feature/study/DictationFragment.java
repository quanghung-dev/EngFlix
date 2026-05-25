package com.example.app.feature.study;

import android.os.Bundle;
import android.os.Handler;
import android.transition.TransitionManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.dictation.SentenceAdapter;
import com.example.app.adapter.dictation.WordCardAdapter;
import com.example.app.adapter.dictation.WorkCardModel;
import com.example.app.data.remote.api.TranscriptsApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.example.app.data.remote.model.response.transcripts.WordCardResponse;
import com.example.app.data.repository.TranscriptsRepository;
import com.example.app.diaglog.SpoilerWarning;
import com.google.android.flexbox.FlexDirection;
import com.google.android.flexbox.FlexWrap;
import com.google.android.flexbox.FlexboxItemDecoration;
import com.google.android.flexbox.FlexboxLayout;
import com.google.android.flexbox.FlexboxLayoutManager;
import com.google.android.flexbox.JustifyContent;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;

public class DictationFragment extends Fragment {
    private LinearLayout layoutButtonBottom;
    private ImageButton btnPrevious;
    private ImageButton btnNext;
    private ImageButton btnReplay2;
    private ImageButton btnPlay;
    private TranscriptsRepository transcriptsRepository;
    private List<TranscriptsResponse> listTranscripts = new ArrayList<>();
    private int currentSentenceIndex = 0;
    private SentenceAdapter sentenceAdapter;
    private WordCardAdapter wordCardAdapter;
    private List<WorkCardModel> listWordCards = new ArrayList<>();
    private boolean showdiaglogwarning = false;
    private TextView toolbarTitle;
    private TextView toolbarProgress;
    private TextView timer;
    private WebView webViewYoutube;
    private ImageButton btnClose ;
    private TextView vietnamese;
    private EditText etInput;
    private Button btnStart;
    private LinearLayout btnSpeed;
    private TextView tvSpeed;
    private ImageButton btnReplay;
    private ImageButton btnPlaySentence;
    private androidx.appcompat.widget.SwitchCompat switchAutoStop;
    private RecyclerView rvSentenceNumbers;
    private RecyclerView rvWordCards;

    private boolean isPlaying = false;
    private static final float[] SPEED_LEVELS = {0.25f, 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f};
    private int speedIndex = 3;
    private float currentSpeed = 1.0f;
    private boolean isWaitingForNext = false;
    private boolean btnPlaysentenceState = false;
    private long elapsedSeconds = 0;
    private Handler timerHandler = new Handler();
    private Handler autoStopHandler = new Handler();
    private Runnable timerRunnable;
    private Runnable autoStopRunnable;



    @Nullable
    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater,
            @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState
    ) {

        View view = inflater.inflate(R.layout.fragment_dictation, container, false);

        transcriptsRepository = new TranscriptsRepository(requireContext());
        layoutButtonBottom = view.findViewById(R.id.layoutButtonBottom);
        btnPrevious = view.findViewById(R.id.btnPrevious);
        btnNext = view.findViewById(R.id.btnNext);
        btnReplay2 = view.findViewById(R.id.btnReplay2);
        btnPlay = view.findViewById(R.id.btnPlay);
        vietnamese = view.findViewById(R.id.vietnamese);
        toolbarTitle = view.findViewById(R.id.tvToolbarTitle);
        toolbarProgress = view.findViewById(R.id.tvProgress);
        timer = view.findViewById(R.id.tvTimer);
        webViewYoutube = view.findViewById(R.id.webViewYoutube);
        btnClose = view.findViewById(R.id.btnClose);
        etInput = view.findViewById(R.id.etInput);
        btnStart = view.findViewById(R.id.btnStart);
        btnSpeed = view.findViewById(R.id.btnSpeed);
        tvSpeed = view.findViewById(R.id.tvSpeed);
        btnReplay = view.findViewById(R.id.btnReplay);
        btnPlaySentence = view.findViewById(R.id.btnPlaySentence);
        switchAutoStop = view.findViewById(R.id.switchAutoStop);
        rvSentenceNumbers = view.findViewById(R.id.rvSentenceNumbers);
        rvWordCards = view.findViewById(R.id.rvWordCards);
        rvSentenceNumbers.setLayoutManager(new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false));
        FlexboxLayoutManager flexboxLayoutManager = new FlexboxLayoutManager(requireContext());
        flexboxLayoutManager.setFlexDirection(FlexDirection.ROW);
        flexboxLayoutManager.setFlexWrap(FlexWrap.WRAP);
        flexboxLayoutManager.setJustifyContent(JustifyContent.FLEX_START);
        rvWordCards.setLayoutManager(flexboxLayoutManager);
        sentenceAdapter = new SentenceAdapter(listTranscripts, new SentenceAdapter.OnItemClickListener() {
            @Override
            public void onItemClick(int position) {
                currentSentenceIndex = position;
                prepareCurrentSentence();
                replayCurrentSentence();
            }
        });
        rvSentenceNumbers.setAdapter(sentenceAdapter);
        wordCardAdapter = new WordCardAdapter(listWordCards,new WordCardAdapter.OnWordClickListener(){
            @Override
            public void onWordClick(int position, WorkCardModel word) {
                if (showdiaglogwarning) {
                    wordCardAdapter.revealWord(position);
                } else {
                    showSpoilerWarningDialog(position);
                }
            }
        });
        rvWordCards.setAdapter(wordCardAdapter);
        etInput.setEnabled(false);
        setupListeners();
        studyTime();

        if (getArguments() != null) {

            String lessonTitle = getArguments().getString("lessonTitle");
            String lessonVideoUrl = getArguments().getString("lessonVideoUrl");
            int lessonDuration = getArguments().getInt("lessonDuration");
            int lessonId = getArguments().getInt("lessonId",-1);
            toolbarTitle.setText(lessonTitle);
            toolbarProgress.setText("0% hoàn thành");

            setupYoutubeWebView(lessonVideoUrl);
            if (lessonId != -1) {
                fetchTranscripts(lessonId);
            } else {
                android.util.Log.e("DictationFragment", "LỖI: Không nhận được lessonId từ màn hình trước!");
            }
        }
        return view;
    }
    public void fetchTranscripts(int lessonId) {
        android.util.Log.d("DictationFragment", "Bắt đầu gọi API lấy transcript với lessonId = " + lessonId);

        transcriptsRepository.getTranscripts(lessonId, new TranscriptsRepository.TranscriptsCallback() {
            @Override
            public void onSuccess(List<TranscriptsResponse> data) {
                if (data != null && !data.isEmpty()) {
                    android.util.Log.d("DictationFragment", "Gọi API thành công! Số lượng câu: " + data.size());
                    listTranscripts = data;
                    sentenceAdapter.setData(listTranscripts);
                    currentSentenceIndex = 0;
                    prepareCurrentSentence();
                } else {
                    android.util.Log.e("DictationFragment", "API gọi thành công nhưng danh sách Transcript bị NULL hoặc RỖNG!");
                    Toast.makeText(requireContext(), "Không có dữ liệu bài học (Data rỗng)", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onError(String message) {
                android.util.Log.e("DictationFragment", "Lỗi API tải transcript: " + message);
                Toast.makeText(requireContext(), "Lỗi tải dữ liệu: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }
    public  void prepareCurrentSentence(){
        if(listTranscripts != null && !listTranscripts.isEmpty() && currentSentenceIndex >= listTranscripts.size()){
            return;
        }
        showdiaglogwarning = false;
        if (sentenceAdapter != null) {
            sentenceAdapter.setSelectedPosition(currentSentenceIndex);
        }
        TranscriptsResponse transcriptsResponse = listTranscripts.get(currentSentenceIndex);
        String sentenceContent = transcriptsResponse.getContent().trim();
        String[] words = sentenceContent.split("\\s+");
        listWordCards.clear();
        for (String word :words){
            WorkCardModel workCardModel = new WorkCardModel(word,false);
            listWordCards.add(workCardModel);
        }
        if (wordCardAdapter == null){
            wordCardAdapter = new WordCardAdapter(listWordCards,new WordCardAdapter.OnWordClickListener(){
                @Override
                public void onWordClick(int position, WorkCardModel word) {
                    if (showdiaglogwarning) {
                        wordCardAdapter.revealWord(position);
                    } else {
                        showSpoilerWarningDialog(position);
                    }
                }
            });
            rvWordCards.setAdapter(wordCardAdapter);
            wordCardAdapter.notifyDataSetChanged();
        }
        else{
            wordCardAdapter.setData(listWordCards);
            wordCardAdapter.notifyDataSetChanged();
        }
        etInput.setText("");
        etInput.setBackgroundResource(R.drawable.bg_input_box);
        int progress = (currentSentenceIndex * 100) / listTranscripts.size();
        toolbarProgress.setText(progress + "% hoàn thành");
        if (rvSentenceNumbers != null) {
            rvSentenceNumbers.smoothScrollToPosition(currentSentenceIndex);
        }
    }

    private void setupYoutubeWebView(String lessonVideoUrl) {

        if (lessonVideoUrl == null || lessonVideoUrl.isEmpty()) {
            return;
        }


        WebSettings settings = webViewYoutube.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        String defaultUA = settings.getUserAgentString();
        String fakedUA = defaultUA.replace("; wv", "");
        settings.setUserAgentString(fakedUA);

        webViewYoutube.setWebChromeClient(new WebChromeClient());
        webViewYoutube.setWebViewClient(new WebViewClient());

        String embedUrl = lessonVideoUrl;

        if (embedUrl.startsWith("http://")) {
            embedUrl = embedUrl.replaceFirst("http://", "https://");
        }

        if (embedUrl.contains("watch?v=")) {
            embedUrl = embedUrl.replace("watch?v=", "embed/");
        } else if (embedUrl.contains("youtu.be/")) {
            embedUrl = "https://www.youtube.com/embed/"
                    + embedUrl.substring(
                    embedUrl.lastIndexOf("/") + 1
            );
        }

        embedUrl = embedUrl.replace(
                "youtube.com",
                "youtube-nocookie.com"
        );

        String appOrigin = "https://" + requireContext().getPackageName();

        String youtubeParams =
                "controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=" + appOrigin;

        if (embedUrl.contains("?")) {
            embedUrl += "&" + youtubeParams;
        } else {
            embedUrl += "?" + youtubeParams;
        }

        String html =
                "<!DOCTYPE html>" +
                        "<html style='margin:0;padding:0;height:100%;'>" +
                        "<body style='margin:0;padding:0;height:100%;background:#000;'>" +
                        "<iframe width='100%' height='100%' " +
                        "style='display:block;' " +
                        "src='" + embedUrl + "' " +
                        "allow='autoplay; encrypted-media; fullscreen' " +
                        "referrerpolicy='strict-origin-when-cross-origin' " +
                        "frameborder='0' allowfullscreen>" +
                        "</iframe>" +
                        "</body></html>";

        webViewYoutube.loadDataWithBaseURL(
                appOrigin,
                html,
                "text/html",
                "utf-8",
                null
        );
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        stopStudyTime();
        cancelAutoStop();
        if (webViewYoutube != null) {
            webViewYoutube.loadUrl("about:blank");
            webViewYoutube.onPause();
            webViewYoutube.removeAllViews();
            webViewYoutube.destroy();
            webViewYoutube = null;
        }
    }

    public void setupListeners(){
        btnClose.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (webViewYoutube != null) {
                    webViewYoutube.loadUrl("about:blank");
                    webViewYoutube.onPause();
                }
                Navigation.findNavController(v).popBackStack();
            }
        });

        btnStart.setOnClickListener(v -> {
            btnStart.setVisibility(View.GONE);
            layoutButtonBottom.setVisibility(View.VISIBLE);
        });

        btnPrevious.setOnClickListener(v -> {
            if (listTranscripts != null && currentSentenceIndex > 0) {
                currentSentenceIndex--;
                prepareCurrentSentence();
                replayCurrentSentence();
            }
        });

        btnNext.setOnClickListener(v -> {
            if (listTranscripts != null && currentSentenceIndex < listTranscripts.size() - 1) {
                currentSentenceIndex++;
                prepareCurrentSentence();
                replayCurrentSentence();
            }
        });

        btnSpeed.setOnClickListener(v -> {
            speedIndex = (speedIndex + 1) % SPEED_LEVELS.length;
            currentSpeed = SPEED_LEVELS[speedIndex];
            tvSpeed.setText(currentSpeed + "x");
            changeVideoSpeed(currentSpeed);
        });


        btnReplay.setOnClickListener(v -> {
            replayCurrentSentence();
            btnPlaysentenceState = true;

        });

        btnPlaySentence.setOnClickListener(v -> {
            toggleVideoPlayback();
        });

        btnReplay2.setOnClickListener(v -> {
            replayCurrentSentence();
            btnPlaysentenceState = true;
        });

        btnPlay.setOnClickListener(v -> {
            toggleVideoPlayback();
        });

    }

    public void changeVideoSpeed(float speed) {
        if (webViewYoutube != null) {
            String jsCommand = "javascript:(function() { " +
                    "var iframe = document.querySelector('iframe'); " +
                    "if(iframe && iframe.contentWindow) { " +
                    "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'setPlaybackRate', args: [" + speed + "]}), '*'); " +
                    "} " +
                    "})()";
            webViewYoutube.evaluateJavascript(jsCommand, null);
        }
    }

    public void replayCurrentSentence() {
        if (listTranscripts == null || listTranscripts.isEmpty() || currentSentenceIndex >= listTranscripts.size()) {
            return;
        }
        cancelAutoStop();

        float startTimestamp = listTranscripts.get(currentSentenceIndex).getStartTimestamp();

        if (webViewYoutube != null) {
            String jsCommand = "javascript:(function() { " +
                    "var iframe = document.querySelector('iframe'); " +
                    "if(iframe && iframe.contentWindow) { " +
                    "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'seekTo', args: [" + startTimestamp + ", true]}), '*'); " +
                    "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideo', args: []}), '*'); " +
                    "} " +
                    "})()";
            webViewYoutube.evaluateJavascript(jsCommand, null);
        }
    }

    private void toggleVideoPlayback() {
        if (webViewYoutube != null) {
            String action = btnPlaysentenceState ? "pauseVideo" : "playVideo";

            String jsCommand = "javascript:(function() { " +
                    "var iframe = document.querySelector('iframe'); " +
                    "if(iframe && iframe.contentWindow) { " +
                    "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: '" + action + "', args: []}), '*'); " +
                    "} " +
                    "})()";

            webViewYoutube.evaluateJavascript(jsCommand, null);

            btnPlaysentenceState = !btnPlaysentenceState;
            if (btnPlaysentenceState) {
                btnPlaySentence.setImageResource(R.drawable.ic_pause);
            } else {
                btnPlaySentence.setImageResource(R.drawable.ic_play_filled);
            }
        }
    }

    public void checkAnswer(String userInput) {

        if (listTranscripts == null || currentSentenceIndex >= listTranscripts.size()) {
            return;
        };

        String correctAnswer = listTranscripts.get(currentSentenceIndex).getContent();
        String normalizedInput = userInput.replaceAll("\\s+", " ");
        String normalizedTarget = correctAnswer.replaceAll("\\s+", " ");

        if(normalizedInput.equalsIgnoreCase(normalizedTarget)){
            if( currentSentenceIndex != listTranscripts.size() - 1){
            btnStart.setText("Chính xác! Câu tiếp theo");}
            else {
                btnStart.setText("Hoàn thành! Xem kết quả");
            }
            isWaitingForNext = true;
            etInput.setEnabled(false);

        }
        else {
            btnStart.setText("Sai! Thử lại");
        }
    }

    public void seekVideoTo(float seconds) {
        if (webViewYoutube != null) {
            String jsCommand = "javascript:(function() { " +
                    "var iframe = document.querySelector('iframe'); " +
                    "if(iframe && iframe.contentWindow) { " +
                    "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'seekTo', args: [" + seconds + ", true]}), '*'); " +
                    "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideo', args: []}), '*'); " +
                    "} " +
                    "})()";
            webViewYoutube.evaluateJavascript(jsCommand, null);
        }
    }

    public int dpToPx(int dp) {
        float density = requireContext().getResources().getDisplayMetrics().density;
        return Math.round((float) dp * density);
    }

    private void showSpoilerWarningDialog(int position) {
        SpoilerWarning dialog = new SpoilerWarning();
        dialog.setListener(new SpoilerWarning.OnWarningDialogListener() {
            @Override
            public void onContinueClicked() {
                showdiaglogwarning = true;
                if (wordCardAdapter != null) {
                    wordCardAdapter.revealWord(position);
                }
            }
            @Override
            public void onCancelClicked() {
            }
        });
        dialog.show(getChildFragmentManager(), "SpoilerWarningDialog");
    }

    public void studyTime(){
        timerRunnable = new Runnable() {
            @Override
            public void run() {
                elapsedSeconds++;
                int minutes = (int) (elapsedSeconds / 60);
                int seconds = (int) (elapsedSeconds % 60);
                timer.setText(String.format("%02d:%02d", minutes, seconds));
                timerHandler.postDelayed(timerRunnable,1000);
            }

        };
        timerHandler.postDelayed(timerRunnable,1000);
    }

    public void stopStudyTime(){
        if(timerHandler != null && timerRunnable != null){
          timerHandler.removeCallbacks(timerRunnable);
        };
    }

    public void cancelAutoStop(){
        if (autoStopHandler != null && autoStopRunnable != null) {
            autoStopHandler.removeCallbacks(autoStopRunnable);
        }
    }
}