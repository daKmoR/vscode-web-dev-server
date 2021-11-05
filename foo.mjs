import { startDevServer } from '@web/dev-server';

startDevServer({
  config: {
    rootDir: process.cwd(),
    port: 3000,
    watch: true,
    open: true,
  }
});
