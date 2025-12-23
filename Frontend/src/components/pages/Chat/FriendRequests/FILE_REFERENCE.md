# FriendRequests Module - File Reference Guide

## Complete File Structure

```
src/components/pages/Chat/FriendRequests/
│
├── 📄 FriendRequests.jsx
│   ├── Purpose: Main component & orchestrator
│   ├── Size: ~100 lines
│   ├── Key Exports: default (FriendRequests component)
│   ├── Responsibilities:
│   │   ├─ Route parameter management
│   │   ├─ Responsive layout handling
│   │   ├─ Window resize listener
│   │   ├─ Action handlers (accept, block, cancel)
│   │   ├─ Tab navigation
│   │   └─ Hook integration
│   └── Dependencies:
│       ├─ react (useState, useEffect, useParams)
│       ├─ useFriendRequests, useFriendActions
│       ├─ RequestsList component
│       └─ UI: Tabs, ScrollArea
│
├── 📄 RequestsList.jsx
│   ├── Purpose: List container component
│   ├── Size: ~70 lines
│   ├── Key Exports: default (RequestsList component)
│   ├── Responsibilities:
│   │   ├─ State presentation (loading/error/empty)
│   │   ├─ List rendering with animations
│   │   ├─ Responsive layout management
│   │   ├─ Individual item delegation
│   │   └─ Scroll area management
│   └── Key Props:
│       ├─ data: Array<Request>
│       ├─ isLoading: Boolean
│       ├─ error: Boolean
│       ├─ errorMessage: String
│       ├─ renderActions: Function
│       ├─ isPending: Boolean
│       ├─ isCompact: Boolean
│       ├─ onRequestSelect: Function
│       ├─ type: 'incoming' | 'sent'
│       ├─ scrollHeight: String (CSS class)
│       └─ contentMaxWidth: String (CSS class)
│
├── 📄 RequestItem.jsx
│   ├── Purpose: Individual request item renderer
│   ├── Size: ~55 lines
│   ├── Key Exports: default (RequestItem component)
│   ├── Responsibilities:
│   │   ├─ Dual mode rendering (compact/full)
│   │   ├─ Avatar display
│   │   ├─ User info display
│   │   ├─ Action delegation
│   │   └─ Selection handling
│   ├── Rendering Modes:
│   │   ├─ Compact: Small list item (sidebar/modal)
│   │   └─ Full: RequestCard with full actions
│   └── Key Props:
│       ├─ request: Object (id, username, avatarUrl, type)
│       ├─ isCompact: Boolean
│       ├─ onSelect: Function
│       ├─ actions: Object
│       └─ isPending: Boolean
│
├── 📄 EmptyState.jsx
│   ├── Purpose: Empty state display component
│   ├── Size: ~45 lines
│   ├── Key Exports: default (EmptyState component)
│   ├── Responsibilities:
│   │   ├─ Type-aware icon rendering
│   │   ├─ Message display
│   │   ├─ Animations
│   │   └─ Dark mode support
│   ├── Animations:
│   │   ├─ Icon: Bobbing (incoming) or Rotating (sent)
│   │   └─ Text: Staggered fade-in
│   └── Key Props:
│       └─ type: 'incoming' | 'sent'
│
├── 📄 requestTypeConstants.js
│   ├── Purpose: Centralized constants & configuration
│   ├── Size: ~45 lines
│   ├── Key Exports:
│   │   ├─ REQUEST_TYPES (object)
│   │   ├─ REQUEST_STATUS (object)
│   │   ├─ REQUEST_TYPE_CONFIG (object)
│   │   └─ REQUEST_MESSAGES (object)
│   ├── REQUEST_TYPES:
│   │   ├─ INCOMING: 'incoming'
│   │   └─ SENT: 'sent'
│   ├── REQUEST_STATUS:
│   │   ├─ PENDING: 'PENDING'
│   │   ├─ ACCEPTED: 'ACCEPTED'
│   │   └─ BLOCKED: 'BLOCKED'
│   └── REQUEST_TYPE_CONFIG:
│       ├─ [INCOMING]: { icon, title, subtitle, actions }
│       └─ [SENT]: { icon, title, subtitle, actions }
│
├── 📄 index.js
│   ├── Purpose: Module interface & exports
│   ├── Size: ~20 lines
│   ├── Key Exports:
│   │   ├─ default: FriendRequests (backward compat)
│   │   ├─ FriendRequests (named export)
│   │   ├─ RequestItem
│   │   ├─ RequestsList
│   │   ├─ EmptyState
│   │   ├─ REQUEST_TYPES
│   │   ├─ REQUEST_STATUS
│   │   ├─ REQUEST_TYPE_CONFIG
│   │   └─ REQUEST_MESSAGES
│   └── Enables:
│       ├─ Old import style (backward compat)
│       └─ New modular imports
│
├── 📖 README.md
│   ├── Purpose: Comprehensive component documentation
│   ├── Size: ~400+ lines
│   ├── Sections:
│   │   ├─ Overview & Architecture
│   │   ├─ Component Breakdown
│   │   ├─ Hook Documentation
│   │   ├─ Constants Reference
│   │   ├─ Usage Examples
│   │   ├─ Integration Points
│   │   ├─ Responsive Design
│   │   ├─ Features & Benefits
│   │   ├─ Migration Guide
│   │   ├─ File Sizes
│   │   ├─ Future Improvements
│   │   ├─ Dependencies
│   │   └─ Troubleshooting
│   └── Audience: Developers using the module
│
├── 📐 ARCHITECTURE.md
│   ├── Purpose: Deep dive into design and structure
│   ├── Size: ~400+ lines
│   ├── Sections:
│   │   ├─ Refactoring Overview
│   │   ├─ Directory Structure
│   │   ├─ Component Breakdown (detailed)
│   │   ├─ Data Flow Diagrams
│   │   ├─ State Management
│   │   ├─ Responsive Design Strategy
│   │   ├─ Performance Optimizations
│   │   ├─ Integration Points
│   │   ├─ Testing Strategy
│   │   ├─ Migration Path
│   │   ├─ File Size Comparison
│   │   ├─ Benefits Summary
│   │   ├─ Future Enhancements
│   │   ├─ Dependencies
│   │   └─ Conclusion
│   └── Audience: Architects, maintainers, contributors
│
└── 📝 SUMMARY.md
    ├── Purpose: Quick overview and reference
    ├── Size: ~250 lines
    ├── Sections:
    │   ├─ What Was Done
    │   ├─ New Structure
    │   ├─ Component Breakdown
    │   ├─ Key Features
    │   ├─ Quick Start
    │   ├─ Architecture Overview
    │   ├─ Responsive Design
    │   ├─ State Management
    │   ├─ Benefits
    │   ├─ Backward Compatibility
    │   ├─ Next Steps
    │   └─ Quick Reference
    └── Audience: Everyone (quick overview)
```

