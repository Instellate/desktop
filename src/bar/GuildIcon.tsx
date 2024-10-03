import './GuildIcon.css';

type Prop = {
  url: string;
  isSelected: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export default function GuildIcon(props: Prop) {
  let selectedClass: string;
  if (props.isSelected) {
    selectedClass = 'is-selected';
  } else {
    selectedClass = '';
  }

  return (
    <>
      <div className="flex flex-grow justify-center" onClick={props.onClick}>
        <img
          src={props.url}
          alt=""
          className={`rounding h-12 w-12 ${selectedClass} bg-slate-800`}
        />
      </div>
    </>
  );
}
