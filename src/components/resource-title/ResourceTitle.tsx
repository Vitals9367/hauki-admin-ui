import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Language, Resource } from '../../common/lib/types';
import { isUnitResource } from '../../common/utils/resource/helper';
import { displayLangVersionNotFound } from '../language-select/LanguageSelect';
import './ResourceTitle.scss';

const resourceTitleId = 'resource-title';

type Props = {
  children?: ReactNode;
  language: Language;
  resource?: Resource;
  titleAddon?: string;
};

const ResourceTitle = ({
  children,
  language,
  resource,
  titleAddon,
}: Props): JSX.Element => {
  const [titleIsOnTop, setTitleIsOnTop] = useState(false);
  const [scrollHandlerDisabled, setDisableScroll] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const name =
    resource?.name[language] ||
    displayLangVersionNotFound({
      language,
      label: `${
        resource && isUnitResource(resource) ? 'toimipisteen' : 'alakohteen'
      } nimi`,
    });

  useEffect(() => {
    const onScroll = (): void => {
      if (
        !scrollHandlerDisabled &&
        title.current?.getBoundingClientRect().top === 0
      ) {
        setTitleIsOnTop(true);
      }
      // TODO: Figure out some nicer way for this
      if (!scrollHandlerDisabled && titleIsOnTop && window.scrollY < 20) {
        setTitleIsOnTop(false);
      }
    };

    window.addEventListener('scroll', onScroll);
    return (): void => window.removeEventListener('scroll', onScroll);
  }, [scrollHandlerDisabled, title, titleIsOnTop]);

  useEffect(() => {
    const doDisableScroll = () => setDisableScroll(true);
    const doEnableScroll = () => setDisableScroll(false);
    ref.current?.addEventListener('transitionstart', doDisableScroll);
    ref.current?.addEventListener('transitionend', doEnableScroll);

    const refCopy = ref.current;
    return () => {
      refCopy?.removeEventListener('transitionstart', doDisableScroll);
      refCopy?.removeEventListener('transitionend', doEnableScroll);
    };
  }, [setDisableScroll]);

  return (
    <section
      aria-labelledby={resourceTitleId}
      ref={title}
      className={`resource-title ${
        titleIsOnTop ? 'resource-title--on-top' : ''
      }`}>
      <h1
        ref={ref}
        id={resourceTitleId}
        data-test="resource-info"
        className={`resource-info-title ${
          titleIsOnTop ? 'resource-info-title--on-top' : ''
        }`}>
        {name}
        {titleAddon ? ` - ${titleAddon}` : ''}
      </h1>

      {children}
    </section>
  );
};

export default ResourceTitle;
