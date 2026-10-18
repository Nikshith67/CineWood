import { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ movie, onClose, onComplete, profileId }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef(null);
  const containerRef = useRef(null);

  // Initialize HLS or direct video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movie?.videoStreamUrl) return;

    const streamUrl = movie.videoStreamUrl;

    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1,
        capLevelToPlayerSize: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => {
        hls.destroy();
      };
    } else {
      video.src = streamUrl;
      video.play().catch(() => {});
    }
  }, [movie]);

  // Auto-hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * (video.duration || 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    onComplete?.(movie);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="modal-backdrop" onClick={() => onClose?.(videoRef.current ? Math.floor(videoRef.current.currentTime) : 0)}>
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl mx-4 bg-black rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Close Button */}
        <button
          onClick={() => onClose?.(videoRef.current ? Math.floor(videoRef.current.currentTime) : 0)}
          className={`absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#141414]/80 flex items-center justify-center text-white hover:bg-white/20 transition-all ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          playsInline
        />

        {/* Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Movie Title */}
          <p className="text-headline-sm text-white mb-3">{movie?.title}</p>

          {/* Scrubber Bar */}
          <div className="scrubber-track mb-3" onClick={handleSeek}>
            <div className="scrubber-progress" style={{ width: `${progress}%` }} />
            <div className="scrubber-handle" style={{ left: `${progress}%` }} />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-white/80 transition-colors">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {playing ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Skip buttons */}
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="text-white hover:text-white/80">
                <span className="material-symbols-outlined">replay_10</span>
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="text-white hover:text-white/80">
                <span className="material-symbols-outlined">forward_10</span>
              </button>

              {/* Volume */}
              <button onClick={toggleMute} className="text-white hover:text-white/80">
                <span className="material-symbols-outlined">
                  {muted ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                </span>
              </button>

              {/* Time */}
              <span className="text-body-sm text-[#B3B3B3]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Quality Badges */}
              <span className="pill-badge">HD</span>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white hover:text-white/80">
                <span className="material-symbols-outlined">
                  {fullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
