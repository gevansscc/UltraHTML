# Blackboard Ultra Content Builder

  A lightweight, Markdown-inspired content authoring system for creating structured, visually consistent course content for Blackboard Ultra.
  The Content Builder uses a simple component-based syntax to transform plain-text content into reusable page elements such as hero banners, content sections, cards, callouts, lists, and multi-column layouts.
  The goal is to make course content easier to author, maintain, and reuse without requiring instructors to manually build and format every page inside Blackboard Ultra.

## Features
  * Component-based content using simple ::: syntax
  * Hero sections for course and module introductions
  * Structured content sections with optional multi-column layouts
  * Card layouts for projects, assignments, resources, and topics
  * Callouts for warnings, reminders, and important information
  * Formatted lists for structured information such as grading breakdowns
  * Markdown-style text formatting
  * Reusable page structures that can be copied and adapted between courses
  * Consistent visual presentation without requiring manual page formatting

## Design Philosophy

The project is built around a simple principle:

> **Content should describe what something is, not how it should look.**

Rather than asking an instructor to manually construct a layout, the author defines the role of the content:

- `hero` describes an introductory banner
- `section` groups related information
- `cards` presents a collection of related items
- `callout` emphasizes important information
- `list` organizes scannable information

This creates a separation between **content and presentation**, making course materials easier to update and keeping the visual language consistent across a course or program.

## Intended Use

The Content Builder is designed primarily for educational content, particularly courses where instructors need to create large amounts of structured material while maintaining a consistent visual system.

It can be used for:

- Course introductions
- Module landing pages
- Assignment descriptions
- Project overviews
- Grading information
- Submission instructions
- Resource collections
- Learning activities
- Course documentation
