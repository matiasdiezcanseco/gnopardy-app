# Feature 35: Admin Category Management

**Status**: Pending  
**Priority**: Medium  
**Category**: Frontend/Admin

## Description

Create admin interface for managing categories, including creating, editing, deleting, and viewing categories.

## Requirements

- Display list of all categories
- Form to create new category
- Form to edit existing category
- Delete category functionality
- Category preview
- Validation for category fields

## Acceptance Criteria

- [ ] Admin page displays all categories
- [ ] Create category form works
- [ ] Edit category form works
- [ ] Delete category with confirmation
- [ ] Category name, description, color editable
- [ ] Validation prevents invalid data
- [ ] Success/error messages displayed
- [ ] Categories refresh after changes

## Technical Notes

- Create `src/app/admin/categories/page.tsx`
- Use Server Actions from Feature 03
- Use shadcn/ui Form components
- Follow admin patterns

