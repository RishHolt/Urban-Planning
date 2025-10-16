# Component Library

A comprehensive, production-ready React component library built with TypeScript and Tailwind CSS.

## Features

- 🎨 **Consistent Design System** - Unified theming and spacing
- 🌙 **Dark Mode Support** - Built-in dark mode compatibility
- ♿ **Accessibility First** - ARIA labels, keyboard navigation, screen reader support
- 📱 **Responsive Design** - Mobile-first approach with responsive utilities
- 🎯 **TypeScript Support** - Full type safety and IntelliSense
- ⚡ **Performance Optimized** - Lazy loading, memoization, and efficient re-renders
- 🧩 **Composable** - Mix and match components for complex UIs

## Installation

```tsx
import { Button, Input, Alert } from '@/components';
```

## Components

### Tier 1 - Must-Have Components

#### Button
Enhanced button component with multiple variants, sizes, and states.

```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Click me
</Button>

<Button variant="outlined" leftIcon={<Plus />} rightIcon={<ArrowRight />}>
  Add Item
</Button>

<Button variant="ghost" iconOnly>
  <Settings />
</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "accent" | "outlined" | "ghost" | "danger" | "success"
- `size`: "sm" | "md" | "lg" | "xl"
- `loading`: boolean
- `leftIcon` / `rightIcon`: React.ReactNode
- `fullWidth`: boolean
- `iconOnly`: boolean

#### Input
Advanced input component with validation states, icons, and enhanced features.

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  leftIcon={<Mail />}
  state="success"
  clearable
  showCharCount
  maxLength={100}
/>

<Input
  label="Password"
  type="password"
  state="error"
  error="Password is required"
  helperText="Must be at least 8 characters"
/>
```

**Props:**
- `state`: "default" | "error" | "success" | "warning"
- `prefix` / `suffix`: React.ReactNode
- `clearable`: boolean
- `showCharCount`: boolean
- `leftIcon` / `rightIcon`: React.ReactNode

#### Alert
Flexible alert component for notifications and feedback.

```tsx
<Alert variant="success" title="Success!" dismissible>
  Your changes have been saved.
</Alert>

<Alert variant="error" title="Error" action={<Button>Retry</Button>}>
  Something went wrong. Please try again.
</Alert>
```

**Props:**
- `variant`: "success" | "error" | "warning" | "info"
- `dismissible`: boolean
- `title`: string
- `description`: string
- `action`: React.ReactNode
- `autoDismiss`: number (milliseconds)

#### Toast
Global notification system with positioning and auto-dismiss.

```tsx
// Wrap your app with ToastProvider
<ToastProvider position="top-right">
  <App />
</ToastProvider>

// Use in components
const { addToast } = useToast();

addToast({
  type: "success",
  title: "Success!",
  description: "Your action was completed.",
  duration: 5000
});
```

#### Select
Advanced select component with search, multi-select, and grouping.

```tsx
<Select
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  searchable
  multiple
  clearable
  placeholder="Select options..."
/>

const options = [
  { value: "1", label: "Option 1", group: "Group A" },
  { value: "2", label: "Option 2", group: "Group A" },
  { value: "3", label: "Option 3", group: "Group B" },
];
```

#### Table
Enhanced table with sorting, filtering, and responsive design.

```tsx
<Table
  columns={columns}
  data={data}
  sortable
  filterable
  selectable
  onRowClick={handleRowClick}
/>
```

### Tier 2 - Frequently Needed Components

#### Checkbox & Radio
Form controls with consistent styling and validation.

```tsx
<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="I agree to the terms"
  description="Please read our terms and conditions"
/>

<RadioGroup value={selectedValue} onChange={setSelectedValue}>
  <Radio value="option1" label="Option 1" />
  <Radio value="option2" label="Option 2" />
</RadioGroup>
```

#### Switch
Toggle switch for boolean values.

```tsx
<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable notifications"
  color="primary"
  size="md"
/>
```

#### Badge & Tag
Status indicators and labels.

```tsx
<Badge variant="success" size="md">
  Active
</Badge>

<Tag variant="outlined" color="primary" removable>
  React
</Tag>

<StatusTag status="active" />
```

#### Spinner & Skeleton
Loading states and placeholders.

```tsx
<Spinner size="md" variant="circle" label="Loading..." />

<Skeleton variant="text" lines={3} />
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
```

#### Tabs
Content organization with multiple variants.

```tsx
<Tabs defaultValue="tab1" variant="pill">
  <TabList>
    <Tab value="tab1">Tab 1</Tab>
    <Tab value="tab2" badge="3">Tab 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel value="tab1">Content 1</TabPanel>
    <TabPanel value="tab2">Content 2</TabPanel>
  </TabPanels>
</Tabs>
```

#### Accordion
Collapsible content sections.

```tsx
<Accordion allowMultiple>
  <AccordionItem value="item1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Avatar
User avatars with status indicators.

```tsx
<Avatar
  src="/avatar.jpg"
  name="John Doe"
  size="lg"
  status="online"
/>

<AvatarGroup max={5}>
  <Avatar name="User 1" />
  <Avatar name="User 2" />
  <Avatar name="User 3" />
</AvatarGroup>
```

#### Breadcrumbs
Navigation breadcrumbs with responsive design.

```tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Current Page" }
  ]}
  showHome
  maxItems={3}
/>
```

## Theming

All components use CSS custom properties for theming:

```css
:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --accent: #06b6d4;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
}
```

## Dark Mode

Components automatically adapt to dark mode using Tailwind's dark mode classes:

```tsx
// Enable dark mode
document.documentElement.classList.add('dark');
```

## Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance (WCAG AA)

## Performance

- Lazy loading for heavy components
- Memoization for expensive operations
- Virtual scrolling for large lists
- Optimized re-renders

## Examples

### Form with Validation
```tsx
const [formData, setFormData] = useState({ email: '', password: '' });
const [errors, setErrors] = useState({});

return (
  <form className="space-y-4">
    <Input
      label="Email"
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({...formData, email: e.target.value})}
      error={errors.email}
      required
    />
    
    <Input
      label="Password"
      type="password"
      value={formData.password}
      onChange={(e) => setFormData({...formData, password: e.target.value})}
      error={errors.password}
      required
    />
    
    <Button type="submit" fullWidth>
      Sign In
    </Button>
  </form>
);
```

### Dashboard with Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card title="Total Users" value="1,234" change="+12%" />
  <Card title="Revenue" value="$45,678" change="+8%" />
  <Card title="Orders" value="567" change="+15%" />
  <Card title="Conversion" value="3.2%" change="-2%" />
</div>
```

### Data Table with Actions
```tsx
<Table
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', render: (value) => <StatusTag status={value} /> },
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="outlined">Edit</Button>
        <Button size="sm" variant="danger">Delete</Button>
      </div>
    )}
  ]}
  data={users}
  selectable
  onSelectionChange={setSelectedUsers}
/>
```

## Contributing

When adding new components:
1. Follow the established patterns
2. Include TypeScript types
3. Add accessibility features
4. Support dark mode
5. Include examples in documentation
6. Test with different screen sizes

## License

MIT License - see LICENSE file for details.
