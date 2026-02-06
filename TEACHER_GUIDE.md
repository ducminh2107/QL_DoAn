# Teacher Topic Management - User Guide

## Quick Start

### Creating a New Topic

#### Method 1: Using Quick Create Dialog (Fast)

1. Click **"+ Tạo đề tài mới"** button on Topics list page
2. Fill in the dialog form:
   - **Tiêu đề đề tài** (required): Topic title
   - **Mô tả đề tài** (required): Detailed description (min 50 characters)
   - **Danh mục** (required): Select category from dropdown
   - **Chuyên ngành** (optional): Select major from dropdown
   - **Kỳ đăng ký** (required): Auto-selected to active semester
   - **Số lượng sinh viên tối đa**: 1-5 students (default: 1)
   - **Yêu cầu đối với sinh viên**: Special requirements/skills needed
3. Click **"Tạo đề tài"** button
4. Success message appears → Returns to topics list

#### Method 2: Using Dedicated Create Page (Full Control)

1. Click **"Tạo đề tài"** link in teacher sidebar or use `/teacher/topics/create` URL
2. Fill in comprehensive form with all fields
3. Click **"Tạo đề tài"** button
4. Redirected to newly created topic's detail page
5. Review and edit if needed

---

### Viewing Topic Details

1. From Topics List:

   - Click **eye icon** next to topic name, OR
   - Click anywhere on the topic row

2. Detail page shows:
   - Complete topic information
   - Category and major assignments
   - Registered students with approval status
   - Topic status (pending/approved/rejected/completed)
   - Creation and modification dates

---

### Editing a Topic

1. From Detail Page:

   - Click **blue edit icon** (pencil) button
   - OR click **"Chỉnh sửa"** button

2. From Topics List:

   - Click **pencil icon** in the Actions column

3. Edit Form allows updating:

   - Title, description, category, major
   - Maximum students allowed
   - Teacher notes and requirements

4. Click **"Lưu thay đổi"** to save
5. Confirm success message and review changes

---

### Deleting a Topic

1. From Detail Page:

   - Click **delete icon** (trash can) button

2. From Topics List:

   - Click **trash icon** in the Actions column

3. **Important:** Confirmation dialog appears

   - Cannot delete if students already approved for topic
   - Disabling indicates active registrations exist

4. Click **"Xóa"** to confirm deletion
5. Topic removed from list

---

## Features Overview

### Dashboard Statistics

- Total topics created by you
- Pending approval count
- Active registrations
- Quick action shortcuts

### Topics List View

**Features:**

- ✅ Sortable table with 10, 25, or 50 rows per page
- ✅ Filter by status (all, pending, approved, rejected, completed)
- ✅ Search by topic title/description
- ✅ Status indicators (color-coded chips)
- ✅ Student count display
- ✅ Inline actions (view, edit, delete)

**Status Colors:**

- 🟢 Green (Hoàn thành) = Completed
- 🟢 Green (Đã duyệt) = Approved by department
- 🟡 Yellow (Chờ duyệt) = Awaiting approval
- 🔴 Red (Từ chối) = Rejected by department
- 🔵 Blue (Cần sửa) = Needs revision

### Pending Approvals

1. Navigate to **"Chờ duyệt"** tab in teacher sidebar
2. View list of topics awaiting department approval
3. Track approval status and any feedback

### Student Registrations

1. Navigate to **"Quản lý sinh viên"** → **"Đăng ký"**
2. View all student registrations for your topics
3. Approve or reject applications
4. Remove students if needed

### Guided Students

1. Navigate to **"Quản lý sinh viên"** → **"Hướng dẫn"**
2. See list of approved students assigned to you
3. Access student contact information
4. Track student progress

### Grading

1. Navigate to **"Chấm điểm"** in teacher sidebar
2. Select a topic and rubric criteria
3. Score each student based on rubric
4. Add comments and feedback
5. Submit grades

---

