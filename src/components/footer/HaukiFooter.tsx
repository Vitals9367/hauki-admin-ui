import React from 'react';
import { Footer } from 'hds-react';
import './HaukiFooter.scss';

export default function HaukiFooter(): JSX.Element {
  return (
    <>
      <div className="footer-top-padding" />
      <Footer
        className="page-footer"
        title="Aukiolot"
        theme={{
          '--footer-background': 'var(--hauki-footer-background-color)',
        }}>
        <Footer.Base>
          <Footer.Item
            href="https://kaupunkialustana.hel.fi/aukiolosovelluksen-saavutettavuusseloste/"
            target="_blank"
            label="Saavutettavuusseloste"
          />
          <Footer.Item
            href="/content-license.txt"
            target="_blank"
            label="Sisältölisenssi CC BY 4.0"
          />
        </Footer.Base>
      </Footer>
    </>
  );
}
