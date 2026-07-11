export class WavRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private buffers: Float32Array[] = [];
  private sampleRate: number = 16000; // Resample to 16000Hz mono PCM WAV preferred by Azure Speech

  constructor() {}

  async start() {
    this.buffers = [];
    
    // Yêu cầu quyền truy cập microphone
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Khởi tạo AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: this.sampleRate });
    
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    // ScriptProcessorNode với buffer 4096, 1 channel vào, 1 channel ra
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.scriptProcessor.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0);
      this.buffers.push(new Float32Array(channelData));
    };

    this.mediaStreamSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  stop(): Blob {
    if (this.scriptProcessor && this.mediaStreamSource) {
      this.scriptProcessor.disconnect();
      this.mediaStreamSource.disconnect();
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    // Gộp tất cả các mảng float ghi âm được thành một mảng duy nhất
    const merged = this.mergeBuffers(this.buffers);
    // Đóng gói mảng float thành định dạng 16-bit PCM WAV (WAV Header 44 bytes)
    const wavBuffer = this.encodeWAV(merged);
    return new Blob([wavBuffer], { type: "audio/wav" });
  }

  private mergeBuffers(buffers: Float32Array[]): Float32Array {
    let totalLength = 0;
    for (const buf of buffers) {
      totalLength += buf.length;
    }
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }

  private encodeWAV(samples: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    this.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, this.sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, this.sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    this.floatTo16BitPCM(view, 44, samples);

    return buffer;
  }

  private floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