## Total Module Statistics

| Metric | Value |
|--------|-------|
| **Files** | 8 (7 code/docs, 1 index) |
| **Code Files** | 5 (4 components + 1 constants) |
| **Documentation Files** | 3 (README, ARCHITECTURE, SUMMARY) |
| **Total Lines** | ~1000+ (includes docs) |
| **Original File** | 229 lines |
| **Main Component** | 100 lines (-56%) |
| **Sub-components** | 4 (55-70 lines each) |
| **Constants** | 1 (45 lines) |

## Import Patterns

### Pattern 1: Default Import (Backward Compatible)
```javascript
import FriendRequests from '@/components/pages/Chat/FriendRequests';

// Usage
<FriendRequests onRequestSelect={handler} />
```

### Pattern 2: Named Import (New Way)
```javascript
import { FriendRequests } from '@/components/pages/Chat/FriendRequests';

// Usage
<FriendRequests onRequestSelect={handler} />
```

### Pattern 3: Sub-components
```javascript
import { RequestsList, RequestItem, EmptyState } from '@/components/pages/Chat/FriendRequests';

// Custom implementation
<RequestsList data={requests} renderActions={getActions} />
```

### Pattern 4: Constants
```javascript
import { REQUEST_TYPES, REQUEST_STATUS } from '@/components/pages/Chat/FriendRequests';

// Use constants
if (request.type === REQUEST_TYPES.INCOMING) {
  // ...
}
```

