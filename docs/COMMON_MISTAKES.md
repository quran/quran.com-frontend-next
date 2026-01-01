# Common Frontend Mistakes

> Patterns we've shipped bugs from. Check every PR against this list.

---

## 🔴 Critical Mistakes (Caused Production Issues)

### 1. Wrong Rendering Strategy

**Symptom**: Poor SEO, slow page loads, unnecessary server costs.

```tsx
// ❌ Bad: CSR for SEO-critical public pages (Google can't index)
const SurahPage = () => {
  const { data } = useSWR(`/api/surah/${id}`);
  return <SurahContent surah={data} />;
};

// ❌ Bad: SSR for static content (unnecessary server load every request)
export const getServerSideProps = async ({ params }) => {
  const surah = await fetchSurah(params.id); // Quran text doesn't change!
  return { props: { surah } };
};

// ✅ Good: SSG for static, SEO-critical content
export const getStaticProps = async ({ params }) => {
  const surah = await fetchSurah(params.id);
  return { props: { surah } };
};

export const getStaticPaths = async () => ({
  paths: Array.from({ length: 114 }, (_, i) => ({ params: { id: String(i + 1) } })),
  fallback: false,
});

// ✅ Good: ISR for content that updates occasionally
export const getStaticProps = async ({ params }) => {
  const reflections = await fetchPopularReflections();
  return { props: { reflections }, revalidate: 3600 }; // refresh hourly
};
```

**Quick Reference**:

| Content Type                      | Strategy | Example                            |
| --------------------------------- | -------- | ---------------------------------- |
| Never changes + SEO needed        | SSG      | Surah pages, Juz pages             |
| Updates periodically + SEO needed | ISR      | Popular reflections, curated lists |
| User-specific + SEO needed        | SSR      | Public user profiles               |
| User-specific + no SEO            | CSR      | Dashboard, bookmarks, settings     |

### 2. Missing Error State

**Symptom**: API fails, user sees blank screen or stale data.

```tsx
// ❌ Bad: No error handling
const { data } = useSWR('/api/reflections');
return <List items={data.items} />;

// ✅ Good: Handle all states
const { data, error, isLoading } = useSWR('/api/reflections');
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage onRetry={mutate} />;
if (!data?.items?.length) return <EmptyState />;
return <List items={data.items} />;
```

### 3. Trusting API Response Shape

**Symptom**: `Cannot read property 'x' of undefined` in production.

```tsx
// ❌ Bad: Assumes structure exists
const title = response.data.verse.translation.text;

// ✅ Good: Safe access with fallback
const title = response?.data?.verse?.translation?.text ?? '';
```

### 4. useSWR + useState Duplication

**Symptom**: UI shows stale data, state gets out of sync.

```tsx
// ❌ Bad: Duplicating SWR data into state
const { data } = useSWR('/api/bookmarks');
const [bookmarks, setBookmarks] = useState([]);
useEffect(() => {
  if (data) setBookmarks(data);
}, [data]);

// ✅ Good: Use SWR's cache directly, mutate for updates
const { data: bookmarks, mutate } = useSWR('/api/bookmarks');
const addBookmark = async (id) => {
  mutate([...bookmarks, { id }], false); // optimistic
  await api.addBookmark(id);
  mutate(); // revalidate
};
```

### 5. Unhandled Promise Rejection

**Symptom**: Silent failures, broken features with no feedback.

```tsx
// ❌ Bad: No error handling
const handleSubmit = async () => {
  await api.submitReflection(text);
  router.push('/success');
};

// ✅ Good: Handle failure
const handleSubmit = async () => {
  try {
    await api.submitReflection(text);
    router.push('/success');
  } catch (error) {
    logError(error);
    toast.error(t('common:error.submission-failed'));
  }
};
```

---

## 🟠 Frequent Mistakes (Cause Bugs or Bad UX)

### 6. Missing Loading State

**Symptom**: Layout shift, content pops in awkwardly.

```tsx
// ❌ Bad: No loading indicator
const { data } = useSWR('/api/verses');
return <VerseList verses={data?.verses} />;

// ✅ Good: Skeleton while loading
const { data, isLoading } = useSWR('/api/verses');
if (isLoading) return <VerseListSkeleton />;
return <VerseList verses={data?.verses ?? []} />;
```

