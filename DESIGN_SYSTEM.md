# Paypoint Design System

This document outlines the foundational elements of the Paypoint application's design system, ensuring a consistent and cohesive user experience across all platforms.

## 1. Typography

The typographic hierarchy is designed for clarity, readability, and accessibility.

**Font Family:**
-   **Primary:** 'Inter', sans-serif
-   **Monospace:** 'Roboto Mono', monospace (for numerical figures and code snippets)

---

### Hierarchy

| Element | Font Family | Font Size | Font Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | 'Inter' | 32px | 700 (Bold) | 40px |
| **Heading 2** | 'Inter' | 24px | 700 (Bold) | 32px |
| **Heading 3** | 'Inter' | 20px | 600 (Semi-Bold) | 28px |
| **Body (Default)** | 'Inter' | 16px | 400 (Regular) | 24px |
| **Body (Small)** | 'Inter' | 14px | 400 (Regular) | 20px |
| **Microcopy/Caption**| 'Inter' | 12px | 400 (Regular) | 16px |
| **Button** | 'Inter' | 16px | 600 (Semi-Bold) | 24px |
| **Input Label** | 'Inter' | 14px | 500 (Medium) | 20px |
| **Input Text** | 'Inter' | 16px | 400 (Regular) | 24px |

---

## 2. Color Palette

The color palette is designed to be vibrant, accessible, and aligned with the Paypoint brand identity.

### Primary Palette

Used for primary actions, active states, and key visual elements.

| Color | HEX | Usage |
| :--- | :--- | :--- |
| **Primary Blue** | `#007BFF` | Primary buttons, links, active navigation items |
| **Dark Blue** | `#0056b3` | Hover states for primary elements |

### Secondary Palette

Used for secondary actions, informational messages, and highlighting.

| Color | HEX | Usage |
| :--- | :--- | :--- |
| **Accent Green** | `#28A745` | Success messages, confirmations, positive actions |
| **Warning Orange** | `#FFC107` | Warnings, pending states |
| **Error Red** | `#DC3545` | Error messages, destructive actions |

### Tertiary Palette

Used for decorative elements, illustrations, and charts.

| Color | HEX | Usage |
| :--- | :--- | :--- |
| **Light Blue** | `#E6F2FF` | Background highlights, informational sections |
| **Light Green** | `#EAF6EC` | Success state backgrounds |
| **Light Orange** | `#FFF8E1` | Warning state backgrounds |
| **Light Red** | `#FBEBEE` | Error state backgrounds |

### Neutral Shades

Used for text, backgrounds, borders, and UI chrome.

| Color | Name | HEX | Usage |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `Gray-900` | `#1A202C` | Headings and primary text |
| **Text Secondary** | `Gray-700` | `#4A5568` | Body copy and secondary text |
| **Text Tertiary** | `Gray-500` | `#A0AEC0` | Helper text, disabled text |
| **Border** | `Gray-300` | `#E2E8F0` | Input borders, dividers |
| **Background Light** | `Gray-100` | `#F7FAFC` | Page backgrounds |
| **Background White** | `White` | `#FFFFFF` | Component backgrounds, cards |

---

## 3. Component States

Standardized visual feedback for interactive UI components is crucial for usability.

### Buttons

| State | Background Color | Text Color | Border | Box Shadow |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | Primary Blue (`#007BFF`) | White (`#FFFFFF`) | None | `0 2px 4px rgba(0, 123, 255, 0.2)` |
| **Hover** | Dark Blue (`#0056b3`) | White (`#FFFFFF`) | None | `0 4px 8px rgba(0, 86, 179, 0.3)` |
| **Focus** | Primary Blue (`#007BFF`) | White (`#FFFFFF`) | `2px solid #E6F2FF` | `0 0 0 3px rgba(0, 123, 255, 0.25)` |
| **Active** | Darkest Blue (`#004085`) | White (`#FFFFFF`) | None | `inset 0 2px 4px rgba(0, 0, 0, 0.15)` |
| **Disabled** | Gray-300 (`#E2E8F0`) | Gray-500 (`#A0AEC0`) | None | None |

### Input Fields

| State | Background Color | Text Color | Border | Box Shadow |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | White (`#FFFFFF`) | Gray-900 (`#1A202C`) | `1px solid #E2E8F0` | None |
| **Hover** | White (`#FFFFFF`) | Gray-900 (`#1A202C`) | `1px solid #A0AEC0` | None |
| **Focus** | White (`#FFFFFF`) | Gray-900 (`#1A202C`) | `1px solid #007BFF` | `0 0 0 3px rgba(0, 123, 255, 0.25)` |
| **Active** | White (`#FFFFFF`) | Gray-900 (`#1A202C`) | `1px solid #007BFF` | None |
| **Disabled** | Gray-100 (`#F7FAFC`) | Gray-500 (`#A0AEC0`) | `1px solid #E2E8F0` | None |
| **Error** | White (`#FFFFFF`) | Gray-900 (`#1A202C`) | `1px solid #DC3545` | `0 0 0 3px rgba(220, 53, 69, 0.25)` |