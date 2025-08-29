// Container Components Documentation
//
// This file documents the container components available in the application.
//
// 1. FlowContainer
//    - Purpose: General purpose container for flow pages
//    - Props:
//      - children: React.ReactNode (required)
//      - className?: string (optional additional classes)
//      - noPadding?: boolean (removes all padding)
//      - withHeaderOffset?: boolean (adds pt-20 for header)
//      - withBottomOffset?: boolean (adds pb-20 for bottom elements)
//      - withNoHeaderOffset?: boolean (removes pt-4 default padding)
//      - withNoBottomOffset?: boolean (removes pb-8 default padding)
//
// 2. MobileAppContainer
//    - Purpose: Main app container with header and bottom navigation
//    - Props:
//      - children: React.ReactNode (required)
//      - disablePadding?: boolean (disables default padding)
//      - disableHeader?: boolean (hides header)
//      - disableBottomNavigation?: boolean (hides bottom navigation)
//
// 3. DashboardContainer
//    - Purpose: Container for dashboard pages
//    - Props:
//      - children: React.ReactNode (required)
//      - className?: string (optional additional classes)
//      - noPadding?: boolean (removes px-4 padding)
//
// 4. ListContainer
//    - Purpose: Container for list pages
//    - Props:
//      - children: React.ReactNode (required)
//      - className?: string (optional additional classes)
//      - noPadding?: boolean (removes px-0 padding)
//      - withHeaderOffset?: boolean (adds pt-20 for header)
//      - withBottomOffset?: boolean (adds pb-24 for bottom elements)
//
// 5. FormContainer
//    - Purpose: Container for form pages
//    - Props:
//      - children: React.ReactNode (required)
//      - className?: string (optional additional classes)
//      - noPadding?: boolean (removes px-4 padding)
//      - withHeaderOffset?: boolean (adds pt-20 for header)
//      - withBottomOffset?: boolean (adds pb-24 for action buttons)
//
// Usage Examples:
//
// Import containers:
// import { FlowContainer, DashboardContainer } from '@/shared/ui';
//
// Use FlowContainer:
// <FlowContainer withHeaderOffset withBottomOffset>
//   <div>Content here</div>
// </FlowContainer>
//
// Use DashboardContainer:
// <DashboardContainer>
//   <div>Dashboard content</div>
// </DashboardContainer>