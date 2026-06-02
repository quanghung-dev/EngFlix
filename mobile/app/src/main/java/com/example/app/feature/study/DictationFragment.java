package com.example.app.feature.study;

import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.app.R;
import com.example.app.adapter.dictation.SentenceAdapter;
import com.example.app.adapter.dictation.WordCardAdapter;
import com.example.app.adapter.dictation.WorkCardModel;
import com.example.app.data.remote.model.request.progress.CreateProgressRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.bookmarks.BookmarksModel;
import com.example.app.data.remote.model.response.bookmarks.noteResponse;
import com.example.app.data.remote.model.response.progress.ProgressResponse;
import com.example.app.data.remote.model.response.transcriptBookmarks.TranscriptBookmarksResponse;
import com.example.app.data.remote.model.response.transcriptProgress.TranscriptProgressResponse;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.example.app.data.repository.BookMarksRepository;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.data.repository.TranscriptBookmarksRepository;
import com.example.app.data.repository.TranscriptProgressRepository;
import com.example.app.data.repository.TranscriptsRepository;
import com.example.app.diaglog.SpoilerWarning;
import com.example.app.utils.BaseCallback;
import com.example.app.utils.YouTubeWebViewManager;
import com.google.android.flexbox.FlexDirection;
import com.google.android.flexbox.FlexWrap;
import com.google.android.flexbox.FlexboxLayoutManager;
import com.google.android.flexbox.JustifyContent;
import java.util.ArrayList;
import java.util.List;

public class DictationFragment extends Fragment {
    private TranscriptProgressRepository transcriptProgressRepository;
    private boolean isCurrentSentenceBookmarked = false;
    private BookMarksRepository bookMarksRepository;
    private TranscriptBookmarksRepository transcriptBookmarksRepository;
    private Button btnKiemTra;
    private ImageButton btnBookmark;
    private YouTubeWebViewManager youTubeWebViewManager;
    private LinearLayout layoutButtonBottom;
    private ImageButton btnPrevious;
    private ImageButton btnNext;
    private ImageButton btnReplay2;
    private ImageButton btnPlay;
    private int lessonId;
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
    private noteResponse currentNoteResponse = null;
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
    private ProgressRepository progressRepository;

