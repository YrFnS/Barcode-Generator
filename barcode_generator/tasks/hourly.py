import frappe

def barcode_index():
    # Check if the 'barcode' index exists in the 'tabItem Barcode' table
    index_exists = frappe.db.sql("""
        SELECT COUNT(1)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tabItem Barcode'
        AND INDEX_NAME = 'barcode'
    """)[0][0]

    # If the index doesn't exist, create it
    if not index_exists:
        # Add the 'barcode' index to the 'tabItem Barcode' table
        frappe.db.sql("ALTER TABLE `tabItem Barcode` ADD INDEX `barcode` (barcode)")
        # Commit the changes to the database
        frappe.db.commit()
