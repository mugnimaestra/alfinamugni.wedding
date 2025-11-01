import { createContextId, useSignal, noSerialize, type Signal, type NoSerialize } from "@builder.io/qwik";

export interface AudioStore {
  isPlaying: Signal<boolean>;
  isMuted: Signal<boolean>;
  audioElement: Signal<NoSerialize<HTMLAudioElement> | undefined>;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  init: () => void;
}

export const AudioContext = createContextId<AudioStore>("audio-context");

export const useAudioStore = (): AudioStore => {
  const isPlaying = useSignal(false);
  const isMuted = useSignal(false);
  const audioElement = useSignal<NoSerialize<HTMLAudioElement> | undefined>(undefined);

  const init = () => {
    // Only run in browser environment
    if (typeof window === "undefined" || typeof Audio === "undefined") return;

    // Create audio element if it doesn't exist
    if (!audioElement.value) {
      const audio = new Audio("/The Wedding of Alfina & Mugni.mp3");
      audio.loop = true; // Loop the wedding music
      audio.volume = 0.6; // Set default volume to 60%

      // Add event listeners
      audio.addEventListener("play", () => {
        isPlaying.value = true;
      });

      audio.addEventListener("pause", () => {
        isPlaying.value = false;
      });

      audio.addEventListener("ended", () => {
        isPlaying.value = false;
      });

      // Handle errors
      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        isPlaying.value = false;
      });

      // Use noSerialize to prevent Qwik from trying to serialize the Audio element
      audioElement.value = noSerialize(audio);
    }
  };

  const play = async () => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    if (!audioElement.value) {
      init();
    }

    if (audioElement.value && audioElement.value.paused) {
      try {
        // Unmute if muted
        if (isMuted.value) {
          audioElement.value.muted = false;
          isMuted.value = false;
        }

        await audioElement.value.play();
        isPlaying.value = true;
      } catch (error) {
        // Handle autoplay policy errors
        console.warn("Audio autoplay prevented:", error);
        isPlaying.value = false;
      }
    }
  };

  const pause = () => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    if (audioElement.value && !audioElement.value.paused) {
      audioElement.value.pause();
      isPlaying.value = false;
    }
  };

  const togglePlay = () => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    if (audioElement.value) {
      audioElement.value.muted = !audioElement.value.muted;
      isMuted.value = audioElement.value.muted;
    }
  };

  return {
    isPlaying,
    isMuted,
    audioElement,
    play,
    pause,
    togglePlay,
    toggleMute,
    init,
  };
};
