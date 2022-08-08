import React from 'react';
import { mount } from 'enzyme';
import Collapse from './Collapse';

describe(`<Collapse />`, () => {
  it('should hide content', () => {
    const collapse = mount(
      <Collapse
        isOpen={false}
        collapseContentId="test-content"
        title="Test Title">
        <p>Test content</p>
      </Collapse>
    );

    expect(collapse.find('h3').text()).toEqual('Test Title');

    expect(collapse.find('p').getDOMNode()).not.toBeVisible();
  });

  it('should show content when clicked', () => {
    const collapse = mount(
      <Collapse
        isOpen={false}
        collapseContentId="test-content"
        title="Test Title">
        <p>Test content</p>
      </Collapse>
    );

    collapse.find('button').simulate('click');

    expect(collapse.find('p').getDOMNode()).toBeVisible();
  });
});
