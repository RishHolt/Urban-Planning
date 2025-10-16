# Zoning Clearance Application Modal Implementation

## Overview
Replace the "Barangay Certificate and ID Issuance" service with "Zoning Clearance Application" that opens a modal displaying detailed requirements based on the provided reference image. The modal will be placed in the services folder for better organization.

## Current State
- Service card at index 0 in the services array (line 147-154)
- Uses BCID.png icon with green color scheme
- No modal functionality currently exists for services
- Services folder structure: `resources/js/pages/Users/Services/`

## Reference Image Analysis
From the provided reference image, the modal should display:
1. **Header**: "BASIC REQUIREMENTS:" title
2. **Two-column layout**:
   - Left: "BUSINESS" requirements
   - Right: "BUILDING" requirements
3. **Requirements lists** with checkboxes for both columns
4. **Footer section** with:
   - Contact number field
   - "Received and checked by" field with date
   - Additional requirements field
   - Preliminary evaluation notice
5. **Reminders section** with 4 numbered points

## Implementation Plan

### 1. Create ZoningClearanceModal Component
**File**: `resources/js/pages/Users/Services/ZoningClearanceModal.tsx`

**Structure**:
```typescript
interface ZoningClearanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}
```

**Modal Content Sections**:
- **Header**: "BASIC REQUIREMENTS:" with styled title
- **Two-column grid**:
  - Business Requirements (left column)
  - Building Requirements (right column)
- **Requirements Footer**:
  - Contact number input
  - Received/checked by fields
  - Additional requirements text area
  - Preliminary evaluation notice
- **Reminders Box**: Bordered section with 4 reminders
- **Action Buttons**: Apply Now / Close

**Business Column Requirements**:
- [ ] Lot plan with vicinity map certified by Geodetic Engineer
- [ ] Lease contract/consent from property owner
- [ ] Certified true copy of TCT (land title)
- [ ] Photocopy of Tax Declaration (land/bldg)
- [ ] Photocopy of Real property tax receipts
- [ ] Barangay Clearance/Barangay Resolution
- [ ] Additional Requirements (to be notified after Preliminary evaluation)

**Building Column Requirements**:
- [ ] Lot plan with vicinity map certified by Geodetic Engineer
- [ ] Certified true copy of TCT (land title)
- [ ] Photocopy of Tax Declaration (land/bldg)
- [ ] Photocopy of Real property tax receipts
- [ ] Barangay Construction Permit/Clearance
- [ ] Architectural Plan/Site Development Plan (1 set)
- [ ] Others: _____

**Footer Elements**:
- Contact number input field
- "Received and checked by: ___" with Date field
- "Requirements (to be notified after Preliminary evaluation, after a day of filing)"

**Systemized Reminders**:
1. **Application Form Requirements**: All application forms must be duly accomplished and signed by the registered/rightful owner and be notarized. Fill up all blanks in typewritten form. Only applications with complete requirements will be received and processed by the system.

2. **Document Management**: Keep a duplicate copy of the application form duly received by the CZAO (City Zoning Administration Office). Always present your valid I.D. card during all system transactions and follow-up inquiries.

3. **Authorization Protocol**: Only registered/rightful owner or his/her designated representative with notarized and legally valid authorization will be entertained by the system. All representatives must present proper documentation.

4. **System Integrity**: Follow-up and fixing by Caloocan City Government employees is strictly prohibited. All applications must go through the proper system channels and procedures.

### 2. Update Home.tsx Services Array

**Changes**:
- Replace service at index 0
- Update title: "Zoning Clearance Application"
- Update description: "Apply for zoning clearance for business or building permits"
- Keep green color scheme
- Add click handler to open modal

### 3. Add Modal State Management

**In Home.tsx**:
```typescript
const [isZoningModalOpen, setIsZoningModalOpen] = useState(false);
```

**Click handler for service card**:
```typescript
onClick={() => {
    if (service.id === 1) {
        setIsZoningModalOpen(true);
    }
}}
```

### 4. Styling Requirements

**Modal Design**:
- Max width: 4xl (896px)
- White background with shadow
- Rounded corners
- Scrollable content
- Responsive padding
- Dark overlay backdrop

**Two-column Layout**:
- Grid with 2 equal columns on desktop
- Stack on mobile (single column)
- Visual separation with borders

**Checkbox Style**:
- Square checkboxes
- Green checkmark when checked
- Aligned with text

**Footer Section**:
- Full width
- Light gray background
- Distinct from main content

**Reminders Box**:
- Bordered container
- Numbered list
- Emphasis on important points

### 5. Integration Steps

1. Create `ZoningClearanceModal.tsx` component
2. Import modal in `Home.tsx`
3. Update services array (replace index 0)
4. Add modal state and handlers
5. Add modal to JSX (before closing div)
6. Test responsive behavior
7. Verify all requirements display correctly

### 6. Files to Modify

- **Create**: `resources/js/pages/Users/Services/ZoningClearanceModal.tsx`
- **Update**: `resources/js/pages/Users/Home.tsx`
- **Update**: `resources/js/pages/Users/Services/index.ts` (export ZoningClearanceModal)

### 7. Testing Checklist

- [ ] Modal opens when clicking Zoning Clearance service
- [ ] Modal closes on backdrop click
- [ ] Modal closes on close button click
- [ ] Two-column layout displays correctly
- [ ] All business requirements visible
- [ ] All building requirements visible
- [ ] Footer section displays properly
- [ ] Reminders section is readable
- [ ] Responsive on mobile (stacks vertically)
- [ ] Scroll works for long content
- [ ] Apply Now button is functional
- [ ] Modal overlays other content properly

## Design Specifications

**Color Scheme**:
- Primary: Green (#10b981) - matches existing green service card
- Text: Gray-800 for headers, Gray-700 for content
- Background: White
- Borders: Gray-200

**Typography**:
- Modal title: text-2xl font-bold
- Section headers: text-xl font-semibold
- Requirements: text-sm
- Reminders: text-sm with numbered list

**Spacing**:
- Modal padding: p-6
- Column gap: gap-6
- Section spacing: mb-4
- List item spacing: space-y-2

## Additional Features (Optional)

- Checkbox interaction (toggle on/off)
- Print functionality
- Save draft capability
- Form validation for Apply Now
- Email submission integration
- System integration with backend API
- Document upload functionality
- Application status tracking
- Digital signature integration

