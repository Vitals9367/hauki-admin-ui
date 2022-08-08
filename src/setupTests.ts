import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import testSetup from './testSetup';

configure({ adapter: new Adapter() });
testSetup();
