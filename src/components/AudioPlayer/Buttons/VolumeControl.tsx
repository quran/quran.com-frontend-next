import { useState } from "react";

import Slider from "react-rangeslider";

// To include the default styles
import "react-rangeslider/lib/index.css";

import styles from "@/components/AudioPlayer/OverflowAudioPlayerActionsMenu.module.scss";
import Button, { ButtonShape, ButtonVariant } from "@/dls/Button/Button";
import PopoverMenu from "@/dls/PopoverMenu/PopoverMenu";
import useDirection from "@/hooks/useDirection";
import VolumeUpIcon from "@/icons/volume_up.svg";

const VolumeControl = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(100);
  const direction = useDirection();

  return (
    <>
      <div dir={direction}>
        <PopoverMenu
          isPortalled
          isModal
          trigger={
            <Button
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={() => setIsOpen(!isOpen)}
            >
              <VolumeUpIcon />
            </Button>
          }
          onOpenChange={() => console.log("Open")}
          contentClassName={styles.overriddenPopoverMenuContentPositioning}
        >
          <Slider
            value={level}
            orientation="vertical"
            format={(p) => `${p}%`}
            onChange={(value) => setLevel(value)}
          />
        </PopoverMenu>
      </div>
    </>
  );
};

export default VolumeControl;
