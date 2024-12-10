import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { proxyConsole } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should throw error when not defining SUB', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTypeCheck()],
    },
  });

  await expect(rsbuild.build()).rejects.toThrowError('build failed!');

  expect(
    logs.find((log) => log.includes('File:') && log.includes('/src/index.ts')),
  ).toBeTruthy();

  expect(
    logs.find((log) =>
      log.includes(
        `Cannot find name 'sub'. Did you mean 'SUB'?`,
      ),
    ),
  ).toBeTruthy();

  restore();
});

test('should not throw error when replacing SUB', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      source: {
        define: {
          SUB: 'sub',
        }
      },
      plugins: [
        pluginTypeCheck(),
      ],
    },
  });

  await expect(rsbuild.build()).resolves.toBeTruthy();
});

