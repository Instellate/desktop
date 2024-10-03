import { useContext, useEffect, useRef } from 'react';
import { MenuComponentContext } from '../hooks';

export default function ContextMenu() {
  const { value, setValue } = useContext(MenuComponentContext);
  const rootDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    function onClick() {
      setValue!(undefined);
    }

    const bottomRect = rootDiv.current!.getBoundingClientRect().bottom;
    if (bottomRect - window.innerHeight >= 0) {
      const newTop =
        Math.abs(bottomRect - (bottomRect + window.innerHeight - rootDiv.current!.offsetHeight)) - 12;
      rootDiv.current!.style.top = `${newTop}px`;
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [setValue, value]);

  if (value === undefined) {
    return <div className="hidden" />;
  }

  return (
    <>
      <div
        ref={rootDiv}
        className="absolute z-40 overflow-clip"
        style={{ top: value.y, left: value.x }}
      >
        {value.node}
      </div>
    </>
  );
}
