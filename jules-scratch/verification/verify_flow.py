import re
from playwright.sync_api import Page, expect

def test_full_user_flow(page: Page):
    """
    This test verifies the entire user flow:
    1. A new student registers.
    2. An admin logs in and approves the student.
    3. The student logs in and sees their approved dashboard.
    """
    # Use a unique email for each test run to avoid conflicts
    import time
    unique_id = int(time.time())
    student_email = f"student_{unique_id}@example.com"
    student_password = "password123"
    admin_email = "admin@example.com"
    admin_password = "password123"

    # --- Step 1: Register a new student ---
    page.goto("http://localhost:5173/signup")

    page.get_by_label("Full Name").fill("Test Student")
    page.get_by_label("Email Address").fill(student_email)
    page.get_by_label("Password").fill(student_password)
    page.get_by_role("button", name="Sign Up").click()

    # Expect to see the success message
    expect(page.get_by_text("Registration Successful!")).to_be_visible()

    # --- Step 2: Admin logs in and approves the student ---
    page.goto("http://localhost:5173/signin")

    page.get_by_label("Email Address").fill(admin_email)
    page.get_by_label("Password").fill(admin_password)
    page.get_by_role("button", name="Sign In").click()

    # Expect to be on the admin dashboard
    expect(page.get_by_text("Student Approval")).to_be_visible()

    # Find the new student in the table and approve them
    student_row = page.get_by_role("row", name=re.compile(f"Test Student {student_email}"))
    student_row.get_by_role("button", name="Approve").click()

    # The student should disappear from the pending list
    expect(student_row).not_to_be_visible()

    # --- Step 3: Admin signs out ---
    page.get_by_role("button", name="Sign Out").click()
    expect(page.get_by_text("Welcome Back")).to_be_visible()

    # --- Step 4: Student logs in ---
    page.get_by_label("Email Address").fill(student_email)
    page.get_by_label("Password").fill(student_password)
    page.get_by_role("button", name="Sign In").click()

    # --- Step 5: Verify student dashboard ---
    expect(page.get_by_text("Application Approved!")).to_be_visible()

    # --- Step 6: Take a screenshot ---
    page.screenshot(path="jules-scratch/verification/verification.png")