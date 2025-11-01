import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { LuMusic, LuPause, LuPlay, LuVolume2, LuVolumeX } from "@qwikest/icons/lucide";
import { AudioContext } from "~/stores/audio-store";

export const AudioPlayer = component$(() => {
  const audioStore = useContext(AudioContext);

  useVisibleTask$(() => {
    // Add keyboard support (client-only)
    if (typeof document === "undefined") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        audioStore.togglePlay();
      }
      if (e.code === "KeyM") {
        audioStore.toggleMute();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, { strategy: 'document-ready' });

  return (
    <div
      class="audio-player-floating"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: "9998",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "flex-end",
      }}
    >
      {/* Music Bars Animation (shows when playing) */}
      {audioStore.isPlaying.value && (
        <div
          class="music-bars"
          style={{
            display: "flex",
            gap: "3px",
            alignItems: "flex-end",
            height: "20px",
            padding: "0 0.5rem",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              class="music-bar"
              style={{
                width: "3px",
                backgroundColor: "var(--wedding-accent, #b2804d)",
                borderRadius: "2px",
                animation: `musicBar 0.6s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                height: "100%",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      )}

      {/* Main Play/Pause Button */}
      <button
        onClick$={() => audioStore.togglePlay()}
        class="audio-control-button"
        aria-label={audioStore.isPlaying.value ? "Pause music" : "Play music"}
        title={
          audioStore.isPlaying.value
            ? "Pause music (Space)"
            : "Play music (Space)"
        }
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--wedding-accent, #b2804d)",
          color: "white",
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter$={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1.1)";
          (e.target as HTMLElement).style.boxShadow =
            "0 6px 16px rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave$={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1)";
          (e.target as HTMLElement).style.boxShadow =
            "0 4px 12px rgba(0, 0, 0, 0.3)";
        }}
      >
        {audioStore.isPlaying.value ? (
          <LuPause class="w-6 h-6" />
        ) : (
          <LuPlay class="w-6 h-6" style={{ marginLeft: "2px" }} />
        )}
      </button>

      {/* Mute/Unmute Button (smaller) */}
      <button
        onClick$={() => audioStore.toggleMute()}
        class="audio-mute-button"
        aria-label={audioStore.isMuted.value ? "Unmute music" : "Mute music"}
        title={audioStore.isMuted.value ? "Unmute music (M)" : "Mute music (M)"}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "white",
          color: "var(--wedding-brown, #4d3326)",
          border: "1px solid var(--wedding-beige, #f0e3d9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter$={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave$={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1)";
        }}
      >
        {audioStore.isMuted.value ? (
          <LuVolumeX class="w-4 h-4" />
        ) : (
          <LuVolume2 class="w-4 h-4" />
        )}
      </button>

      {/* Now Playing Indicator (optional) */}
      {audioStore.isPlaying.value && (
        <div
          class="now-playing-text"
          style={{
            fontSize: "0.75rem",
            color: "var(--wedding-brown, #4d3326)",
            backgroundColor: "white",
            padding: "0.35rem 0.75rem",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            maxWidth: "200px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <LuMusic class="w-3 h-3" />
          <span>Now Playing</span>
        </div>
      )}
    </div>
  );
});
