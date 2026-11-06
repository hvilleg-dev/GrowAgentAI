import path from 'path';

export const APP_ROOT = path.resolve(__dirname, '..');

export function resolvePath(alias: string): string {
  const aliases: Record<string, string> = {
    '@': APP_ROOT,
    '@types': path.join(APP_ROOT, 'types'),
    '@errors': path.join(APP_ROOT, 'errors'),
    '@constants': path.join(APP_ROOT, 'constants'),
    '@utils': path.join(APP_ROOT, 'utils'),
    '@services': path.join(APP_ROOT, 'services'),
    '@database': path.join(APP_ROOT, 'database'),
    '@routes': path.join(APP_ROOT, 'routes'),
    '@middleware': path.join(APP_ROOT, 'middleware'),
    '@controllers': path.join(APP_ROOT, 'controllers')
  };

  return aliases[alias] || alias;
}
