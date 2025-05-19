# Tailwind CSS Implementation in Truck Fleet Tracking App

This guide explains the current state of the Tailwind CSS implementation and next steps.

## Current State

We've successfully implemented Tailwind CSS in the project:

1. Installed Tailwind CSS and its dependencies
   - tailwindcss@npm:@tailwindcss/postcss7-compat
   - postcss@^7
   - autoprefixer@^9
   - postcss-flexbugs-fixes@4.2.1
   - postcss-preset-env@6.7.0
   - postcss-normalize@8.0.1

2. Configured Tailwind CSS
   - Created tailwind.config.js with custom colors and theme settings
   - Updated postcss.config.js to include all required plugins
   - Modified index.css to include Tailwind directives

3. Created UI components
   - Button component
   - Card component
   - Badge component
   - Dialog/Modal component
   - Table component
   - Toast notification system

4. Updated the Navbar component to use Tailwind classes

## Next Steps

### 1. Update Dashboard Screen

Replace the existing Dashboard screen with the example implementation:

```jsx
// Replace the content of src/Screens/Dashboard/index.js with the content from
// src/Screens/Dashboard/DashboardExample.jsx
```

### 2. Update Other Screens

Apply Tailwind CSS classes to the remaining screens:

- Trucks screen
- Drivers screen
- Maintenance screen
- Reports screen
- Settings screen

### 3. Create More UI Components

As needed, create more UI components:

- Form inputs
- Select dropdowns
- Checkboxes
- Radio buttons
- Tabs
- etc.

### 4. Remove Old CSS Files

Once all components have been migrated to use Tailwind CSS, remove the old CSS files:

- src/components/Navbar/Navbar.css
- src/components/Notifications/Notifications.css
- src/Screens/Dashboard/Dashboard.css
- etc.

## Usage Examples

### Button Component

```jsx
import { Button } from '../components/ui/button';

// Default button
<Button>Click me</Button>

// Primary button
<Button variant="default">Primary</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card Component

```jsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge Component

```jsx
import { Badge } from '../components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="active">Active</Badge>
<Badge variant="maintenance">Maintenance</Badge>
<Badge variant="inactive">Inactive</Badge>
```

### Toast Notifications

```jsx
import { useToast } from '../hooks/use-toast';

const { toast } = useToast();

// Success notification
toast.success('Success Title', 'Success message');

// Error notification
toast.error('Error Title', 'Error message');

// Warning notification
toast.warning('Warning Title', 'Warning message');

// Info notification
toast.info('Info Title', 'Info message');
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS with Create React App](https://tailwindcss.com/docs/guides/create-react-app)
- [Lucide Icons](https://lucide.dev/icons/) - Used for icons in components
