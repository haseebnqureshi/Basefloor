# Interactive Components Verification Guide

## Overview

This guide helps verify that all Phase 2 interactive components are working correctly in the VitePress documentation.

## Access Instructions

### 1. Start the Development Servers

From the project root:

```bash
npm run dev
```

This starts both:
- **API Server**: `http://localhost:3000` (for testing API Explorer)
- **Documentation**: `http://localhost:5174` (VitePress dev server)

### 2. Navigate to Interactive Components

1. Open your browser to: `http://localhost:5174`
2. Click on **"Guide"** in the top navigation
3. In the sidebar, click on **"Interactive Components"**

**Direct URL**: `http://localhost:5174/guide/interactive-components`

## Component Verification Checklist

### ✅ Configuration Builder Component

**Location**: Top of the Interactive Components page

**Tests to Perform**:
- [ ] **Basic Settings Tab**: 
  - Change port number
  - Update database URI
  - Modify JWT secret
  - Add CORS origins (comma-separated)
- [ ] **Models Tab**:
  - Click "Add Model" to create a new model
  - Add fields with different types (String, Number, Boolean, etc.)
  - Toggle "Required" checkbox on fields
  - Remove fields and models
- [ ] **Routes Tab**:
  - Click "Add Route" to create a new route
  - Select a model from dropdown
  - Check/uncheck CRUD operations (Create, Read All, Read, Update, Delete)
  - Remove routes
- [ ] **Preview Tab**:
  - View generated JSON configuration
  - Click "Copy" to copy configuration to clipboard
  - Click "Export Config" to download as file
- [ ] **Reset Functionality**:
  - Click "Reset" to clear all configuration

**Expected Behavior**: Real-time updates in Preview tab as you make changes

### ✅ API Explorer Component

**Location**: Middle section of the Interactive Components page

**Component 1 - Create User (POST /users)**:
- [ ] **Base URL**: Should default to `http://localhost:3000`
- [ ] **Request Body**: Pre-filled with sample user data
- [ ] **Send Request**: Click to make actual API call
- [ ] **Response**: Should show response data, status code, and timing
- [ ] **Headers**: Add custom headers and verify they're sent

**Component 2 - Get User (GET /users/:id)**:
- [ ] **Path Parameters**: Enter a user ID in the `:id` field
- [ ] **Authentication**: Toggle auth type and enter token
- [ ] **Query Parameters**: Add query parameters
- [ ] **Send Request**: Test with authentication

**Expected Behavior**: 
- Real API calls to running Basefloor server
- Response visualization with proper status codes
- Error handling for failed requests

### ✅ Code Examples

**Location**: Bottom section of the Interactive Components page

**Tests to Perform**:
- [ ] **Language Tabs**: Switch between JavaScript, cURL, Python, Node.js
- [ ] **Copy Functionality**: Click copy button on each example
- [ ] **Syntax Highlighting**: Verify code is properly highlighted
- [ ] **Responsive Design**: Test on mobile/tablet sizes

**Expected Behavior**: 
- Clean syntax highlighting for each language
- Copy button changes to "Copied!" temporarily
- Examples are properly formatted and readable

## Navigation Verification

### ✅ VitePress Integration

**Tests to Perform**:
- [ ] **Top Navigation**: Verify "Guide" link works
- [ ] **Sidebar Navigation**: Verify "Interactive Components" appears in Guide section
- [ ] **Search**: Use search to find "interactive" or "components"
- [ ] **Mobile Navigation**: Test hamburger menu on mobile
- [ ] **Theme**: Verify custom Basefloor styling is applied

### ✅ Cross-Page Navigation

**Tests to Perform**:
- [ ] Navigate to other guide pages and back
- [ ] Check API documentation links work
- [ ] Verify footer and header are consistent
- [ ] Test browser back/forward buttons

## Troubleshooting

### Common Issues

1. **Components Not Loading**:
   - Check browser console for JavaScript errors
   - Verify Vue components are registered in theme
   - Ensure all dependencies are installed

2. **API Explorer Not Working**:
   - Verify API server is running on `http://localhost:3000`
   - Check CORS configuration
   - Look for network errors in browser dev tools

3. **Styling Issues**:
   - Verify custom CSS is loading
   - Check for CSS conflicts
   - Test in different browsers

4. **Build Errors**:
   - Run `npm run build` to check for build issues
   - Verify all imports are correct
   - Check for template literal parsing errors

### Debug Commands

```bash
# Check if servers are running
lsof -i :3000  # API server
lsof -i :5174  # VitePress dev server

# Build documentation to check for errors
npm run build

# Check VitePress logs
npm run dev  # Look for errors in output
```

## Success Criteria

All components should be:
- ✅ **Functional**: All interactive features work as expected
- ✅ **Responsive**: Work on desktop, tablet, and mobile
- ✅ **Accessible**: Keyboard navigation and screen reader friendly
- ✅ **Performant**: Fast loading and smooth interactions
- ✅ **Integrated**: Seamlessly part of the VitePress documentation

## Next Steps

Once verification is complete:
1. Document any issues found
2. Test with different browsers (Chrome, Firefox, Safari)
3. Share with team for user acceptance testing
4. Prepare for Phase 3 implementation

---

**Last Updated**: January 2024  
**Verification Status**: ✅ Ready for Testing 