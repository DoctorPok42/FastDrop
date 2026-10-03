import Image from "next/image";
import RadioButton, { RadioButtonProps } from "./RadioButton";

interface HeaderProps {
  ping: number;
  radio: RadioButtonProps
}

const Header = ({ ping, radio }: HeaderProps) => {

  return (
    <div className="w-screen lg:-ml-[calc(50vw-632px)] flex flex-wrap items-center justify-between gap-4 pt-5 p-[clamp(16px,4vw,25px)] border-b border-divider">
      <div className="flex lg:w-auto w-full items-center justify-center gap-2">
        <Image src="/logo-mark.svg" alt="Fastdrop Logo" width={40} height={40} />
        <span className="font-extrabold text-[22px] italic">
          Fastdrop
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="lg:flex hidden items-center rounded-full gap-2 py-2 px-3.5 bg-text text-inverse-text text-[12px] font-medium font-mono">
          <span className="w-1.75 h-1.75 rounded-full bg-inv-accent"></span>
          <span>wss {ping} ms</span>
        </div>

        <RadioButton
          value={radio.value}
          onChange={radio.onChange}
          nbOfUsers={radio.nbOfUsers}
          onClick={radio.onClick}
          isActive={radio.isActive}
        />
      </div>
    </div>
  );
};

export default Header;