### 7. Missing Empty State

**Symptom**: Weird UI when list is empty (blank space, broken layout).

```tsx
// ❌ Bad: Just renders empty list
return (
  <ul>
    {items.map((item) => (
      <li>{item}</li>
    ))}
  </ul>
);

// ✅ Good: Handle empty case
if (!items?.length) {
  return <EmptyState message={t('reflections:no-reflections')} />;
}
return (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item}</li>
    ))}
  </ul>
);
```

### 8. Array Index as Key

**Symptom**: Wrong items update, weird re-render bugs.

```tsx
// ❌ Bad: Index as key
{
  items.map((item, index) => <Card key={index} {...item} />);
}

// ✅ Good: Stable unique ID
{
  items.map((item) => <Card key={item.id} {...item} />);
}
```

### 9. Hardcoded Strings

**Symptom**: Arabic users see English text, broken i18n.

```tsx
// ❌ Bad: Hardcoded
<Button>Read More</Button>
<p>No results found</p>

// ✅ Good: Localized
<Button>{t('common:read-more')}</Button>
<p>{t('search:no-results')}</p>
```

### 10. CSS Left/Right Instead of Logical Properties

**Symptom**: Broken RTL layout (Arabic, Urdu users).

```scss
// ❌ Bad: Physical properties
.card {
  margin-left: 16px;
  padding-right: 8px;
  text-align: left;
  border-left: 2px solid;
}

// ✅ Good: Logical properties
.card {
  margin-inline-start: 16px;
  padding-inline-end: 8px;
  text-align: start;
  border-inline-start: 2px solid;
}
```

### 11. Div with onClick Instead of Button

**Symptom**: Not keyboard accessible, no focus state, screen readers ignore it.

```tsx
// ❌ Bad: Inaccessible
<div className={styles.card} onClick={handleClick}>
  Click me
</div>

// ✅ Good: Semantic + accessible
<button className={styles.card} onClick={handleClick} type="button">
  Click me
</button>

// ✅ Also good: If it navigates, use Link
<Link href="/verse/1" className={styles.card}>
  Go to verse
</Link>
```

---

## 🟡 Code Quality Mistakes

### 12. Console.log in Production

```tsx
// ❌ Bad: Debug code shipped
console.log('data', data);

// ✅ Good: Use proper logging utility or remove
logDebug('Fetched verses', { count: data.length });
```

### 13. Unnecessary useEffect

**Rule**: If you can derive it, don't effect it.

```tsx
// ❌ Bad: Derived state in effect
const [isValid, setIsValid] = useState(false);
useEffect(() => {
  setIsValid(email.includes('@') && password.length >= 8);
}, [email, password]);

// ✅ Good: Derive directly
const isValid = email.includes('@') && password.length >= 8;
```

### 14. Commented-Out Code

```tsx
// ❌ Bad: Dead code as comments
// const oldImplementation = () => { ... }
// TODO: maybe use this later?

// ✅ Good: Delete it. Git history has it if needed.
```

### 15. Giant Components

**Rule**: If a component is > 200 lines, it's doing too much.

```tsx
// ❌ Bad: 500-line component with mixed concerns

// ✅ Good: Split by responsibility
// - VersePage.tsx (layout + data fetching)
// - VerseHeader.tsx (title, navigation)
// - VerseContent.tsx (ayah display)
// - VerseActions.tsx (bookmark, share, reflect)
```

### 16. Any Type Without Justification

```tsx
// ❌ Bad: Silent any
const processData = (input: any) => { ... }

// ✅ Acceptable: Justified escape hatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Reason: Legacy API returns untyped response, typing tracked in QF-1234
const processLegacy = (input: any) => { ... }
```

---

## 🔵 Clean Code Violations

### 17. Violating DRY (Repeated Code)

**Symptom**: Same logic in multiple places, bug fixed in one but not others.

```tsx
// ❌ Bad: Date formatting duplicated across components
// In ComponentA.tsx
const formatted = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// In ComponentB.tsx
const formatted = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// In ComponentC.tsx
const formatted = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ✅ Good: Single source of truth
// utils/formatters.ts
export const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// All components
import { formatShortDate } from '@/utils/formatters';
const formatted = formatShortDate(date);
```

### 18. Violating KISS (Over-Engineering)

