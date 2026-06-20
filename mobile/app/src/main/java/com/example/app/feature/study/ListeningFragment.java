package com.example.app.feature.study;

import android.Manifest;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.SwitchCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.dictation.SentenceAdapter;
import com.example.app.adapter.pronunciation.ItemPronunciationAdapter;
import com.example.app.data.remote.model.request.progress.CreateProgressRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.progress.ProgressResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationProgressResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationResponse;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.data.repository.PronunciationAttemptsRepository;
import com.example.app.data.repository.PronunciationProgressRepository;
import com.example.app.data.repository.TranscriptsRepository;
import com.example.app.utils.BaseCallback;
import com.example.app.utils.YouTubeWebViewManager;
import com.google.gson.Gson;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.List;

public class ListeningFragment extends Fragment {
    private List<TranscriptsResponse> listTranscripts = new ArrayList<>();
    private int quantityTranscripts = 0;
    private PronunciationAttemptsRepository pronunciationAttemptsRepository;
    private PronunciationProgressRepository pronunciationProgressRepository;
    private AudioRecord audioRecord;
    private Thread recordingThread;
    private AnimatorSet micPulseAnimator;
    private boolean isRecording = false;
    private SwitchCompat switchAutoStop;
    private File recordedAudioFile;
    private static final int SAMPLE_RATE = 16000;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    private ImageButton btnPrevious;
    private ImageButton btnNext;
    private ImageButton btnMic;
    private ItemPronunciationAdapter itemPronunciationAdapter;
    private SentenceAdapter sentenceAdapter;
    private YouTubeWebViewManager youTubeWebViewManager;

