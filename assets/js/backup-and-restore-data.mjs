/**
 * Export all data from Firebase for the current user
 *
 * @param {firebase.firestore.Firestore} db The Firestore database instance
 * @param {string} userId The current user's ID
 * @return {Promise<string>}
 */
export async function exportToJson(db, userId) {
  try {
    const exportObject = {};

    if (!userId) {
      throw new Error("User ID is required for export");
    }

    // Export user categories
    const categoriesSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("categories")
      .get();
    exportObject.categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Export user items for each category
    exportObject.items = {};
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryKey = categoryDoc.data().key;
      const itemsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("categories")
        .doc(categoryDoc.id)
        .collection("items")
        .get();
      exportObject.items[categoryKey] = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Export item history
    const historySnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("item_history")
      .get();
    exportObject.item_history = historySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return JSON.stringify(exportObject, null, 2);
  } catch (error) {
    console.error("Error exporting data from Firebase:", error);
    throw error;
  }
}

/**
 * Import data from JSON into Firebase for the current user.
 * This does not delete any existing data from the database, so documents may be overwritten.
 *
 * @param {firebase.firestore.Firestore} db The Firestore database instance
 * @param {string} userId The current user's ID
 * @param {string} json Data to import
 * @return {Promise<void>}
 */
export async function importFromJson(db, userId, json) {
  try {
    if (!userId) {
      throw new Error("User ID is required for import");
    }

    const importObject = JSON.parse(json);
    const batch = db.batch();

    // Import categories
    if (importObject.categories) {
      for (const category of importObject.categories) {
        const categoryRef = db
          .collection("users")
          .doc(userId)
          .collection("categories")
          .doc(category.id);
        const { id, ...categoryData } = category;
        batch.set(categoryRef, categoryData, { merge: true });
      }
    }

    // Import items for each category
    if (importObject.items) {
      for (const [categoryKey, items] of Object.entries(importObject.items)) {
        // Find the category document for this key
        const categorySnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("categories")
          .where("key", "==", categoryKey)
          .get();

        if (!categorySnapshot.empty) {
          const categoryDoc = categorySnapshot.docs[0];

          for (const item of items) {
            const itemRef = db
              .collection("users")
              .doc(userId)
              .collection("categories")
              .doc(categoryDoc.id)
              .collection("items")
              .doc(item.id);
            const { id, ...itemData } = item;
            batch.set(itemRef, itemData, { merge: true });
          }
        }
      }
    }

    // Import item history
    if (importObject.item_history) {
      for (const historyItem of importObject.item_history) {
        const historyRef = db
          .collection("users")
          .doc(userId)
          .collection("item_history")
          .doc(historyItem.id);
        const { id, ...historyData } = historyItem;
        batch.set(historyRef, historyData, { merge: true });
      }
    }

    // Commit all changes
    await batch.commit();
    console.log("Data imported successfully to Firebase");
  } catch (error) {
    console.error("Error importing data to Firebase:", error);
    throw error;
  }
}

/**
 * Clear all data for the current user from Firebase
 *
 * @param {firebase.firestore.Firestore} db The Firestore database instance
 * @param {string} userId The current user's ID
 * @return {Promise<void>}
 */
export async function clearDatabase(db, userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required for clearing database");
    }

    const batch = db.batch();

    // Clear all categories and their items
    const categoriesSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("categories")
      .get();

    for (const categoryDoc of categoriesSnapshot.docs) {
      // Delete all items in this category
      const itemsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("categories")
        .doc(categoryDoc.id)
        .collection("items")
        .get();

      itemsSnapshot.docs.forEach((itemDoc) => {
        batch.delete(itemDoc.ref);
      });

      // Delete the category itself
      batch.delete(categoryDoc.ref);
    }

    // Clear item history
    const historySnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("item_history")
      .get();
    historySnapshot.docs.forEach((historyDoc) => {
      batch.delete(historyDoc.ref);
    });

    // Commit all deletions
    await batch.commit();
    console.log("All user data cleared from Firebase");
  } catch (error) {
    console.error("Error clearing data from Firebase:", error);
    throw error;
  }
}
