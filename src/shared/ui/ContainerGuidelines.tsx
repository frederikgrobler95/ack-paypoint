// Container Components Guidelines
//
// This file documents the container components available in the application and their usage guidelines.
//
// ## Available Container Components
//
// ### 1. FlowContainer
// Purpose: General purpose container for flow pages (sales, registration, checkout, refunds)
// Props:
// - children: React.ReactNode (required)
// - className?: string (optional additional classes)
// - noPadding?: boolean (removes all padding)
// - withHeaderOffset?: boolean (adds pt-20 for header)
// - withBottomOffset?: boolean (adds pb-20 for bottom elements)
// - withNoHeaderOffset?: boolean (removes pt-4 default padding)
// - withNoBottomOffset?: boolean (removes pb-8 default padding)
//
// Usage Example:
// <FlowContainer withHeaderOffset withBottomOffset>
//   <div>Content here</div>
// </FlowContainer>
//
// ### 2. MobileAppContainer
// Purpose: Main app container with header and bottom navigation
// Props:
// - children: React.ReactNode (required)
// - disablePadding?: boolean (disables default padding)
// - disableHeader?: boolean (hides header)
// - disableBottomNavigation?: boolean (hides bottom navigation)
//
// Usage Example:
// <MobileAppContainer>
//   <div>App content</div>
// </MobileAppContainer>
//
// ### 3. DashboardContainer
// Purpose: Container for dashboard pages
// Props:
// - children: React.ReactNode (required)
// - className?: string (optional additional classes)
// - noPadding?: boolean (removes px-4 padding)
//
// Usage Example:
// <DashboardContainer>
//   <div>Dashboard content</div>
// </DashboardContainer>
//
// ### 4. ListContainer
// Purpose: Container for list pages
// Props:
// - children: React.ReactNode (required)
// - className?: string (optional additional classes)
// - noPadding?: boolean (removes px-0 padding)
// - withHeaderOffset?: boolean (adds pt-20 for header)
// - withBottomOffset?: boolean (adds pb-24 for bottom elements)
//
// Usage Example:
// <ListContainer withHeaderOffset>
//   <div>List content</div>
// </ListContainer>
//
// ### 5. FormContainer
// Purpose: Container for form pages
// Props:
// - children: React.ReactNode (required)
// - className?: string (optional additional classes)
// - noPadding?: boolean (removes px-4 padding)
// - withHeaderOffset?: boolean (adds pt-20 for header)
// - withBottomOffset?: boolean (adds pb-24 for action buttons)
//
// Usage Example:
// <FormContainer withBottomOffset>
//   <form>Form content</form>
// </FormContainer>
//
// ## Usage Guidelines
//
// 1. Choose the appropriate container based on the page type:
//    - Flow pages (sales, registration, checkout, refunds): Use FlowContainer
//    - Dashboard pages: Use DashboardContainer
//    - List pages: Use ListContainer
//    - Form pages: Use FormContainer
//    - Full app layout: Use MobileAppContainer
//
// 2. Consistency is key:
//    - Use the same container for similar page types across the application
//    - Follow the spacing standards defined in each container
//
// 3. Props usage:
//    - Use offset props when you have fixed elements (header, bottom navigation)
//    - Use noPadding props when you need full-width content
//
// 4. Customization:
//    - Use className prop to add additional styling when needed
//    - Combine containers with other UI components for complex layouts