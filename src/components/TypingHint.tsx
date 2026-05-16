import React, { useEffect, useRef, useState } from 'react';

type Props = {
  hint: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
};

export default function TypingHint({ hint, inputRef, className }: Props) {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const mounted = useRef(true);
  const originalPlaceholder = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    let charIndex = 0;
    let typing = true;

    const tick = () => {
      if (!mounted.current) return;
      if (typing) {
        charIndex++;
        setText(hint.slice(0, charIndex));
        if (charIndex === hint.length) {
          typing = false;
          timerRef.current = window.setTimeout(tick, 2000);
          return;
        }
        timerRef.current = window.setTimeout(tick, 70);
      } else {
        charIndex--;
        setText(hint.slice(0, charIndex));
        if (charIndex === 0) {
          typing = true;
          timerRef.current = window.setTimeout(tick, 500);
          return;
        }
        timerRef.current = window.setTimeout(tick, 35);
      }
    };

    // small startup delay so element is laid out
    timerRef.current = window.setTimeout(tick, 120);

    const onInput = () => {
      const v = inputRef?.current?.value ?? '';
      const shouldShow = !(v && v.trim());
      setVisible(shouldShow);
      // toggle placeholder when hint is visible to avoid duplicate text
      if (inputRef?.current) {
        if (originalPlaceholder.current === null) originalPlaceholder.current = inputRef.current.placeholder || '';
        inputRef.current.placeholder = shouldShow ? '' : (originalPlaceholder.current || '');
      }
    };
    if (inputRef?.current) {
      inputRef.current.addEventListener('input', onInput);
      onInput();
    }

    return () => {
      mounted.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (inputRef?.current) {
        inputRef.current.removeEventListener('input', onInput);
        // restore original placeholder
        if (originalPlaceholder.current !== null) inputRef.current.placeholder = originalPlaceholder.current;
      }
    };
  }, [hint, inputRef]);

  return (
    <span
      className={`${className ?? ''} typing hint`}
      aria-hidden={!visible}
      style={{ opacity: visible ? 1 : 0 }}
    >
      {text}
    </span>
  );
}
