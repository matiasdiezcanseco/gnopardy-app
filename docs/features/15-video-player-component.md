# Feature 15: Video Player Component

**Status**: Pending  
**Priority**: Medium  
**Category**: Frontend/Components

## Description

Create a VideoPlayer component that displays and plays video files for video-type questions with standard playback controls.

## Requirements

- Display video player with play/pause controls
- Show video progress and time remaining
- Support multiple video formats (mp4, webm)
- Handle loading states
- Responsive video sizing
- Fullscreen option

## Acceptance Criteria

- [ ] VideoPlayer component renders video element
- [ ] Play/pause button works correctly
- [ ] Progress bar shows playback position
- [ ] Time remaining displayed
- [ ] Video is responsive (maintains aspect ratio)
- [ ] Fullscreen button available
- [ ] Loading state shown while video loads
- [ ] Error handling for failed video loads
- [ ] Accessible controls

## Technical Notes

- Create `src/components/question/VideoPlayer.tsx`
- Use HTML5 video element
- Consider using react-player or similar library
- Follow responsive design patterns

