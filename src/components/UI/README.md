# UI Components

קומפוננטי UI בסיסיים עם SCSS modules ו-TypeScript.

## Header Component

קומפוננט Header גמיש עם תמיכה ב-actions ו-variants שונים.

### Props

```typescript
interface HeaderProps {
  title?: string;           // כותרת הראשית
  subtitle?: string;        // כותרת משנה
  children?: React.ReactNode; // אלמנטים נוספים (actions)
  className?: string;       // CSS classes נוספים
}
```

### שימוש בסיסי

```tsx
import { Header } from '@/components/UI';

<Header 
  title="My App"
  subtitle="Welcome to our platform"
/>
```

### Header עם Actions

```tsx
<Header 
  title="Dashboard"
  subtitle="Manage your data"
>
  <Button variant="outline">Settings</Button>
  <Button variant="primary">Add New</Button>
</Header>
```

### Variants

```tsx
// Header כהה
<Header 
  title="Dark Header"
  className="header--dark"
/>

// Header גדול
<Header 
  title="Large Header"
  className="header--large"
/>

// Header שקוף
<Header 
  title="Transparent Header"
  className="header--transparent"
/>
```

## Navigation Component

קומפוננט ניווט גמיש עם תמיכה בכיוונים שונים.

### Props

```typescript
interface NavigationProps {
  items: NavItem[];         // רשימת פריטי ניווט
  className?: string;       // CSS classes נוספים
  orientation?: 'horizontal' | 'vertical'; // כיוון הניווט
}

interface NavItem {
  label: string;            // טקסט הפריט
  href: string;             // קישור
  active?: boolean;         // האם הפריט פעיל
  onClick?: () => void;     // פונקציה לחיצה
}
```

### שימוש בסיסי

```tsx
import { Navigation } from '@/components/UI';

const navItems = [
  { label: 'Home', href: '#', active: true },
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
];

<Navigation items={navItems} />
```

### Variants

```tsx
// ניווט מינימלי
<Navigation 
  items={navItems}
  className="navigation--minimal"
/>

// ניווט עם pills
<Navigation 
  items={navItems}
  className="navigation--pills"
/>

// ניווט עם קו תחתון
<Navigation 
  items={navItems}
  className="navigation--underline"
/>

// ניווט אנכי
<Navigation 
  items={navItems}
  orientation="vertical"
/>
```

## שילוב Header עם Navigation

```tsx
import { Header, Navigation } from '@/components/UI';

const navItems = [
  { label: 'Home', href: '#', active: true },
  { label: 'About', href: '#' },
  { label: 'Services', href: '#' },
];

<Header 
  title="My Website"
  subtitle="Welcome to our platform"
>
  <Navigation 
    items={navItems}
    className="navigation--minimal"
  />
  <Button variant="primary">Sign Up</Button>
</Header>
```

## עיצוב SCSS

כל הקומפוננטים משתמשים ב-SCSS modules עם:

- משתנים מ-`../../styles/variables.scss`
- Mixins מ-`../../styles/mixins.scss`
- Responsive design עם breakpoints
- Transitions ו-animations
- Hover effects

### משתנים זמינים

```scss
$primary-color: #0070f3;
$secondary-color: #7928ca;
$text-color: #333;
$border-color: #eaeaea;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
```

### Mixins זמינים

```scss
@mixin flex-center;
@mixin flex-between;
@mixin responsive($breakpoint);
```
