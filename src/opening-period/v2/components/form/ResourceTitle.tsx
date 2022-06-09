import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '../../../../common/lib/types';
import { OpeningHours, OptionType } from '../../types';
import OpeningHoursPreviewMobile from '../preview/OpeningHoursPreviewMobile';
import './ResourceTitle.scss';

type Props = {
  openingHours: OpeningHours[];
  resource: Resource;
  resourceStates: OptionType[];
  rules: OptionType[];
};

const ResourceTitle = ({
  openingHours,
  resourceStates,
  resource,
  rules,
}: Props): JSX.Element => {
  const [titleIsOnTop, setTitleIsOnTop] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const onScroll = (): void => {
      if (title.current?.getBoundingClientRect().top === 0) {
        setTitleIsOnTop(true);
      }
      // TODO: Figure out some nicer way for this
      if (titleIsOnTop && window.scrollY < 40) {
        setTitleIsOnTop(false);
      }
    };

    window.addEventListener('scroll', onScroll);
    return (): void => window.removeEventListener('scroll', onScroll);
  }, [title, titleIsOnTop]);

  return (
    <div
      ref={title}
      className={`card resource-title ${
        titleIsOnTop ? 'resource-title--on-top' : ''
      }`}>
      <div>
        <h1
          data-test="resource-info"
          className={`resource-info-title ${
            titleIsOnTop ? 'resource-info-title--on-top' : ''
          }`}>
          {resource?.name?.fi}
        </h1>
      </div>
      <div className="mobile-preview-container">
        <OpeningHoursPreviewMobile
          openingHours={openingHours}
          resourceStates={resourceStates}
          rules={rules}
        />
      </div>
    </div>
  );
};

export default ResourceTitle;
