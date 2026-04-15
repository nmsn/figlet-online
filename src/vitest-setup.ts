import { cleanup } from '@testing-library/react';

declare const afterEach: () => void;

afterEach(() => {
  cleanup();
});