## Form Field Requirements

### Required Fields (marked with \*)

- **Topic Title:** Name of the thesis topic
- **Description:** Detailed overview (min 50 characters)
- **Category:** Academic field/discipline
- **Registration Period:** Semester/academic term

### Optional Fields

- **Major:** Specialization (can be left blank for general topics)
- **Max Members:** Number of students (default: 1, max: 5)
- **Teacher Notes:** Special requirements, skills, resources needed

---

## Data Auto-Fill Features

### Smart Defaults

1. **Active Registration Period:** Automatically selected when creating topics
2. **Category/Major Dropdowns:** Populated from system database
3. **Student Count:** Displays current approvals vs. maximum capacity

### Form Validation

- Empty required fields disable submit button until filled
- Error messages appear for invalid data
- Success toasts confirm completed actions

---

## Common Workflows

### Workflow 1: Create & Submit Topic for Approval

```
1. Click "Tạo đề tài mới"
2. Fill form with all required fields
3. Submit form
4. Topic appears in "Chờ duyệt" (Pending Approval) section
5. Wait for department approval
```

### Workflow 2: Manage Student Registrations

```
1. View topic detail
2. Go to "Quản lý sinh viên" → "Đăng ký"
3. Review student applications
4. Click approve/reject for each student
5. Approved students moved to "Hướng dẫn" section
```

### Workflow 3: Grade Students

```
1. Go to "Chấm điểm"
2. Select a topic
3. Select grading rubric
4. Score each student
5. Add feedback comments
6. Submit grades
7. View history of graded topics
```

---

## Tips & Best Practices

✅ **DO:**

- Write detailed descriptions (helps students understand topic better)
- Set appropriate max students (typically 1-2 for thesis topics)
- Specify technical requirements upfront
- Regularly check pending approvals
- Provide constructive feedback during grading

❌ **DON'T:**

- Create vague topic titles/descriptions
- Allow too many students per topic (hard to manage)
- Forget to complete approvals for student registrations
- Submit grades without comments
- Delete topics with active student registrations

---

## Error Messages & Solutions

| Error Message                           | Cause                            | Solution                               |
| --------------------------------------- | -------------------------------- | -------------------------------------- |
| "Tiêu đề đề tài không được rỗng"        | Title field empty                | Enter a topic title                    |
| "Mô tả phải ít nhất 50 ký tự"           | Description too short            | Write a longer description             |
| "Hãy chọn một danh mục"                 | Category not selected            | Select from category dropdown          |
| "Hãy chọn một kỳ đăng ký"               | Registration period not selected | Select a registration period           |
| "Không thể xóa - có sinh viên đang học" | Topic has approved students      | Remove students first or archive topic |
| "Không thể cập nhật đề tài này"         | Permission denied                | Only creator can edit own topics       |

---

## Browser Cache Troubleshooting

If you see stale/old data:

1. **Hard Refresh:** Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear Cache:** Go to browser settings → Clear browsing data → Cookies and cache
3. **Check Network:** Open DevTools → Network tab → Verify no 304 responses
4. **Report Issue:** If problem persists, check with administrator

---

## Keyboard Shortcuts

| Shortcut                           | Action                |
| ---------------------------------- | --------------------- |
| `/teacher/topics`                  | Topics list page      |
| `/teacher/topics/create`           | Create new topic      |
| `/teacher/topics/:id`              | View topic detail     |
| `/teacher/topics/:id/edit`         | Edit topic            |
| `/teacher/topics/pending-approval` | Pending approvals     |
| `/teacher/students/registrations`  | Student registrations |
| `/teacher/students/guided`         | Guided students       |
| `/teacher/grading`                 | Grading interface     |

---

## Support & Questions

For assistance:

1. Check this guide first
2. Review error messages carefully
3. Refresh page and try again
4. Contact system administrator if issue persists

---

**Last Updated:** Current Session
**System Version:** 1.0.0 (Production Ready)
