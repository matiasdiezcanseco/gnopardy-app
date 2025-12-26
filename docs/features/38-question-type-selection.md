# Feature 38: Question Type Selection

**Status**: Pending  
**Priority**: Medium  
**Category**: Frontend/Admin

## Description

Implement question type selection in admin forms, showing/hiding relevant fields based on selected type.

## Requirements

- Dropdown/select for question type
- Show text input for text questions
- Show answer options for multiple choice
- Show media upload for audio/video/image
- Dynamic form fields based on type
- Validation based on type

## Acceptance Criteria

- [ ] Question type selector displays all types
- [ ] Form fields show/hide based on type
- [ ] Text questions show text input only
- [ ] Multiple choice shows answer options
- [ ] Audio/video/image show media upload
- [ ] Validation adapts to question type
- [ ] Form submission handles all types

## Technical Notes

- Use conditional rendering in forms
- Use shadcn/ui Select component
- Follow form patterns from `docs/COMPONENTS.md`
- Implement type-specific validation

