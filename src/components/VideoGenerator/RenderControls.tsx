import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Input from '@/dls/Forms/Input';

type CompositionProps = {
  id: string;
  text: string;
};

const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: CompositionProps;
}> = ({ text, setText, inputProps }) => {
  const { t } = useTranslation();
  // const { renderMedia, state, undo } = useRenderingd(COMP_NAME, inputProps);

  return (
    <div className={styles.renderControlsContainer}>
      {state.status === 'init' || state.status === 'invoking' || state.status === 'error' ? (
        <>
          <Input disabled={state.status === 'invoking'} onChange={setText} value={text} />
          <br />
          <AlignEnd>
            <Button
              disabled={state.status === 'invoking'}
              loading={state.status === 'invoking'}
              onClick={renderMedia}
            >
              {t('render-video')}
            </Button>
          </AlignEnd>
          {state.status === 'error' ? <div>{state.error.message}</div> : null}
        </>
      ) : null}
      {state.status === 'rendering' || state.status === 'done' ? (
        <>
          <ProgressBar progress={state.status === 'rendering' ? state.progress : 1} />
          <Spacing></Spacing>
          <AlignEnd>
            <DownloadButton undo={undo} state={state}></DownloadButton>
          </AlignEnd>
        </>
      ) : null}
    </div>
  );
};

export default RenderControls;
