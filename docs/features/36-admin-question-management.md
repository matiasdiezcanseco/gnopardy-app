# Feature 36: Admin Question Management

**Status**: Pending  
**Priority**: Medium  
**Category**: Frontend/Admin

## Description

Create admin interface for managing questions, including creating, editing, deleting questions with support for all question types and media uploads.

## Requirements

- Display list of questions (filtered by category)
- Form to create new question
- Form to edit existing question
- Delete question functionality
- Question type selection
- Media upload for audio/video/image
- Answer management for multiple choice

## Acceptance Criteria

- [ ] Admin page displays all questions
- [ ] Create question form supports all types
- [ ] Edit question form works
- [ ] Delete question with confirmation
- [ ] Question type can be selected
- [ ] Media can be uploaded
- [ ] Multiple choice answers can be managed
- [ ] Validation prevents invalid data

## Technical Notes

- Create `src/app/admin/questions/page.tsx`
- Use Server Actions from Feature 04
- Implement file upload handling
- Use shadcn/ui components