**Symptom**: Simple task buried in abstraction layers.

```tsx
// ❌ Bad: Factory pattern for a simple fetch
const createApiFetcherFactory = (baseConfig) => (endpointConfig) => (params) =>
  fetch(buildUrl(baseConfig, endpointConfig, params), mergeConfigs(baseConfig, endpointConfig));

const fetchVerse = createApiFetcherFactory({ base: API_URL })({ endpoint: 'verses' });
const verse = await fetchVerse({ id: 1 });

// ✅ Good: Just fetch the thing
const fetchVerse = async (id: string) => {
  const response = await fetch(`${API_URL}/verses/${id}`);
  return response.json();
};
const verse = await fetchVerse('1');
```

### 19. Violating Single Responsibility

**Symptom**: Component does many unrelated things, hard to test/modify.

```tsx
// ❌ Bad: One component does everything
const VersePage = () => {
  // Fetching
  const [verse, setVerse] = useState()
  useEffect(() => { fetchVerse(id).then(setVerse) }, [id])

  // Analytics
  useEffect(() => { trackPageView('verse', id) }, [id])

  // Audio control
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef()

  // Bookmarking
  const [isBookmarked, setIsBookmarked] = useState(false)
  const handleBookmark = async () => { ... }

  // Rendering all of it
  return (
    <div>
      <audio ref={audioRef} />
      <button onClick={() => setIsPlaying(!isPlaying)}>Play</button>
      <button onClick={handleBookmark}>Bookmark</button>
      <p>{verse?.text}</p>
    </div>
  )
}

// ✅ Good: Separated concerns
const VersePage = ({ id }: { id: string }) => {
  const verse = useVerse(id)           // Custom hook for fetching
  useTrackPageView('verse', id)        // Custom hook for analytics

  return (
    <article>
      <VerseAudioPlayer verseKey={id} />
      <VerseText verse={verse} />
      <VerseActions verseKey={id} />
    </article>
  )
}
```

### 20. Not Using Composition

**Symptom**: Props list keeps growing, component becomes rigid.

```tsx
// ❌ Bad: Prop explosion
<Card
  title="Reflection"
  subtitle="By Ahmed"
  showAvatar={true}
  avatarSrc="/ahmed.jpg"
  showActions={true}
  actions={['like', 'share']}
  onLike={handleLike}
  onShare={handleShare}
  footer="2 hours ago"
  isHighlighted={true}
  // 15 more props...
/>

// ✅ Good: Composition
<Card highlighted>
  <Card.Header>
    <Avatar src="/ahmed.jpg" />
    <Card.Title>Reflection</Card.Title>
    <Card.Subtitle>By Ahmed</Card.Subtitle>
  </Card.Header>
  <Card.Body>{content}</Card.Body>
  <Card.Footer>
    <LikeButton onClick={handleLike} />
    <ShareButton onClick={handleShare} />
    <Timestamp date={createdAt} />
  </Card.Footer>
</Card>
```

---

## 🔵 SOLID Principles (React Edition)

### 21. Single Responsibility Violation

**Rule**: Each component/hook does ONE thing.

```tsx
// ❌ Bad: Component does fetching + formatting + rendering + tracking
const VersePage = () => {
  const [verse, setVerse] = useState()
  useEffect(() => { fetch(...).then(format).then(setVerse).then(track) }, [])
  return <div>...</div>
}

// ✅ Good: Separated concerns
const VersePage = () => {
  const verse = useVerse(verseKey)        // hook handles fetching
  useTrackView(verseKey)                   // hook handles analytics
  return <VerseDisplay verse={verse} />    // component handles rendering
}
```

### 22. Open/Closed Violation

**Rule**: Extend via props/composition, don't modify existing components for new cases.

```tsx
// ❌ Bad: Modifying component for each new case
const Button = ({ type }) => {
  if (type === 'primary') return <button className={styles.primary}>...
  if (type === 'danger') return <button className={styles.danger}>...
  if (type === 'ghost') return <button className={styles.ghost}>...
  // keeps growing...
}

// ✅ Good: Composable via props
const Button = ({ variant = 'primary', className, ...props }) => (
  <button className={clsx(styles.base, styles[variant], className)} {...props} />
)
```

### 23. Liskov Substitution Violation

**Rule**: Custom components should be drop-in replacements for native elements.

