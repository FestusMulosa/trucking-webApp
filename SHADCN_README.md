# Implementing shadcn/ui in Truck Fleet Tracking App

This guide explains how to continue implementing shadcn/ui components in your Truck Fleet Tracking application.

## What's Been Done

1. Installed and configured Tailwind CSS
2. Set up shadcn/ui base components
3. Created a new toast notification system to replace the old one
4. Updated the Navbar component to use shadcn/ui and Tailwind CSS
5. Created example components for the Dashboard screen

## Core Components Added

- Button (`src/components/ui/button.jsx`)
- Card (`src/components/ui/card.jsx`)
- Badge (`src/components/ui/badge.jsx`)
- Dialog/Modal (`src/components/ui/dialog.jsx`)
- Switch (`src/components/ui/switch.jsx`)
- Toast (`src/components/ui/toast.jsx` and `src/hooks/use-toast.js`)
- Input (`src/components/ui/input.jsx`)
- Table (`src/components/ui/table.jsx`)
- Custom components:
  - StatusCard (`src/components/ui/status-card.jsx`)
  - TruckList (`src/components/ui/truck-list.jsx`)

## Example Implementation

Check out `src/Screens/Dashboard/DashboardExample.jsx` for an example of how to implement shadcn/ui components in your screens. This file shows how to:

1. Use the StatusCard component for the dashboard summary cards
2. Use the TruckList component for displaying truck data
3. Use the Dialog component for the truck details modal
4. Use Tailwind CSS classes for layout and styling

## Next Steps

### 1. Update Screen Components

Replace the existing components in each screen with shadcn/ui components:

- **Dashboard**: Use the example implementation as a guide
- **Trucks**: Replace the truck list, filters, and modals
- **Drivers**: Replace the driver list and forms
- **Maintenance**: Replace the maintenance list and forms
- **Reports**: Replace the report cards and charts
- **Settings**: Replace the settings cards, toggles, and forms

### 2. Add More shadcn/ui Components

As needed, add more shadcn/ui components from the official website:

```bash
# Example of adding a new component (run in your project directory)
npx shadcn-ui@latest add [component-name]
```

Common components you might want to add:

- Select
- Checkbox
- Radio Group
- Tabs
- Accordion
- Date Picker
- Form

### 3. Update Global Styles

The global styles have been updated in `src/index.css` to include Tailwind directives and shadcn/ui variables. You can customize the theme by modifying the CSS variables in this file.

### 4. Remove Old CSS Files

Once you've migrated all components to use Tailwind CSS and shadcn/ui, you can remove the old CSS files:

- `src/components/Navbar/Navbar.css`
- `src/components/Notifications/Notifications.css`
- `src/Screens/Dashboard/Dashboard.css`
- etc.

### 5. Update Context Providers

The NotificationContext has been replaced with the shadcn/ui toast system. Update any components that use the old notification system to use the new toast hooks:

```jsx
// Old way
import { useNotification } from '../../context/NotificationContext';
const notification = useNotification();
notification.success('Title', 'Message');

// New way
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
toast.success('Title', 'Message');
```

## Troubleshooting

### Path Aliases

The project is configured to use the `@/` path alias for imports. If you encounter issues with imports, make sure your IDE recognizes the path alias configuration in `jsconfig.json`.

### Component Styling

If components don't look as expected, check:

1. That you're using the correct Tailwind CSS classes
2. That the component is properly imported
3. That you're passing the correct props to the component

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/) - Used for icons in shadcn/ui components