## Component Dependencies

### External Dependencies
- `react` (18+)
- `react-router-dom` (6+)
- `framer-motion` (10+)
- `lucide-react` (0.200+)
- `tailwindcss` (3+)

### Internal Dependencies
- `@/hooks/friend/useFriendRequests`
- `@/hooks/friend/useFriendActions`
- `@/components/ui/tabs`
- `@/components/ui/scroll-area`
- `@/components/ui/avatar`
- `@/components/ui/RequestCard`
- `@/components/ui/LoadingState`
- `@/components/ui/ErrorState`

## File Purposes at a Glance

| File | What It Does | Who Should Read |
|------|-------------|-----------------|
| FriendRequests.jsx | Coordinates the entire feature | Developers using the component |
| RequestsList.jsx | Renders the request list | Component maintainers |
| RequestItem.jsx | Renders individual requests | UI developers |
| EmptyState.jsx | Shows empty state UI | UX/UI developers |
| requestTypeConstants.js | Defines constants | All developers |
| index.js | Provides module interface | Import resolution |
| README.md | How to use components | Developers implementing features |
| ARCHITECTURE.md | Why it's designed this way | Architects, senior devs |
| SUMMARY.md | Quick reference | Everyone (quick lookup) |

## Quick Decision Guide

**I want to...**
- Use the main component → Default import or FriendRequests named import
- Understand how to use it → Read README.md
- Understand why it's built this way → Read ARCHITECTURE.md
- Get a quick overview → Read SUMMARY.md
- Use sub-components → Import from index.js
- Add a new request type → Update requestTypeConstants.js
- Style the component → Check Tailwind classes in each component
- Add animations → Check Framer Motion usage in EmptyState.jsx

## Component Relationship Diagram

```
┌─────────────────────────────────────────────┐
│ FriendRequests (Main)                       │
│ ├─ Manages state                            │
│ ├─ Handles actions                          │
│ └─ Renders Tabs                             │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
  ┌─────v──────┐         ┌─────v──────┐
  │ Incoming   │         │ Sent       │
  │ TabsContent│         │ TabsContent│
  └─────┬──────┘         └─────┬──────┘
        │                       │
  ┌─────v──────────────────────v─────┐
  │ RequestsList                      │
  │ ├─ LoadingState                   │
  │ ├─ ErrorState                     │
  │ ├─ EmptyState                     │
  │ └─ RequestItem (multiple)         │
  │    ├─ Compact Mode                │
  │    └─ Full Mode (RequestCard)     │
  └───────────────────────────────────┘
```

## Configuration & Customization

### Request Types
Defined in `requestTypeConstants.js`
- Add new types: Update REQUEST_TYPES
- Change messages: Update REQUEST_MESSAGES
- Update config: Update REQUEST_TYPE_CONFIG

### Responsive Breakpoint
Defined in `FriendRequests.jsx`
- Current: 768px
- Change: Update `window.innerWidth < 768` condition

### Styling
All components use Tailwind CSS
- Adjust: Modify className values in each component
- Dark mode: Already configured with dark: prefix classes

### Animations
Framer Motion in `EmptyState.jsx` and `RequestsList.jsx`
- Adjust: Update animate, initial, transition props

## Performance Notes

- Components re-render independently
- List items have staggered animations (0.05s delay)
- ScrollArea is virtualized (via Radix UI)
- Empty states prevent unnecessary DOM nodes
- Responsive layout avoids media queries

## Next Documentation Steps

1. Add unit tests documentation
2. Add integration test examples
3. Add e2e test scenarios
4. Add visual regression test guide
5. Add accessibility guidelines
6. Add performance benchmarks

---

**Module Complete:** ✅  
**Documentation:** ✅  
**Ready for Use:** ✅  
**Backward Compatible:** ✅
