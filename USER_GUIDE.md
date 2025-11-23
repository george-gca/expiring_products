# User Guide

Welcome to Expiring Products! This guide explains how to use the app effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Adding Items](#adding-items)
- [Managing Items](#managing-items)
- [Visual Warnings](#visual-warnings)
- [Backup and Restore](#backup-and-restore)
- [Tips and Best Practices](#tips-and-best-practices)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

## Getting Started

### First Visit

1. Open [expiring-products.netlify.app](https://expiring-products.netlify.app/) in your web browser
2. You'll see two tabs: **Foods** and **Medicines**
3. Both lists will be empty with the message "No items here."
4. Click the floating "+" button in the bottom-right corner to add your first item

### What You'll See

The interface has three main tabs:

- **Foods**: Track food items in your pantry
- **Medicines**: Track medications and supplements
- **Settings**: Export/import data and change language

## Adding Items

### Basic Steps

1. Click the **"+" button** (floating action button in bottom-right)
2. Select the appropriate tab (Foods or Medicines) before clicking "+"
3. Fill in the item details:

   - **Name**: Product name (e.g., "Milk", "Aspirin")
   - **Quantity**: How many units you have
   - **Expire in**: When the product expires
   - **Duration in days (after opened)**: Optional - how many days the product lasts after opening

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

Exported data includes all food items, medicine items, and product history.

### Importing Data

1. Go to **Settings** tab
2. Click **"Import data"**
3. Select your `.json` file

⚠️ **Warning**: Importing replaces all current data. Export first if you want to keep your current items.

**Best Practices**:

- Export regularly (weekly/monthly)
- Export before clearing browser data or uninstalling
- Keep backup versions with dates in filename

## Tips and Best Practices

- **Use consistent names** for products to benefit from auto-complete
- **Set realistic durations** for how long items last after opening (Milk: 5-7 days, Eye drops: 28 days)
- **Update quantities immediately** when consuming items
- **Check daily** to see what's expiring soon and plan meals
- **Use oldest items first** - items are sorted by expiration automatically
- **Track medications** including prescriptions, OTC drugs, vitamins, and first aid supplies

## FAQ

**Q: Do I need to create an account?**
A: No. The app works completely without registration or login.

**Q: Is my data stored on a server?**
A: No. All data is stored locally in your browser using IndexedDB.

**Q: Can I use this on multiple devices?**
A: Yes, but data doesn't sync automatically. Use export/import to transfer data between devices.

**Q: Does it work offline?**
A: Yes! After the first visit, the app works completely offline if installed as a PWA.

**Q: Is my data private?**
A: Absolutely. No data is sent to any server. Everything stays in your browser.

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (recent versions).

**Q: What happens if I clear browser data?**
A: Your data is deleted unless you've exported it first. Always export before clearing browser data.

**Q: What if I make a mistake?**
A: Edit items to fix quantities, re-add deleted items, or import a previous backup.

**Q: Can I edit the expiration date after adding an item?**
A: Delete the item and re-add it, or export, edit the JSON file, and import.

**Q: How do I delete an item?**
A: Click the item and set "Consumed" or "Discarded" equal to the full quantity.

**Q: Do I have to set the "duration" field?**
A: No, it's optional. Only use it for items that expire quickly after opening.

## Troubleshooting

**Items disappear after closing browser:**

- Enable cookies and site data in browser settings
- Don't use private/incognito mode
- Try a different browser

**Export doesn't work:**

- Check browser download permissions
- Try a different browser
- Disable download-blocking extensions

**Import fails:**

- Ensure you're importing a valid JSON file from this app
- Check file isn't corrupted

**App doesn't work offline:**

- Visit the site online first to install service worker
- Not available in private/incognito mode
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Colors don't show for expired items:**

- Refresh the page
- Check browser console for errors (F12)

**Need more help?**
Open an issue on [GitHub](https://github.com/george-gca/expiring_products/issues) with:

- Browser name and version
- Operating system
- Steps to reproduce the problem
- Console errors (F12 → Console)