    @Nullable
    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater,
            @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState
    ) {

        View view = inflater.inflate(R.layout.fragment_dictation, container, false);
        transcriptProgressRepository = new TranscriptProgressRepository(requireContext());
        bookMarksRepository = new BookMarksRepository(requireContext());
        transcriptBookmarksRepository = new TranscriptBookmarksRepository(requireContext());
        transcriptsRepository = new TranscriptsRepository(requireContext());
        progressRepository = new ProgressRepository(requireContext());
        layoutButtonBottom = view.findViewById(R.id.layoutButtonBottom);
        btnPrevious = view.findViewById(R.id.btnPrevious);
        btnNext = view.findViewById(R.id.btnNext);
        btnBookmark = view.findViewById(R.id.btnBookmark);
        btnReplay2 = view.findViewById(R.id.btnReplay2);
        btnPlay = view.findViewById(R.id.btnPlay);
        btnKiemTra = view.findViewById(R.id.btnKiemTra);
        vietnamese = view.findViewById(R.id.vietnamese);
        toolbarTitle = view.findViewById(R.id.tvToolbarTitle);
        toolbarProgress = view.findViewById(R.id.tvProgress);
        timer = view.findViewById(R.id.tvTimer);
        webViewYoutube = view.findViewById(R.id.webViewYoutube);
        youTubeWebViewManager = new YouTubeWebViewManager(webViewYoutube);
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
            lessonId = getArguments().getInt("lessonId",-1);
            toolbarTitle.setText(lessonTitle);
            toolbarProgress.setText("0% hoàn thành");

            youTubeWebViewManager.setupYoutubeWebView(requireContext(), lessonVideoUrl);
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
                    fetchTranscriptProgress(lessonId);
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
        checkBookmarkState();
    }
    public void fetchTranscriptProgress(int lessonId){
        transcriptProgressRepository.getTranscriptProgress(lessonId, new BaseCallback<ApiResponse<List<TranscriptProgressResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<TranscriptProgressResponse>> data) {
                if (data != null && data.getData() != null) {
                    List<Integer> completedIds = new ArrayList<>();
                    for (TranscriptProgressResponse response : data.getData()) {
                        completedIds.add(response.getTranscriptId());
                    }
                    if (sentenceAdapter != null) {
                        sentenceAdapter.setCompletedTranscripts(completedIds);
                    }
                }

            }
            @Override
            public void onError(String message) {
                Log.e("DictationFragment", "Lỗi tải dữ liệu: " + message);
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        stopStudyTime();
        cancelAutoStop();
        if (youTubeWebViewManager != null) {
            youTubeWebViewManager.destroy();
        }
        webViewYoutube = null;
    }

    public void setupListeners(){
        btnClose.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (youTubeWebViewManager != null) {
                    youTubeWebViewManager.stopVideo();
                }
                Navigation.findNavController(v).popBackStack();
            }
        });

        btnStart.setOnClickListener(v -> {
            btnStart.setVisibility(View.GONE);
            layoutButtonBottom.setVisibility(View.VISIBLE);
            etInput.setEnabled(true);
        });

        btnPrevious.setOnClickListener(v -> {
            if (listTranscripts != null && currentSentenceIndex > 0) {
                currentSentenceIndex--;
                prepareCurrentSentence();
                replayCurrentSentence();
                btnKiemTra.setText("Kiểm tra");
            }
        });

        btnNext.setOnClickListener(v -> {
            if (listTranscripts != null && currentSentenceIndex < listTranscripts.size() - 1) {
                currentSentenceIndex++;
                prepareCurrentSentence();
                replayCurrentSentence();
                btnKiemTra.setText("Kiểm tra");
            }
        });

        btnSpeed.setOnClickListener(v -> {
            speedIndex = (speedIndex + 1) % SPEED_LEVELS.length;
            currentSpeed = SPEED_LEVELS[speedIndex];
            tvSpeed.setText(currentSpeed + "x");
            changeVideoSpeed(currentSpeed);
        });
        btnBookmark.setOnClickListener(v -> {
            if (listTranscripts == null || listTranscripts.isEmpty() || currentSentenceIndex >= listTranscripts.size()) {
                Toast.makeText(requireContext(), "Không có dữ liệu câu để tạo ghi chú!", Toast.LENGTH_SHORT).show();
                return;
            }
            TranscriptsResponse currentTranscript = listTranscripts.get(currentSentenceIndex);
            Bundle bundle = new Bundle();
            if(isCurrentSentenceBookmarked && currentNoteResponse != null){
                bundle.putString("content", currentNoteResponse.getContent());
                bundle.putString("phonetic", currentNoteResponse.getPhonetic() != null ? currentNoteResponse.getPhonetic() : "");
                bundle.putString("note", currentNoteResponse.getNote());
                bundle.putInt("transcriptId", currentTranscript.getId());

                try{
                    Navigation.findNavController(v).navigate(R.id.action_DictationFragment_to_editNoteFragment, bundle);
                }catch (IllegalArgumentException e){
                    android.util.Log.e("DictationFragment", "Lỗi chuyển màn hình Edit: " + e.getMessage());
                }

            } else {
                bundle.putInt("lessonId", lessonId);
                bundle.putInt("transcriptId", currentTranscript.getId());
                bundle.putString("sentenceEn", currentTranscript.getContent());
                bundle.putString("sentenceVi", currentTranscript.getVietnamese());
                try{
                    Navigation.findNavController(v).navigate(R.id.action_DictationFragment_to_addNoteFragment, bundle);
                }catch (IllegalArgumentException e){
                    android.util.Log.e("DictationFragment", "Lỗi chuyển màn hình Add: " + e.getMessage());
                }
            }
        });
        btnReplay.setOnClickListener(v -> {
            replayCurrentSentence();
            btnPlaysentenceState = true;
            btnKiemTra.setText("Kiểm tra");

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
        btnKiemTra.setOnClickListener(v -> {
            checkAnswer(etInput.getText().toString());
        });

    }

    public void changeVideoSpeed(float speed) {
        youTubeWebViewManager.changeSpeed(speed);
    }

    public void replayCurrentSentence() {
        if (listTranscripts == null || listTranscripts.isEmpty() || currentSentenceIndex >= listTranscripts.size()) {
            return;
        }
        cancelAutoStop();

        float startTimestamp = listTranscripts.get(currentSentenceIndex).getStartTimestamp();

        youTubeWebViewManager.seekTo(startTimestamp);
        youTubeWebViewManager.playVideo();
    }

    private void toggleVideoPlayback() {
        if (btnPlaysentenceState) {
            youTubeWebViewManager.pauseVideo();
        } else {
            youTubeWebViewManager.playVideo();
        }

        btnPlaysentenceState = !btnPlaysentenceState;
        if (btnPlaysentenceState) {
            btnPlaySentence.setImageResource(R.drawable.ic_pause);
        } else {
            btnPlaySentence.setImageResource(R.drawable.ic_play_filled);
        }
    }

    public void checkAnswer(String userInput) {
        if (listTranscripts == null || currentSentenceIndex >= listTranscripts.size()) {
            return;
        };

        String correctAnswer = listTranscripts.get(currentSentenceIndex).getContent();
        String normalizedInput = normalizeSentence(userInput);
        String normalizedTarget = normalizeSentence(correctAnswer);
        int correctPrefixCount = countCorrectPrefixWords(normalizedInput, normalizedTarget);
        if (wordCardAdapter != null) {
            wordCardAdapter.revealCorrectPrefixWords(correctPrefixCount);
        }

        if(normalizedInput.equalsIgnoreCase(normalizedTarget)){
            etInput.setEnabled(false);
            if( currentSentenceIndex != listTranscripts.size() - 1){
                btnKiemTra.setText("Chính xác!");
                transcriptProgressRepository.createTranscriptProgress(lessonId, listTranscripts.get(currentSentenceIndex).getId(), new BaseCallback<ApiResponse<TranscriptProgressResponse>>() {
                    @Override
                    public void onSuccess(ApiResponse<TranscriptProgressResponse> data) {
                        Log.d("DictationFragment", "gửi api progress thành công ");
                        if (sentenceAdapter != null) {
                            sentenceAdapter.addCompletedTranscript(listTranscripts.get(currentSentenceIndex).getId());
                        }
                    }

                    @Override
                    public void onError(String message) {
                        Log.e("DictationFragment", "Lỗi tải dữ liệu: " + message);
                    }
                });
                btnKiemTra.setOnClickListener(v -> {
                     currentSentenceIndex++;
                     prepareCurrentSentence();
                     replayCurrentSentence();
                    btnKiemTra.setText("Kiểm tra");
                    btnKiemTra.setOnClickListener(view -> checkAnswer(etInput.getText().toString()));
                    progressRepository.createProgress(new CreateProgressRequest(lessonId,(int) elapsedSeconds,Boolean.FALSE),new BaseCallback<ApiResponse<ProgressResponse>>(){
                         @Override
                         public void onSuccess(ApiResponse<ProgressResponse> data) {
                             android.util.Log.d("DictationFragment", "gửi api progress thành công ");
                         }

                         @Override
                         public void onError(String message) {
                             android.util.Log.d("DictationFragment", "gửi api progress thất bại ");
                         }
                     });
                });

            }
            else {
                btnKiemTra.setText("Hoàn thành!");
                stopStudyTime();
                int duration = (int) elapsedSeconds;
                progressRepository.createProgress(new CreateProgressRequest(lessonId,duration,Boolean.TRUE),new BaseCallback<ApiResponse<ProgressResponse>>() {
                    @Override
                    public void onSuccess(ApiResponse<ProgressResponse> data) {
                        android.util.Log.d("DictationFragment", "gửi api progress thành công ");
                    }

                    @Override
                    public void onError(String message) {
                        android.util.Log.d("DictationFragment", "gửi api progress thất bại ");
                    }
                });
                btnKiemTra.setOnClickListener(v -> {
                    Navigation.findNavController(requireView())
                            .navigate(R.id.action_DictationFragment_to_progressFragment);
                });

            }
            isWaitingForNext = true;
            etInput.setEnabled(false);

        }
        else {
            btnKiemTra.setText("Sai! Thử lại");
        }
    }

    private String normalizeSentence(String sentence) {
        if (sentence == null) {
            return "";
        }
        return sentence.trim().replaceAll("\\s+", " ");
    }

    private int countCorrectPrefixWords(String normalizedInput, String normalizedTarget) {
        if (normalizedInput.isEmpty() || normalizedTarget.isEmpty()) {
            return 0;
        }

        String[] inputWords = normalizedInput.split("\\s+");
        String[] targetWords = normalizedTarget.split("\\s+");
        int correctPrefixCount = 0;
        int maxComparableWords = Math.min(inputWords.length, targetWords.length);
        for (int i = 0; i < maxComparableWords; i++) {
            if (!inputWords[i].equalsIgnoreCase(targetWords[i])) {
                break;
            }
            correctPrefixCount++;
        }
        return correctPrefixCount;
    }

    public void seekVideoTo(float seconds) {
        youTubeWebViewManager.seekTo(seconds);
        youTubeWebViewManager.playVideo();
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
    private void checkBookmarkState(){
        if (listTranscripts == null || listTranscripts.isEmpty() || currentSentenceIndex >= listTranscripts.size()) {
            return;
        }
        int currentTranscriptId = listTranscripts.get(currentSentenceIndex).getId();
        bookMarksRepository.getBookmarks(lessonId, null, null,new BaseCallback<ApiResponse<List<BookmarksModel>>>() {
            @Override
            public void onSuccess(ApiResponse<List<BookmarksModel>> data) {
                isCurrentSentenceBookmarked = false;
                currentNoteResponse = null;
                if (data != null && data.getData() != null) {
                    for (BookmarksModel model : data.getData()) {
                        if (model.getTranscripts() != null) {
                            for (noteResponse note : model.getTranscripts()) {
                                if (note.getTranscriptId() == currentTranscriptId) {
                                    isCurrentSentenceBookmarked = true;
                                    currentNoteResponse = note;
                                    break;
                                }
                            }
                        }
                        if (isCurrentSentenceBookmarked) break;
                    }
                }
                updateBookmarkButtonUI();
            }

            @Override
            public void onError(String message) {
                isCurrentSentenceBookmarked = false;
                currentNoteResponse = null;
                updateBookmarkButtonUI();
            }
        });
    }
    private void updateBookmarkButtonUI(){
        if (isCurrentSentenceBookmarked) {
            btnBookmark.setImageResource(R.drawable.ic_bookmark_filled_yellow);
        } else {
            btnBookmark.setImageResource(R.drawable.ic_bookmark);
        }
    }
}
