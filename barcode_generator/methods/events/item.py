import frappe

def before_save(doc, method) -> None:
    # Loop through all barcode rows and set custom_hash if it's empty
    for row in doc.barcodes:
        if not row.custom_hash:
            row.custom_hash = row.barcode
