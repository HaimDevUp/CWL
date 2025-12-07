# React + Next.js + SCSS + Zod Demo

פרויקט בסיסי המשלב את כל הטכנולוגיות המבוקשות:

- **React** - ספריית UI
- **Next.js** - מסגרת React עם App Router
- **SCSS** - עיצוב מתקדם עם משתנים ו-mixins
- **Zod** - ניהול מצבים וולידציה

## 🚀 התחלה מהירה

```bash
# התקנת dependencies
npm install

# הרצת השרת בפיתוח
npm run dev

# בניית הפרויקט לייצור
npm run build

# הרצת הפרויקט בייצור
npm start
```

## 📁 מבנה הפרויקט

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # עיצוב גלובלי (SCSS)
│   ├── layout.tsx         # Layout ראשי
│   ├── page.tsx           # דף ראשי
│   └── page.module.scss   # עיצוב לדף הראשי
├── components/            # קומפוננטים
│   ├── Button.tsx         # כפתור עם SCSS modules
│   ├── Button.module.scss
│   ├── Input.tsx          # שדה קלט עם ולידציה
│   ├── Input.module.scss
│   ├── Card.tsx           # כרטיס
│   ├── Card.module.scss
│   ├── UserForm.tsx       # טופס משתמש עם Zod
│   └── UserForm.module.scss
├── hooks/                 # Custom hooks
│   ├── useFormValidation.ts  # hook לוולידציה עם Zod
│   └── useLocalStorage.ts    # hook ל-localStorage
├── schemas/               # סכמות Zod
│   ├── user.ts           # סכמת משתמש
│   ├── todo.ts           # סכמת משימות
│   └── index.ts          # export מרכזי
└── styles/               # קבצי SCSS גלובליים
    ├── variables.scss    # משתנים
    ├── mixins.scss       # mixins
    └── globals.scss      # עיצוב גלובלי
```

## 🎨 תכונות SCSS

### משתנים
- צבעים (primary, secondary, success, warning, error)
- Breakpoints (mobile, tablet, desktop)
- Spacing system
- Border radius

### Mixins
- `@mixin flex-center` - מרכוז אלמנטים
- `@mixin flex-between` - פיזור עם מרווח
- `@mixin button-base` - עיצוב בסיסי לכפתורים
- `@mixin card` - עיצוב כרטיסים
- `@mixin responsive($breakpoint)` - responsive design

## 🔧 Zod Schemas

### User Schema
```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(0).max(120),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
```

### Todo Schema
```typescript
const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
```

## 🎯 Custom Hooks

### useFormValidation
Hook לניהול טופס עם ולידציה אוטומטית:
```typescript
const {
  values,
  errors,
  isSubmitting,
  isValid,
  setValue,
  handleSubmit,
  reset
} = useFormValidation({
  schema: UserFormSchema,
  initialValues,
  onSubmit: handleSubmit
});
```

### useLocalStorage
Hook לניהול localStorage עם ולידציה:
```typescript
const [data, setData, removeData] = useLocalStorage(
  'key',
  initialValue,
  schema // optional Zod schema
);
```

## 🎨 קומפוננטים

### Button
```tsx
<Button 
  variant="primary" 
  size="medium" 
  isLoading={false}
  onClick={handleClick}
>
  Click me
</Button>
```

### Input
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  isRequired
  helperText="Enter your email address"
/>
```

### Card
```tsx
<Card 
  padding="medium" 
  shadow="medium" 
  hover={true}
>
  Content
</Card>
```

## 🌐 דוגמה חיה

הפרויקט כולל דוגמה מלאה של:
- טופס הוספת משתמש עם ולידציה
- הצגת רשימת משתמשים
- עיצוב רספונסיבי
- ניהול מצב עם React hooks

## 🛠️ טכנולוגיות

- **React 18** - UI library
- **Next.js 15** - Full-stack React framework
- **TypeScript** - Type safety
- **SCSS** - CSS preprocessor
- **Zod** - Schema validation
- **ESLint** - Code linting

## 🔒 API Proxy - הסתרת קריאות API מ-Network Tab

הפרויקט משתמש ב-Next.js API Routes כפרוקסי כדי להסתיר את הקריאות לשרת החיצוני מהכרטיסייה Network בדפדפן.

### איך זה עובד?

1. **לקוח → Next.js Proxy**: כל הקריאות מהלקוח עוברות דרך `/api/proxy/*`
2. **Next.js Proxy → שרת חיצוני**: הפרוקסי מעביר את הקריאות לשרת החיצוני בצד השרת
3. **תוצאה**: ב-Network tab יראו רק קריאות ל-`/api/proxy/*` ולא לשרת החיצוני

### הגדרת משתני סביבה

צור קובץ `.env.local` בשורש הפרויקט:

```env
# עדיף להשתמש ב-API_BASE_URL (לא נחשף ללקוח)
API_BASE_URL=https://your-api-server.com

# או לחלופין (אבל זה נחשף ללקוח)
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com
```

**המלצה**: השתמש ב-`API_BASE_URL` (ללא `NEXT_PUBLIC_`) כדי שהכתובת לא תיחשף בקוד הלקוח.

### מבנה הקבצים

```
src/
├── app/
│   └── api/
│       └── proxy/
│           └── [...path]/
│               └── route.ts    # Next.js API route שמשמש כפרוקסי
└── api/
    └── index.ts                 # לקוח API שמשתמש בפרוקסי
```

### יתרונות

- ✅ הקריאות לשרת החיצוני לא נראות ב-Network tab
- ✅ כתובת השרת החיצוני לא נחשפת בקוד הלקוח
- ✅ תמיכה בכל סוגי התגובות (JSON, PDF, binary)
- ✅ העברת headers (Authorization, Cookies, וכו')

## 📝 רישיון

MIT License