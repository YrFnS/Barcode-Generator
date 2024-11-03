import frappe
from frappe import _

@frappe.whitelist()
def search_item_by_barcode(barcode, parent_doc):
    # Create a unique cache key for this barcode
    cache_key = f'item_barcode_{barcode}'
    # Try to get the item from cache
    item = frappe.local.cache.get(cache_key)
    
    if not item:
        # If not in cache, fetch from database
        item = frappe.db.get_value('Item Barcode', {'parenttype': parent_doc, 'barcode': barcode}, 
                                   ['name', 'parent', 'uom'], as_dict=True)
        if item:
            # If found, cache the item
            frappe.local.cache[cache_key] = item
        else:
            # If not found, throw an error
            frappe.throw(_("Item with barcode {0} not found").format(barcode))

    return item

@frappe.whitelist()
def get_initial_item_barcodes(limit=300):
    # Cache key for initial barcodes
    cache_key = 'initial_item_barcodes'
    # Try to get barcodes from cache
    barcodes = frappe.local.cache.get(cache_key)

    if not barcodes:
        # If not in cache, fetch from database with a limit
        barcodes = frappe.db.get_all('Item Barcode', fields=['barcode', 'parent', 'uom'], limit=limit)
        # Cache the fetched barcodes
        frappe.local.cache[cache_key] = barcodes

    return barcodes

@frappe.whitelist()
def get_all_item_barcodes():
    # Cache key for all barcodes
    cache_key = 'all_item_barcodes'
    # Try to get all barcodes from cache
    barcodes = frappe.local.cache.get(cache_key)

    if not barcodes:
        # If not in cache, fetch all barcodes from database
        barcodes = frappe.db.get_all('Item Barcode', fields=['barcode', 'parent', 'uom'])
        # Cache all the fetched barcodes
        frappe.local.cache[cache_key] = barcodes

    return barcodes