```tsx
// ❌ Bad: Custom input doesn't forward ref or standard props
const Input = ({ value, onChange }) => <input value={value} onChange={onChange} />;

// ✅ Good: Extends native input seamlessly
const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={clsx(styles.input, className)} {...props} />
));
```

### 24. Interface Segregation Violation

**Rule**: Don't force components to accept props they don't use.

```tsx
// ❌ Bad: Mega props interface
interface CardProps {
  title: string;
  subtitle?: string;
  image?: string;
  actions?: Action[];
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  showActions?: boolean;
  // 20 more props...
}

// ✅ Good: Compose smaller components
<Card>
  <CardHeader title={title} subtitle={subtitle} />
  <CardImage src={image} />
  <CardActions>
    <EditButton onClick={onEdit} />
  </CardActions>
</Card>;
```

### 25. Dependency Inversion Violation

**Rule**: Depend on abstractions (hooks, context), not concretions.

```tsx
// ❌ Bad: Direct API dependency in component
const BookmarkButton = ({ verseKey }) => {
  const handleClick = () => {
    fetch('/api/bookmarks', { method: 'POST', body: { verseKey } });
  };
};

// ✅ Good: Abstracted via hook
const BookmarkButton = ({ verseKey }) => {
  const { addBookmark } = useBookmarks(); // hook abstracts API
  const handleClick = () => addBookmark(verseKey);
};
```

---

## 🔵 Separation of Concerns

Keep these layers distinct:

| Layer              | Responsibility              | Location                                  |
| ------------------ | --------------------------- | ----------------------------------------- |
| **Data fetching**  | API calls, caching          | Custom hooks (`useVerse`, `useBookmarks`) |
| **Business logic** | Transformations, validation | Utils or hooks                            |
| **UI State**       | Loading, errors, modals     | Component state or context                |
| **Presentation**   | Rendering, styling          | Components + SCSS modules                 |

### 26. Mixed Concerns

**Symptom**: Hard to test, hard to reuse, changes ripple everywhere.

```tsx
// ❌ Bad: All mixed together
const VersePage = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/verses/${id}`)
      .then((r) => r.json())
      .then((d) => {
        // business logic mixed in
        const formatted = { ...d, text: d.text.trim().toUpperCase() };
        setData(formatted);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  return <div className="verse">{data.text}</div>;
};

// ✅ Good: Separated
// hooks/useVerse.ts — Data fetching
export const useVerse = (id: string) => {
  const { data, isLoading, error } = useSWR(`/api/verses/${id}`);
  return { verse: data ? formatVerse(data) : null, isLoading, error };
};

// utils/formatVerse.ts — Business logic
export const formatVerse = (raw: RawVerse): Verse => ({
  ...raw,
  text: raw.text.trim(),
});

// components/VersePage.tsx — Presentation
const VersePage = ({ id }: { id: string }) => {
  const { verse, isLoading, error } = useVerse(id);

  if (isLoading) return <VerseSkeleton />;
  if (error) return <ErrorState onRetry={() => mutate()} />;
  return <VerseDisplay verse={verse} />;
};
```

---

## Quick Reference Checklist

Before marking PR ready for review:

```
States & Error Handling
□ Loading state exists (skeleton/spinner)
□ Error state exists (retry option)
□ Empty state exists
□ All async has try/catch

Rendering & Performance
□ Correct rendering strategy (SSG/ISR/SSR/CSR)
□ No unnecessary re-renders
□ New packages evaluated (< 10kb gzipped)

TypeScript & Code Quality
□ No any without justification comment
□ No console.log
□ No commented-out code
□ Functions < 30 lines
□ No repeated code (DRY)

React Patterns
□ No unnecessary useEffect
□ No useSWR + useState duplication
□ No index as key
□ Semantic elements (button, not div onClick)

Localization & RTL
□ No hardcoded strings (use t())
□ No CSS left/right (use logical properties)

SOLID & Architecture
□ Single responsibility per component/hook
□ Extend via composition, not modification
□ Custom components forward refs and spread props
□ Small, focused prop interfaces
□ API calls abstracted in hooks, not components
□ Separated concerns (fetch → hooks, logic → utils, UI → components)
```

---

> 💡 **Seen a new pattern we keep getting wrong?** Add it here with a PR to this doc.
