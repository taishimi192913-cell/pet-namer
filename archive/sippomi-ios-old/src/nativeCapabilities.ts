import { UIManager } from 'react-native';

export function hasNativeViewManager(name: string) {
  return Boolean(UIManager.getViewManagerConfig?.(name));
}

export function canRenderSvg() {
  return hasNativeViewManager('RNSVGSvgView');
}

export function canRenderNativeStack() {
  return hasNativeViewManager('RNSScreenStack');
}
