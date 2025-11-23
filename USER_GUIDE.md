# User Guide

Welcome to Expiring Products! This guide explains how to use the app effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Account Management](#account-management)
- [Adding Items](#adding-items)
- [Managing Categories](#managing-categories)
- [Managing Items](#managing-items)
- [Shopping Mode](#shopping-mode)
- [Searching and Filtering](#searching-and-filtering)
- [Visual Warnings](#visual-warnings)
- [Backup and Restore](#backup-and-restore)
- [Tips and Best Practices](#tips-and-best-practices)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Creating an Account

1. Open [expiring-products.netlify.app](https://expiring-products.netlify.app/) in your web browser
2. Enter your **email address** and create a **secure password**
3. Click the **Sign Up** button
4. You're ready to start adding items!

### Logging In

If you already have an account:

1. Enter your email and password
2. Click **Login**
3. Your data will automatically sync from the cloud

### First Time Setup

After creating your account:

1. You'll see default tabs: **Foods** and **Medicines**
2. You can create custom categories in the **Settings** tab
3. Both lists will initially be empty with the message "No items here."
4. Click the floating "+" button in the bottom-right corner to add your first item

### What You'll See

The interface has dynamic tabs based on your categories plus a Settings tab:

- **Custom Category Tabs**: Your personalized categories (e.g., Foods, Medicines, Freezer, etc.)
- **Settings**: Manage categories, export/import data, change language, and logout

## Account Management

### Changing Your Password

If you need to change your password:

1. Logout from your account
2. On the login screen, click **Forgot Password?**
3. Enter your email address
4. Check your email for a password reset link
5. Follow the link and create a new password

### Logging Out

To logout:

1. Go to the **Settings** tab
2. Click the **Logout** button
3. You'll be returned to the login screen

### Multi-Device Sync

Your data automatically syncs across all devices:

- Login with the same account on multiple devices
- Changes made on one device appear instantly on others
- Real-time updates happen automatically when you're online
- No manual sync required!

## Adding Items

### Basic Steps

1. Click the **"+" button** (floating action button in bottom-right)
2. Select the appropriate tab/category before clicking "+"
3. Fill in the item details:
   - **Name**: Product name (e.g., "Milk", "Aspirin")
   - **Category**: Select which category to add the item to (if dropdown is shown)
   - **Quantity**: How many units you have
   - **Expire in**: When the product expires
   - **Duration in days (after opened)**: Optional - how many days the product lasts after opening
   - **Recurring purchase**: Check if you buy this item regularly (for shopping mode)

4. Click the **checkmark** button to save

### Understanding Fields

**Name Field with Auto-Complete**:

- As you type, you'll see suggestions from previously added items
- Select a suggestion to auto-fill the "Duration" field
- This saves time when re-adding items you buy regularly

**Quantity**:

- Enter the number of units (bottles, packages, pills, etc.)
- Use whole numbers only
- Cannot be negative

**Expire In (Expiration Date)**:

- Click the date field to open a calendar picker
- Select the date printed on the product packaging
- Cannot select dates in the past

**Duration in Days (Optional)**:

- How long the product lasts **after opening**
- Examples:
  - Milk: 7 days after opening
  - Eye drops: 28 days after opening
  - Bottled water: Leave empty if doesn't expire after opening
- If left empty, expiration date won't change when item is opened

### Examples

#### Example 1: Fresh Milk

- Name: "Whole Milk"
- Quantity: 2
- Expire in: January 15, 2026
- Duration: 7 (lasts 7 days after opening)

#### Example 2: Medicine

- Name: "Ibuprofen 200mg"
- Quantity: 1
- Expire in: December 2027
- Duration: Leave empty (pills don't expire quickly after opening)

#### Example 3: Canned Food

- Name: "Canned Tomatoes"
- Quantity: 5
- Expire in: March 2026
- Duration: 3 (use within 3 days after opening)

## Managing Categories

### Creating Custom Categories

You can organize items however you like by creating custom categories:

1. Go to the **Settings** tab
2. Scroll to the **Manage Categories** section
3. Enter a category name (e.g., "Freezer", "Pantry", "Refrigerator")
4. Click the emoji button to select an icon
5. Click **Add Category**

The new category tab will appear immediately!

### Editing Categories

To rename a category or change its emoji:

1. Go to **Settings** > **Manage Categories**
2. Click the **Edit** button (pencil icon) next to the category
3. Enter the new name in the prompt
4. Choose a new emoji from the list
5. Click OK to save

### Deleting Categories

**Warning**: Deleting a category also deletes all items in that category!

1. Go to **Settings** > **Manage Categories**
2. Click the **Delete** button (trash icon) next to the category
3. Confirm the deletion

## Managing Items

### Viewing Your Items

Items are automatically sorted by:

1. **Expiration date** (soonest first)
2. **Opened status** (opened items shown first within same expiration date)
3. **Quantity** (larger quantities first)

Each item displays:

- **Product name** (bold)
- **Relative time** until expiration (e.g., "in 5 days", "2 days ago")
- **Quantity** (blue badge on the right)

### Editing Items

1. Click on any item in the list
2. An edit dialog appears with three options:
   - **Opened items**: Mark some units as opened
   - **Consumed items**: Mark some units as consumed/used
   - **Discarded items**: Mark some units as thrown away

3. Enter quantities and click the checkmark

### Opening Items

When you open a product (like opening a milk carton):

1. Click the item
2. Enter quantity in "Opened items"
3. Click checkmark

**What happens**:

- If you set a "Duration" when adding the item:
  - Expiration date is recalculated from today + duration days
  - Example: You open milk today with 7-day duration → new expiration is 7 days from now
- If quantity > 1:
  - Original item quantity decreases
  - New item created with "opened" status and new expiration date
- Item is marked with "opened" status

**Special case**: If you open an item that's already expired, the expiration date doesn't change.

### Consuming Items

When you finish using a product:

1. Click the item
2. Enter quantity in "Consumed items"
3. Click checkmark

**What happens**:

- Quantity decreases by the amount consumed
- If consuming all units, item is removed from the list
- Statistics are tracked in the background

### Discarding Items

When you throw away expired or spoiled products:

1. Click the item
2. Enter quantity in "Discarded items"
3. Click checkmark

**What happens**:

- Quantity decreases by the amount discarded
- If discarding all units, item is removed from the list
- Statistics track waste (for future analytics feature)

### Combining Actions

You can perform multiple actions at once:

- Example: Open 1, consume 2, discard 1 from a quantity of 5
- Total must not exceed current quantity
- At least one field must have a value > 0

## Shopping Mode

Shopping mode helps you manage recurring purchases and quickly restock your pantry.

### Enabling Shopping Mode

1. Go to any category tab
2. Find the **Shopping Mode** toggle switch (usually near the top or in Settings)
3. Turn it **ON**

### How Shopping Mode Works

When enabled, the app shows:

- Items you marked as "recurring purchases"
- Items from your purchase history
- Items currently in your pantry (if marked as recurring)

**In Shopping Mode, you can:**

- **View your shopping list**: See all recurring items you typically buy
- **Skip items temporarily**: Click the eye icon to hide items you don't need right now
- **Add to pantry quickly**: Click the cart icon to open the Add Item form with the name pre-filled

### Adding Items to Pantry from Shopping List

1. Enable Shopping Mode
2. Find the item you want to purchase
3. Click the **cart icon** (🛒)
4. The Add Item form opens with the name already filled in
5. Enter quantity and expiration date
6. Click checkmark to save

The item automatically hides from your shopping list after you add it to your pantry!

### Managing Hidden Shopping Items

Items you skip remain hidden until you:

- Turn off Shopping Mode and turn it back on (clears hidden items)
- Or they automatically reappear after some time

## Searching and Filtering

### Searching for Items

Each category has a search box at the top:

1. Click in the search field
2. Type the product name
3. Results filter in real-time using fuzzy matching (finds items even with typos!)

### Sorting Items

Click the **Sort** dropdown to choose how to sort items:

- **By Date**: Expiration date (soonest first or last)
- **By Name**: Alphabetically (A-Z or Z-A)
- **By Quantity**: Number of items (lowest or highest first)

Each category remembers your sorting preference!

### Filtering Items

Use the filter buttons to show only:

- **All Items**: Show everything
- **Opened**: Only items that have been opened
- **Unopened**: Only items that haven't been opened

### Hiding Distant Expiration Dates

To reduce clutter, you can hide items that don't expire soon:

1. Go to **Settings** tab
2. Find **Hide items expiring beyond** setting
3. Toggle it ON
4. Set the threshold (e.g., 3 months)

Items expiring beyond this threshold are hidden. Click "Show hidden items" button in each category to temporarily reveal them.

## Visual Warnings

Items change color based on expiration status:

- **Red** 🔴: Already expired
- **Yellow** 🟡: Expires within 3 days
- **White** ⚪: More than 3 days until expiration

The app automatically checks expiration dates when you open it, once daily, and after any changes.

## Backup and Restore

### Exporting Data

1. Go to **Settings** tab
2. Click **"Export data"**
3. Save the `expiring_products.json` file somewhere safe (cloud storage, external drive)

Exported data includes all items, categories, and item history. This is useful for:

- **Backup**: Protect against accidental data loss
- **Account Transfer**: Move data to a different account
- **Data Portability**: Keep a local copy of your data

### Importing Data

1. Go to **Settings** tab
2. Click **"Import data"**
3. Select your `.json` file

⚠️ **Warning**: Importing replaces all current data. Export first if you want to keep your current items.

**Best Practices**:

- Export regularly (weekly/monthly) for backup
- Export before making major changes
- Keep backup versions with dates in filename
- Store backups in multiple locations (cloud storage, external drive)

## Tips and Best Practices

- **Use custom categories** to match your storage locations (Fridge, Freezer, Pantry, etc.)
- **Mark recurring items** when adding products you buy regularly for easier shopping
- **Use consistent names** for products to benefit from auto-complete
- **Set realistic durations** for how long items last after opening
- **Update quantities immediately** when consuming items
- **Enable shopping mode** before going to the store
- **Check daily** to see what's expiring soon and plan meals
- **Use oldest items first** - items are sorted by expiration automatically
- **Sync across devices** by using the same account on your phone and computer
- **Export regularly** to keep a backup of your data

## FAQ

**Q: Do I need to create an account?**
A: Yes. You need to sign up with an email and password to use the app. This allows your data to sync across devices.

**Q: Is my data stored on a server?**
A: Yes, your data is securely stored in Firebase Firestore (Google's cloud database). Only you can access your data.

**Q: Can I use this on multiple devices?**
A: Yes! Login with the same account on all your devices and your data syncs automatically in real-time.

**Q: Does it work offline?**
A: The app interface works offline after the first visit, but you need an internet connection to sync data with the cloud.

**Q: Is my data private?**
A: Absolutely. Your data is protected by Firebase security rules and only accessible with your login credentials. No one else can see your data.

**Q: What happens if I forget my password?**
A: Click "Forgot Password?" on the login screen and follow the email instructions to reset it.

**Q: Can I delete my account?**
A: Currently, you can export your data and stop using the app. Contact support for complete account deletion.

**Q: Which browsers are supported?**
A: Modern versions of Chrome, Firefox, Safari, and Edge.

**Q: What happens if I clear browser data?**
A: Your local cache is cleared, but your data is safe in the cloud. Just login again to restore everything.

**Q: What if I make a mistake?**
A: Edit items to fix quantities, or import a previous backup if you exported one.

**Q: Can I edit the expiration date after adding an item?**
A: Delete the item and re-add it, or export, edit the JSON file, and import.

**Q: How do I delete an item?**
A: Click the item and set "Consumed" or "Discarded" equal to the full quantity.

**Q: Do I have to set the "duration" field?**
A: No, it's optional. Only use it for items that expire quickly after opening.

**Q: Can I share my pantry with family members?**
A: Currently, each account is separate. Sharing features may be added in the future.

**Q: How do I create a new category?**
A: Go to Settings > Manage Categories, enter a name, choose an emoji, and click Add Category.

## Troubleshooting

**Cannot login / Authentication errors:**

- Verify you're using the correct email and password
- Check your internet connection
- Try resetting your password using "Forgot Password?"
- Clear browser cache and try again

**Data not syncing across devices:**

- Ensure you're logged in with the same account on both devices
- Check internet connection on both devices
- Refresh the page or close and reopen the app
- Check Firebase status at [status.firebase.google.com](https://status.firebase.google.com)

**Items don't appear after adding:**

- Check internet connection
- Refresh the page
- Verify you're viewing the correct category tab
- Check browser console for errors (F12)

**Export doesn't work:**

- Ensure you have items to export
- Check browser download permissions
- Try a different browser
- Disable download-blocking extensions

**Import fails:**

- Ensure you're importing a valid JSON file from this app
- Check file isn't corrupted
- Verify you're logged in
- Check file size isn't too large

**App doesn't work offline:**

- The interface caches after first visit, but data sync requires internet
- Ensure service worker is installed (check browser DevTools)
- Not available in private/incognito mode

**Real-time sync not working:**

- Verify internet connection
- Check if other tabs/devices are actually online
- Refresh the page
- Logout and login again

**Shopping mode shows no items:**

- Ensure you've marked items as "recurring purchase" when adding them
- Check you have items in your purchase history
- Verify shopping mode is actually enabled

**Colors don't show for expired items:**

- Refresh the page
- Check browser console for errors (F12)
- Wait a moment for the automatic expiry check to run

**Need more help?**
Open an issue on [GitHub](https://github.com/george-gca/expiring_products/issues) with:

- Browser name and version
- Operating system
- Steps to reproduce the problem
- Console errors (F12 → Console)
