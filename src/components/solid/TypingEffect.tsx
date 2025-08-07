import { createSignal, onCleanup } from "solid-js";
import { onMount } from "solid-js";

interface TypingEffectProps {
  texts: string[];
  speed?: number;
  delay?: number;
}

export default function TypingEffect(props: TypingEffectProps) {
  const [displayText, setDisplayText] = createSignal("");
  let textIndex = 0;
  let charIndex = 0;
  let interval: ReturnType<typeof setInterval>;

  const startTyping = () => {
    interval = setInterval(() => {
      const currentText = props.texts[textIndex];
      setDisplayText(currentText.slice(0, charIndex + 1));
      charIndex++;

      if (charIndex >= currentText.length) {
        clearInterval(interval);
        setTimeout(() => {
          charIndex = 0;
          textIndex = (textIndex + 1) % props.texts.length;
          startTyping();
        }, props.delay ?? 2000);
      }
    }, props.speed ?? 100);
  };

  onMount(startTyping);
  onCleanup(() => clearInterval(interval));

  return (
    <>
      <span class="text-xl md:text-3xl  text-white tracking-wide">
        {displayText()}
        <span class="blinking-cursor">|</span>
      </span>
      <style>
        {`
            .blinking-cursor {
            display: inline-block;
            margin-left: 2px;
            width: 1ch;
            animation: blink 1s step-end infinite;
            }

            @keyframes blink {
            from, to {
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            }

        `}
      </style>
    </>
  );
}
