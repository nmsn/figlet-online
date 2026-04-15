import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach as reactAfterEach } from 'react';

afterEach(() => {
  cleanup();
  reactAfterEach();
});
