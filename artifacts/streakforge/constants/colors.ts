/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F5F7FA',
    tint: '#B8F35A',

    // Core surfaces
    background: '#0F1117',
    foreground: '#F5F7FA',

    // Cards / elevated surfaces
    card: '#171B25',
    cardForeground: '#F5F7FA',

    // Primary action color (buttons, links, active states)
    primary: '#B8F35A',
    primaryForeground: '#0F1117',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#232938',
    secondaryForeground: '#F5F7FA',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#202532',
    mutedForeground: '#8993A6',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FF7A6B',
    accentForeground: '#0F1117',

    // Destructive actions (delete, error states)
    destructive: '#FF6B8A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#2B3140',
    input: '#2B3140',
  },

  dark: {
    text: '#F5F7FA',
    tint: '#B8F35A',
    background: '#0F1117',
    foreground: '#F5F7FA',
    card: '#171B25',
    cardForeground: '#F5F7FA',
    primary: '#B8F35A',
    primaryForeground: '#0F1117',
    secondary: '#232938',
    secondaryForeground: '#F5F7FA',
    muted: '#202532',
    mutedForeground: '#8993A6',
    accent: '#FF7A6B',
    accentForeground: '#0F1117',
    destructive: '#FF6B8A',
    destructiveForeground: '#FFFFFF',
    border: '#2B3140',
    input: '#2B3140',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