    private TranscriptsRepository transcriptsRepository;
    private int lessonId = -1;
    private String lessonTitle;
    private String lessonVideoUrl;
    private ImageButton btnClose;
    private TextView tvToolbarTitle;
    private TextView tvProgress;
    private WebView webViewYoutube;
    private RecyclerView rvSentenceNumbers;
    private RecyclerView rvItemCard;
    private Button btnStart;
    private LinearLayout btnSpeed;
    private TextView tvSpeed;
    private View layoutButtonBottom;
    private int currentSentenceIndex = 0;
    private ProgressRepository progressRepository;
    private List<Integer> completedIds = new ArrayList<>();
    private boolean pronunciationCompletedSent = false;
    private double progress = 0;
    private static final float[] SPEED_LEVELS = {0.25f, 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f};
    private int speedIndex = 3;
    private float currentSpeed = 1.0f;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_listening, container, false);
        pronunciationAttemptsRepository = new PronunciationAttemptsRepository(requireContext());
        pronunciationProgressRepository = new PronunciationProgressRepository(requireContext());
        progressRepository = new ProgressRepository(requireContext());
        btnPrevious = view.findViewById(R.id.btnPrevious);
        btnNext = view.findViewById(R.id.btnNext);
        btnMic = view.findViewById(R.id.btnMic);
        switchAutoStop = view.findViewById(R.id.switchAutoStop);
        pronunciationAttemptsRepository = new PronunciationAttemptsRepository(requireContext());
        transcriptsRepository =new TranscriptsRepository(requireContext());
        btnClose = view.findViewById(R.id.btnClose);
        btnClose.setOnClickListener(v -> {
            youTubeWebViewManager.stopVideo();
            Navigation.findNavController(v).popBackStack();

        });
        tvToolbarTitle = view.findViewById(R.id.tvToolbarTitle);
        tvProgress = view.findViewById(R.id.tvProgress);
        webViewYoutube = view.findViewById(R.id.webViewYoutube);
        rvSentenceNumbers = view.findViewById(R.id.rvSentenceNumbers);
        youTubeWebViewManager = new YouTubeWebViewManager(webViewYoutube);
        rvItemCard = view.findViewById(R.id.rvItemCard);
        btnStart = view.findViewById(R.id.btnStart);
        btnSpeed = view.findViewById(R.id.btnSpeed);
        tvSpeed = view.findViewById(R.id.tvSpeed);
        layoutButtonBottom = view.findViewById(R.id.layoutButtonBottom);
        switchAutoStop.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                selectSentence(currentSentenceIndex);
            } else {
                youTubeWebViewManager.cancelSegmentPlayback();
                youTubeWebViewManager.playVideo();
            }
        });
        btnSpeed.setOnClickListener(v -> showSpeedDropdown());

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
        btnMic.setOnClickListener(v -> {
            if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.RECORD_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 1001);
                return;
            }
            if (listTranscripts == null || listTranscripts.isEmpty()) {
                return;
            }
            TranscriptsResponse transcript = listTranscripts.get(currentSentenceIndex);
            String referenceText = transcript.getContent();
            if(isRecording){
                stopRecording();
            }else {
                startRecording();
            }
        });

        LinearLayoutManager layoutManager1 = new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false);
        sentenceAdapter = new SentenceAdapter(listTranscripts, new SentenceAdapter.OnItemClickListener(){
            @Override
            public void onItemClick(int position) {
                selectSentence(position);
                btnStart.setVisibility(View.GONE);
                layoutButtonBottom.setVisibility(View.VISIBLE);
            }
        });
        LinearLayoutManager layoutManager2 = new LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false);
        rvItemCard.setLayoutManager(layoutManager2);
        itemPronunciationAdapter = new ItemPronunciationAdapter(listTranscripts, new ItemPronunciationAdapter.OnItemClickListener(){
            @Override
            public void onItemClick(int position) {
                selectSentence(position);
                btnStart.setVisibility(View.GONE);
                layoutButtonBottom.setVisibility(View.VISIBLE);

            }
        });
        if(getArguments() != null){
            lessonId = getArguments().getInt("lessonId");
            lessonTitle = getArguments().getString("lessonTitle");
            lessonVideoUrl = getArguments().getString("lessonVideoUrl");
            tvToolbarTitle.setText(lessonTitle);


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
                quantityTranscripts = data.size();
                fetchPronunciationProgress(lessonId);
                selectSentence(0);
            }
            @Override
            public void onError(String message) {
                Log.e("DictationFragment", "Lỗi tải dữ liệu: " + message);
            }
        });
    }
    public void fetchPronunciationProgress(int lessonId){
        pronunciationProgressRepository.getPronunciationProgress(lessonId, new BaseCallback<ApiResponse<List<PronunciationProgressResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<PronunciationProgressResponse>> data) {
                if (data != null && data.getData() != null) {
                    itemPronunciationAdapter.setPronunciationProgressList(data.getData());
                    completedIds.clear();
                    for (PronunciationProgressResponse response : data.getData()) {
                        if (!completedIds.contains(response.getTranscriptId())) {
                            completedIds.add(response.getTranscriptId());
                            progress = completedIds.size()*100 / quantityTranscripts;
                            tvProgress.setText(String.format("%.2f", progress) + "% hoàn thành");
                        }
                    }
                    sentenceAdapter.setCompletedTranscripts(completedIds);
                }
            }

            @Override
            public void onError(String message) {
                Log.e("ListeningFragment", "Lỗi tải pronunciation progress: " + message);
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
        TranscriptsResponse transcript = listTranscripts.get(position);
        Float startTime = transcript.getStartTimestamp();
        Float endTime = transcript.getEndTimestamp();
        if (switchAutoStop.isChecked()){
            youTubeWebViewManager.playFromTo(startTime,endTime);
        } else {
            youTubeWebViewManager.cancelSegmentPlayback();
            youTubeWebViewManager.seekTo(startTime);
            youTubeWebViewManager.playVideo();
        }

    }

    public void changeVideoSpeed(float speed) {
        youTubeWebViewManager.changeSpeed(speed);
    }

    private void showSpeedDropdown() {
        LinearLayout container = new LinearLayout(requireContext());
        container.setOrientation(LinearLayout.VERTICAL);
        container.setBackgroundResource(R.drawable.bg_speed_dropdown);
        container.setPadding(dpToPx(6), dpToPx(6), dpToPx(6), dpToPx(6));

        PopupWindow popupWindow = new PopupWindow(
                container,
                dpToPx(112),
                ViewGroup.LayoutParams.WRAP_CONTENT,
                true
        );
        popupWindow.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        popupWindow.setOutsideTouchable(true);
        popupWindow.setElevation(dpToPx(8));

        for (int i = 0; i < SPEED_LEVELS.length; i++) {
            final int selectedIndex = i;
            TextView item = new TextView(requireContext());
            item.setText(formatSpeed(SPEED_LEVELS[i]));
            item.setTextSize(14);
            item.setGravity(Gravity.CENTER_VERTICAL);
            item.setPadding(dpToPx(12), dpToPx(9), dpToPx(12), dpToPx(9));
            item.setTextColor(Color.parseColor("#164F86"));
            if (selectedIndex == speedIndex) {
                item.setTextColor(Color.parseColor("#0B63B6"));
                item.setBackgroundResource(R.drawable.bg_speed_option_selected);
                item.setTypeface(item.getTypeface(), android.graphics.Typeface.BOLD);
            }
            item.setOnClickListener(v -> {
                setPlaybackSpeed(selectedIndex);
                popupWindow.dismiss();
            });
            container.addView(item, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
            ));
        }

        popupWindow.showAsDropDown(btnSpeed, 0, dpToPx(4));
    }

    private void setPlaybackSpeed(int selectedIndex) {
        speedIndex = selectedIndex;
        currentSpeed = SPEED_LEVELS[speedIndex];
        tvSpeed.setText(formatSpeed(currentSpeed));
        changeVideoSpeed(currentSpeed);
    }

    private String formatSpeed(float speed) {
        return speed + "x";
    }

    public int dpToPx(int dp) {
        float density = requireContext().getResources().getDisplayMetrics().density;
        return Math.round((float) dp * density);
    }

    @SuppressLint("MissingPermission")
    private void startRecording() {
        int bufferSize = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT
        );

        recordedAudioFile = new File(
                requireContext().getCacheDir(),
                "recording_" + System.currentTimeMillis() + ".wav"
        );

        audioRecord = new AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
        );

        isRecording = true;
        audioRecord.startRecording();
        setMicRecordingState(true);

        recordingThread = new Thread(() -> writeWavFile(recordedAudioFile, bufferSize));
        recordingThread.start();
    }
    private void stopRecording() {
        isRecording = false;
        setMicRecordingState(false);

        if (audioRecord != null) {
            audioRecord.stop();
        }

        try {
            if (recordingThread != null) {
                recordingThread.join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (audioRecord != null) {
            audioRecord.release();
            audioRecord = null;
        }

        recordingThread = null;
        long recordedFileSize = recordedAudioFile != null ? recordedAudioFile.length() : 0;
        int recordedMaxAmplitude = recordedAudioFile != null ? calculateMaxAmplitude(recordedAudioFile) : 0;
        Log.i("DictationFragment", "Recorded WAV fileSize=" + recordedFileSize + ", maxAmplitude=" + recordedMaxAmplitude);
        TranscriptsResponse transcript = listTranscripts.get(currentSentenceIndex);
        String referenceText = transcript.getContent();
        pronunciationAttemptsRepository.assessPronunciation(recordedAudioFile.getAbsoluteFile(),referenceText,lessonId,transcript.getId(),new BaseCallback<ApiResponse<PronunciationResponse>>() {
            @Override
            public void onSuccess(ApiResponse<PronunciationResponse> data) {
                sentenceAdapter.notifyItemChanged(currentSentenceIndex);
                itemPronunciationAdapter.notifyItemChanged(currentSentenceIndex);
                Log.d("DictationFragment", "Score: " + new Gson().toJson(data));
                pronunciationProgressRepository.updatePronunciationProgress(transcript.getId(), new BaseCallback<ApiResponse<PronunciationProgressResponse>>() {
                    @Override
                    public void onSuccess(ApiResponse<PronunciationProgressResponse> data) {
                        Log.d("DictationFragment", "Data: " + new Gson().toJson(data));
                        if (data != null && data.getData() != null) {
                            itemPronunciationAdapter.updatePronunciationProgress(data.getData());
                            sentenceAdapter.addCompletedTranscript(data.getData().getTranscriptId());
                            int transcriptId = data.getData().getTranscriptId();
                            if (!completedIds.contains(transcriptId)) {
                                completedIds.add(transcriptId);
                            }
                            progress = completedIds.size()*100 / quantityTranscripts;
                            tvProgress.setText(String.format("%.2f", progress) + "% hoàn thành");
                            sendPronunciationStatusAfterTranscript();
                        }


                        Log.d("DictationFragment", "Đã upadte dữ liệu");
                    }

                    @Override
                    public void onError(String message) {
                        Log.e("DictationFragment", "Lỗi tải dữ liệu: " + message);
                    }
                });
            }
            @Override
            public void onError(String message) {
                Log.e("DictationFragment", "Lỗi nhận phản hồi từ server: " + message);
            }
        });

    }

    private void sendPronunciationStatusAfterTranscript() {
        if (quantityTranscripts <= 0) {
            return;
        }
        if (completedIds.size() >= quantityTranscripts) {
            sendPronunciationCompletedIfNeeded();
        } else {
            sendPronunciationProgress(false);
        }
    }

    private void sendPronunciationCompletedIfNeeded() {
        if (pronunciationCompletedSent) {
            return;
        }
        pronunciationCompletedSent = true;
        sendPronunciationProgress(true);
    }

    private void sendPronunciationProgress(boolean completed) {
        progressRepository.createProgress(new CreateProgressRequest(lessonId, null, completed), new BaseCallback<ApiResponse<ProgressResponse>>() {
            @Override
            public void onSuccess(ApiResponse<ProgressResponse> data) {
                Log.d("ListeningFragment", completed ? "Da gui hoan thanh pronunciation" : "Da gui pronunciation dang hoc");
            }

            @Override
            public void onError(String message) {
                if (completed) {
                    pronunciationCompletedSent = false;
                }
                Log.e("ListeningFragment", "Loi gui pronunciation progress: " + message);
            }
        });
    }

    private void setMicRecordingState(boolean recording) {
        if (btnMic == null) return;

        if (recording) {
            btnMic.setBackgroundResource(R.drawable.bg_icon_circle_recording);
            btnMic.setAlpha(1f);

            if (micPulseAnimator != null) {
                micPulseAnimator.cancel();
            }

            ObjectAnimator scaleX = ObjectAnimator.ofFloat(btnMic, View.SCALE_X, 1f, 1.14f);
            ObjectAnimator scaleY = ObjectAnimator.ofFloat(btnMic, View.SCALE_Y, 1f, 1.14f);
            scaleX.setRepeatCount(ObjectAnimator.INFINITE);
            scaleY.setRepeatCount(ObjectAnimator.INFINITE);
            scaleX.setRepeatMode(ObjectAnimator.REVERSE);
            scaleY.setRepeatMode(ObjectAnimator.REVERSE);

            micPulseAnimator = new AnimatorSet();
            micPulseAnimator.playTogether(scaleX, scaleY);
            micPulseAnimator.setDuration(550);
            micPulseAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
            micPulseAnimator.start();
        } else {
            if (micPulseAnimator != null) {
                micPulseAnimator.cancel();
                micPulseAnimator = null;
            }

            btnMic.animate().cancel();
            btnMic.setScaleX(1f);
            btnMic.setScaleY(1f);
            btnMic.setAlpha(1f);
            btnMic.setBackgroundResource(R.drawable.bg_icon_circle_blue);
        }
    }

    private void writeWavFile(File file, int bufferSize) {
        byte[] buffer = new byte[bufferSize];
        int totalAudioLen = 0;
        int maxAmplitude = 0;

        try (RandomAccessFile wavFile = new RandomAccessFile(file, "rw")) {
            writeWavHeader(wavFile, 0);

            while (isRecording && audioRecord != null) {
                int read = audioRecord.read(buffer, 0, buffer.length);
                if (read > 0) {
                    for (int i = 0; i < read - 1; i += 2) {
                        short sample = (short) ((buffer[i] & 0xff) | (buffer[i + 1] << 8));
                        maxAmplitude = Math.max(maxAmplitude, Math.abs(sample));
                    }
                    wavFile.write(buffer, 0, read);
                    totalAudioLen += read;
                } else if (read < 0) {
                    Log.e("DictationFragment", "AudioRecord read error: " + read);
                }
            }

            wavFile.seek(0);
            writeWavHeader(wavFile, totalAudioLen);
            Log.d("DictationFragment", "WAV bytes=" + totalAudioLen + ", maxAmplitude=" + maxAmplitude);

        } catch (IOException e) {
            Log.e("ListeningFragment", "Lỗi ghi file WAV: " + e.getMessage());
        }

    }
    private int calculateMaxAmplitude(File file) {
        int maxAmplitude = 0;
        byte[] buffer = new byte[4096];

        try (RandomAccessFile wavFile = new RandomAccessFile(file, "r")) {
            if (wavFile.length() <= 44) {
                return 0;
            }

            wavFile.seek(44);
            int read;
            while ((read = wavFile.read(buffer)) > 0) {
                for (int i = 0; i < read - 1; i += 2) {
                    short sample = (short) ((buffer[i] & 0xff) | (buffer[i + 1] << 8));
                    maxAmplitude = Math.max(maxAmplitude, Math.abs(sample));
                }
            }
        } catch (IOException e) {
            Log.e("DictationFragment", "Failed to analyze WAV amplitude: " + e.getMessage());
        }

        return maxAmplitude;
    }

    private void writeWavHeader(RandomAccessFile file, int audioLen) throws IOException {
        int channels = 1;
        int byteRate = SAMPLE_RATE * channels * 16 / 8;
        int totalDataLen = audioLen + 36;

        file.writeBytes("RIFF");
        file.writeInt(Integer.reverseBytes(totalDataLen));
        file.writeBytes("WAVE");
        file.writeBytes("fmt ");
        file.writeInt(Integer.reverseBytes(16));
        file.writeShort(Short.reverseBytes((short) 1));
        file.writeShort(Short.reverseBytes((short) channels));
        file.writeInt(Integer.reverseBytes(SAMPLE_RATE));
        file.writeInt(Integer.reverseBytes(byteRate));
        file.writeShort(Short.reverseBytes((short) (channels * 16 / 8)));
        file.writeShort(Short.reverseBytes((short) 16));
        file.writeBytes("data");
        file.writeInt(Integer.reverseBytes(audioLen));
    }

    private void stopRecordingForCleanup() {
        isRecording = false;
        setMicRecordingState(false);

        if (audioRecord != null) {
            try {
                audioRecord.stop();
            } catch (Exception e) {
                Log.e("ListeningFragment", "Error stopping AudioRecord", e);
            }
        }

        try {
            if (recordingThread != null) {
                recordingThread.join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (audioRecord != null) {
            audioRecord.release();
            audioRecord = null;
        }

        recordingThread = null;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (isRecording) {
            stopRecordingForCleanup();
        }
        if (youTubeWebViewManager != null) {
            youTubeWebViewManager.destroy();
        }
        if (micPulseAnimator != null) {
            micPulseAnimator.cancel();
            micPulseAnimator = null;
        }
    }

}
