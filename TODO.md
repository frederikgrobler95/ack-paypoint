# Admin Routes & Pages Implementation Plan

This document outlines the tasks required to implement the admin section of the application.

## Dashboard Tab
- [ ] **DashboardPage**: Create page with live KPIs (Total Sales, Total Checkouts, Customers Registered, Top Performing Stall) and pull-to-refresh functionality.

## Users Tab
- [x] **UsersPage**: Existing page with user list, search bar, and "Add Users" button.
- [ ] **RoleSelectionPage**: Create sub-page modal to change a user's role (Admin/Member).
- [ ] **AddUsersScreen**: Create page with a form for creating a single user and an option for bulk CSV upload.

## Stalls Tab
- [x] **StallsPage**: Existing page with stall list, search bar, and "Add New Stall" button.
- [ ] **AddStallScreen**: Create a page/modal to add a new stall.
- [x] **StallDetailScreen**: Existing page showing stall details, assigned operators, and recent transactions.
- [ ] **StallOperatorsPage**: Create sub-page to assign/unassign operators from a stall.
- [ ] **StallStatsPage**: Create sub-page to display stall statistics and export a PDF report.

## Customers Tab
- [x] **CustomersPage**: Existing page with customer list, search bar, and "Create" button.
- [x] **CustomerDetailsScreen**: Existing page showing customer profile, balance, and transaction history.
- [ ] **CreateCustomersScreen**: Create page with a form for creating a single customer and an option for bulk CSV upload.
- [ ] **ReissueQrCodeScreen**: Create page with a camera view for scanning a new QR code.
- [ ] **ReissueQrCodePage**: Create sub-page to confirm the QR code reissue.

## QR Codes Tab
- [x] **QRCodesPage**: Existing page with QR code list, status, search bar, and "Batches" button.
- [x] **BatchesScreen**: Existing list of all QR code batches.
- [ ] **CreateBatchPage**: Create sub-page to generate a new batch of QR codes with a specified name and quantity.
- [x] **BatchDetailsScreen**: Existing page showing QR codes in a batch with a "Print Batch PDF" function.
- [ ] **GenerateScreen**: Create a utility screen for generating new QR codes from a CSV file.