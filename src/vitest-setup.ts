import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

declare const afterEach: () => void;

afterEach(() => {
  cleanup();
});
