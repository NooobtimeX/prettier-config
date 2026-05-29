/**
 * Which tab of the Prettier config panel is active. Shared by the desktop
 * `PrettierPanel`, the mobile `PrettierPanelModal`, and the `usePrettierPanel`
 * hook so the three never drift apart.
 */
export type PanelViewMode = 'config' | 'preview' | 'yourcode';
