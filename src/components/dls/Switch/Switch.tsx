/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
type SwitchItem = {
  name: string;
  value: string;
};

type SwitchProps = {
  items: SwitchItem[];
  onChange: (value: string) => void;
  selected: string;
};

const Switch = ({ items, onChange }: SwitchProps) => {
  return (
    <div>
      {items.map((item) => (
        <div onClick={() => onChange(item.value)}>{item.name}</div>
      ))}
    </div>
  );
};

export default Switch;
