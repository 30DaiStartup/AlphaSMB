// AlphaSMB Assessment — Speech Engine
// Hybrid: Web Speech API (Chrome/Edge) + Transformers.js Whisper fallback (Firefox/Safari)

(function () {
  'use strict';

  // ── Feature detection ──
  var SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  var hasNative = !!SpeechRecognitionCtor;
  var hasAudio = !!(window.AudioContext || window.webkitAudioContext);
  var engine = hasNative ? 'native' : (hasAudio ? 'whisper' : null);

  // ── Shared state ──
  var recording = false;
  var modelLoading = false;
  var callbacks = {};

  // ── Native path state ──
  var recognition = null;

  // ── Whisper path state ──
  var whisperPipeline = null;
  var mediaRecorder = null;
  var audioChunks = [];
  var audioStream = null;

  // ── Helpers ──
  function cleanup() {
    recording = false;
    modelLoading = false;
    callbacks = {};
  }

  function stopStream() {
    if (audioStream) {
      audioStream.getTracks().forEach(function (t) { t.stop(); });
      audioStream = null;
    }
  }

  // ── Native Web Speech API ──
  function startNative(cbs) {
    callbacks = cbs;
    recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = function (e) {
      var transcript = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      var isFinal = e.results[e.results.length - 1].isFinal;
      if (callbacks.onResult) callbacks.onResult(transcript, isFinal);
    };

    recognition.onerror = function (e) {
      recording = false;
      var msg = 'Speech recognition error.';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg = 'Microphone access denied. Please allow mic access and try again.';
      } else if (e.error === 'no-speech') {
        msg = 'No speech detected. Try again.';
      }
      if (callbacks.onError) callbacks.onError(msg);
    };

    recognition.onend = function () {
      recording = false;
      if (callbacks.onEnd) callbacks.onEnd();
    };

    try {
      recognition.start();
      recording = true;
    } catch (err) {
      recording = false;
      if (callbacks.onError) callbacks.onError('Could not start speech recognition.');
    }
  }

  function stopNative() {
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
      recognition = null;
    }
    recording = false;
  }

  // ── Whisper (Transformers.js) path ──
  function convertBlobToFloat32(blob, cb) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    var reader = new FileReader();
    reader.onload = function () {
      var arrayBuf = reader.result;
      var ctx = new AudioCtx();
      ctx.decodeAudioData(arrayBuf, function (audioBuf) {
        // Resample to 16kHz mono
        var targetRate = 16000;
        var offCtx = new OfflineAudioContext(1, Math.ceil(audioBuf.duration * targetRate), targetRate);
        var src = offCtx.createBufferSource();
        src.buffer = audioBuf;
        src.connect(offCtx.destination);
        src.start(0);
        offCtx.startRendering().then(function (rendered) {
          cb(null, rendered.getChannelData(0));
          ctx.close();
        }).catch(function (err) {
          cb(err);
          ctx.close();
        });
      }, function (err) {
        cb(err || new Error('Failed to decode audio'));
        ctx.close();
      });
    };
    reader.onerror = function () { cb(new Error('Failed to read audio blob')); };
    reader.readAsArrayBuffer(blob);
  }

  function loadWhisperPipeline(progressCb, done) {
    if (whisperPipeline) { done(null, whisperPipeline); return; }
    modelLoading = true;
    import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1')
      .then(function (mod) {
        return mod.pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
          quantized: true,
          progress_callback: function (p) {
            if (progressCb) progressCb(p);
          }
        });
      })
      .then(function (pipe) {
        whisperPipeline = pipe;
        modelLoading = false;
        done(null, pipe);
      })
      .catch(function (err) {
        modelLoading = false;
        done(err);
      });
  }

  function startWhisper(cbs) {
    callbacks = cbs;
    audioChunks = [];

    // Load model first (lazy, cached after first use)
    loadWhisperPipeline(
      function (progress) {
        if (callbacks.onProgress) callbacks.onProgress(progress);
      },
      function (err, pipe) {
        if (err) {
          recording = false;
          modelLoading = false;
          if (callbacks.onError) callbacks.onError('Failed to load speech model. Please try again.');
          return;
        }
        // Model ready — start mic capture
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function (stream) {
            audioStream = stream;
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = function (e) {
              if (e.data.size > 0) audioChunks.push(e.data);
            };
            mediaRecorder.onstop = function () {
              stopStream();
              var blob = new Blob(audioChunks, { type: 'audio/webm' });
              if (callbacks.onResult) callbacks.onResult('Processing...', false);
              convertBlobToFloat32(blob, function (convErr, float32) {
                if (convErr) {
                  recording = false;
                  if (callbacks.onError) callbacks.onError('Failed to process audio.');
                  return;
                }
                pipe(float32).then(function (result) {
                  recording = false;
                  var text = result.text || '';
                  if (callbacks.onResult) callbacks.onResult(text.trim(), true);
                  if (callbacks.onEnd) callbacks.onEnd();
                }).catch(function () {
                  recording = false;
                  if (callbacks.onError) callbacks.onError('Transcription failed. Please try again.');
                });
              });
            };
            mediaRecorder.start();
            recording = true;
          })
          .catch(function (micErr) {
            recording = false;
            var msg = 'Microphone access denied. Please allow mic access and try again.';
            if (micErr.name !== 'NotAllowedError') {
              msg = 'Could not access microphone.';
            }
            if (callbacks.onError) callbacks.onError(msg);
          });
      }
    );
  }

  function stopWhisper() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop(); // triggers onstop -> transcription
    } else {
      recording = false;
      stopStream();
    }
  }

  // ── Public API ──
  window.SpeechEngine = {
    isSupported: function () { return engine !== null; },
    isRecording: function () { return recording; },
    isModelLoading: function () { return modelLoading; },
    getEngine: function () { return engine; },

    start: function (cbs) {
      if (recording) return;
      if (engine === 'native') {
        startNative(cbs || {});
      } else if (engine === 'whisper') {
        startWhisper(cbs || {});
      }
    },

    stop: function () {
      if (!recording && !modelLoading) return;
      if (engine === 'native') {
        stopNative();
      } else if (engine === 'whisper') {
        stopWhisper();
      }
    }
  };

})();
