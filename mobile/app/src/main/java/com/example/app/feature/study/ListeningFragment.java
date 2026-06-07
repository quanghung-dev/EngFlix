package com.example.app.feature.study;

import android.Manifest;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageButton;
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
    private ProgressRepository progressRepository;
    private List<Integer> completedIds = new ArrayList<>();
    private boolean pronunciationCompletedSent = false;


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
        pronunciationAttemptsRepository = new PronunciationAttemptsRepository(requireContext());
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
        youTubeWebViewManager.playFromTo(startTime,endTime);
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

}




