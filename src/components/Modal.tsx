import { useContext, useEffect, useRef } from 'react';
import { ModalContext } from '../hooks';
import { cn } from '@udecode/cn';
import './Modal.css';

export default function Modal() {
  const context = useContext(ModalContext);
  const contentDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!contentDiv.current!.contains(target)) {
        context?.setValue(undefined);
      }
    }

    if (context?.value !== undefined) {
      document.addEventListener('click', onClick);
    }

    return () => document.removeEventListener('click', onClick);
  }, [context]);

  const { value } = context ?? { value: undefined};
  const show = value === undefined;

  return (
    <>
      <div
        className={cn(
          'fading fixed z-50 flex h-full w-full items-center justify-center bg-neutral-900 bg-opacity-75',
          !show && 'show',
        )}
      >
        <div className="h-fit w-fit" ref={contentDiv}>
          {value}
        </div>
      </div>
    </>
  );
}
