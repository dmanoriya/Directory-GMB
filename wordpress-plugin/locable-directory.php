<?php
/*
Plugin Name: Locable Directory & Bulk CSV Importer
Plugin URI: https://san-diego-home-services.com
Description: Registers Custom Post Types (Listings, Reviews, Leads, Users), REST API Endpoints, User Role Sync, and CSV Bulk Importer.
Version: 4.0.0
Author: Locable Directory Team
Author URI: https://san-diego-home-services.com
License: GPLv2 or later
Text Domain: locable-directory
*/

if (!defined('ABSPATH')) exit;

// ─── 1. PHP UPLOAD LIMIT OVERRIDES ───────────────────────────────────────────
// Increase limits at plugin load time so large CSVs are accepted.
@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size',       '128M');
@ini_set('memory_limit',        '512M');
@ini_set('max_execution_time',  '0');   // Chunked AJAX, but safety net for single-page mode
@ini_set('max_input_time',      '300');

// ─── 2. REGISTER CPTs, TAXONOMIES & META FIELDS ──────────────────────────────
add_action('init', 'locable_directory_register_cpts');

function locable_directory_register_cpts() {

    // Register Custom Role for Directory Business Owners in WP-Admin -> Users
    if (!get_role('directory_user')) {
        add_role('directory_user', 'Directory Business Owner', array(
            'read'         => true,
            'edit_posts'   => false,
            'delete_posts' => false,
        ));
    }

    // ── Business Type Taxonomy (shown as sidebar panel in WP admin) ──
    register_taxonomy('business_type', 'business_listing', array(
        'labels'            => array(
            'name'              => 'Business Types',
            'singular_name'     => 'Business Type',
            'search_items'      => 'Search Types',
            'all_items'         => 'All Business Types',
            'edit_item'         => 'Edit Business Type',
            'add_new_item'      => 'Add New Business Type',
            'menu_name'         => 'Business Types',
        ),
        'hierarchical'      => true,   // like categories
        'public'            => true,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,   // shows as column in listing list
        'rewrite'           => array('slug' => 'business-type'),
    ));

    // ── Location Taxonomy ──
    register_taxonomy('business_location', 'business_listing', array(
        'labels'            => array(
            'name'          => 'Locations',
            'singular_name' => 'Location',
            'add_new_item'  => 'Add New Location',
        ),
        'hierarchical'      => true,
        'public'            => true,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
        'rewrite'           => array('slug' => 'location'),
    ));

    // ── Business Listing CPT ──
    register_post_type('business_listing', array(
        'labels' => array(
            'name'          => 'Locable Businesses',
            'singular_name' => 'Business Listing',
            'add_new_item'  => 'Add New Business',
            'edit_item'     => 'Edit Business Listing',
            'search_items'  => 'Search Businesses',
            'not_found'     => 'No businesses found',
        ),
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'businessListing',
        'graphql_plural_name' => 'businessListings',
        'supports'            => array('title', 'editor', 'thumbnail', 'custom-fields', 'revisions'),
        'menu_icon'           => 'dashicons-store',
        'taxonomies'          => array('business_type', 'business_location'),
    ));

    // Register Meta Fields for REST API Visibility
    $meta_keys = array(
        'placeId', 'userEmail', 'title', 'type', 'typeSlug', 'city', 'citySlug',
        'address', 'state', 'zip', 'phone', 'website', 'price', 'workingHours',
        'thumbnail', 'coverImage', 'description', 'serviceOptions', 'services',
        'googleMapsEmbedUrl', 'latitude', 'longitude', 'rating', 'reviews', 'verified',
        'founderName', 'founderRole', 'founderExperience', 'founderQuote', 'founderAvatar', 'licenseStatus'
    );
    foreach ($meta_keys as $key) {
        register_post_meta('business_listing', $key, array(
            'show_in_rest' => true,
            'single'       => true,
            'type'         => 'string',
            'auth_callback' => '__return_true',
        ));
    }

    register_post_type('business_review', array(
        'labels' => array(
            'name'          => 'Locable Reviews',
            'singular_name' => 'Customer Review',
            'add_new_item'  => 'Add New Review'
        ),
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => 'edit.php?post_type=business_listing',
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'businessReview',
        'graphql_plural_name' => 'businessReviews',
        'supports'            => array('title', 'editor', 'custom-fields'),
        'menu_icon'           => 'dashicons-star-filled'
    ));

    register_post_type('lead_submission', array(
        'labels' => array(
            'name'          => 'Leads & Audits',
            'singular_name' => 'Lead Submission'
        ),
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => 'edit.php?post_type=business_listing',
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'leadSubmission',
        'graphql_plural_name' => 'leadSubmissions',
        'supports'            => array('title', 'editor', 'custom-fields'),
        'menu_icon'           => 'dashicons-email-alt'
    ));

    // ── Suggested Edit CPT ──
    register_post_type('suggested_edit', array(
        'labels' => array(
            'name'          => 'Locable Edit Suggestions',
            'singular_name' => 'Edit Suggestion',
            'add_new_item'  => 'Add Edit Suggestion',
            'edit_item'     => 'Review Edit Suggestion',
            'search_items'  => 'Search Edit Suggestions',
            'not_found'     => 'No edit suggestions found',
        ),
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => 'edit.php?post_type=business_listing',
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'suggestedEdit',
        'graphql_plural_name' => 'suggestedEdits',
        'supports'            => array('title', 'editor', 'custom-fields'),
        'menu_icon'           => 'dashicons-edit-page',
    ));

    // ── Registered User CPT ──
    register_post_type('directory_user', array(
        'labels' => array(
            'name'          => 'Locable Registered Users',
            'singular_name' => 'Registered User',
            'add_new_item'  => 'Add New User',
            'edit_item'     => 'Review User Account',
            'search_items'  => 'Search Users',
            'not_found'     => 'No registered users found',
        ),
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => 'edit.php?post_type=business_listing',
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'directoryUser',
        'graphql_plural_name' => 'directoryUsers',
        'supports'            => array('title', 'editor', 'custom-fields'),
        'menu_icon'           => 'dashicons-admin-users',
    ));

    // ── Register all meta fields so REST API exposes them ──────────────────────
    $string_fields = array(
        'placeId', 'dataId', 'type', 'typeSlug', 'otherTypes', 'slug',
        'city', 'citySlug', 'state', 'stateSlug', 'zip', 'country',
        'address', 'website', 'phone', 'price', 'openState',
        'workingHours', 'serviceOptions', 'thumbnail', 'keyword',
        'description', 'verified',
    );
    foreach ($string_fields as $field) {
        register_post_meta('business_listing', $field, array(
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => '__return_true',
        ));
    }

    $number_fields = array('rating', 'reviews', 'latitude', 'longitude', 'googleMapsRank');
    foreach ($number_fields as $field) {
        register_post_meta('business_listing', $field, array(
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'number',
            'auth_callback' => '__return_true',
        ));
    }

    $suggested_fields = array(
        'placeId', 'businessTitle', 'userEmail', 'userName',
        'proposedPhone', 'proposedWebsite', 'proposedAddress',
        'proposedDescription', 'proposedHours', 'editStatus'
    );
    foreach ($suggested_fields as $field) {
        register_post_meta('suggested_edit', $field, array(
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => '__return_true',
        ));
    }

    $user_fields = array('name', 'email', 'accountStatus');
    foreach ($user_fields as $field) {
        register_post_meta('directory_user', $field, array(
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => '__return_true',
        ));
    }

    register_post_meta('business_listing', 'userEmail', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => '__return_true',
    ));
}

// ─── 3. ADMIN MENU ───────────────────────────────────────────────────────────
add_action('admin_menu', 'locable_admin_menu');

function locable_admin_menu() {
    add_submenu_page(
        'edit.php?post_type=business_listing',
        'CSV Import & Export',
        'CSV Import / Export',
        'manage_options',
        'locable-csv-importer',
        'locable_csv_importer_page'
    );

    add_submenu_page(
        'edit.php?post_type=business_listing',
        'Directory & Image Settings',
        'Directory & Image Settings',
        'manage_options',
        'locable-maps-settings',
        'locable_maps_settings_page'
    );

    add_submenu_page(
        'edit.php?post_type=business_listing',
        'Empty All Listings',
        '🗑 Empty All Listings',
        'manage_options',
        'locable-empty-all',
        'locable_empty_all_page'
    );
}

// ─── Standalone Empty All Page ────────────────────────────────────────────────
function locable_empty_all_page() {
    // Count current listings
    $count_obj = wp_count_posts('business_listing');
    $total = 0;
    foreach ((array)$count_obj as $n) { $total += (int)$n; }
    $delete_nonce = wp_create_nonce('locable_delete_all_nonce');
    $ajax_url     = admin_url('admin-ajax.php');
    ?>
    <div class="wrap">
        <h1 style="color:#dc2626;">🗑 Empty All Business Listings</h1>
        <p style="font-size:14px;color:#374151;max-width:600px;">
            This permanently deletes <strong>every</strong> business listing stored in WordPress.
            Runs in <strong>batches of 50</strong> so it never times out or crashes — safe for any size dataset.
            <br><br>
            <strong style="color:#dc2626;">⚠ This cannot be undone.</strong>
        </p>

        <div style="background:#fff5f5;border:2px solid #fca5a5;padding:28px;border-radius:10px;max-width:560px;margin-top:16px;">

            <div style="font-size:15px;margin-bottom:20px;">
                Businesses currently stored in WordPress:
                <span id="lbl_count" style="background:#fef2f2;border:1px solid #fca5a5;padding:3px 14px;border-radius:999px;font-weight:800;font-size:16px;color:#dc2626;">
                    <?php echo number_format($total); ?>
                </span>
            </div>

            <div id="confirm_box">
                <p style="font-size:13px;color:#7f1d1d;margin-bottom:10px;">
                    Type <strong>DELETE ALL</strong> below then click the button:
                </p>
                <input id="confirm_txt" type="text" placeholder="Type DELETE ALL here…"
                    style="width:100%;padding:10px 14px;border:2px solid #fca5a5;border-radius:6px;font-size:14px;box-sizing:border-box;margin-bottom:14px;" />
                <button id="btn_delete" class="button"
                    style="background:#dc2626;color:#fff;border:none;padding:10px 28px;font-size:15px;font-weight:700;border-radius:6px;cursor:not-allowed;opacity:0.5;width:100%;"
                    disabled>
                    🗑 Delete All Businesses Now
                </button>
            </div>

            <!-- Progress (hidden) -->
            <div id="del_progress" style="display:none;margin-top:20px;">
                <div style="background:#fee2e2;border-radius:8px;overflow:hidden;height:24px;">
                    <div id="del_bar" style="background:#dc2626;height:100%;width:0%;transition:width 0.25s ease;border-radius:8px;"></div>
                </div>
                <p id="del_label" style="font-size:13px;color:#7f1d1d;margin-top:8px;font-weight:600;">Starting…</p>
            </div>

            <!-- Result (hidden) -->
            <div id="del_result" style="display:none;margin-top:18px;padding:16px;border-radius:8px;font-size:14px;"></div>
        </div>
    </div>

    <script>
    (function() {
        const ajaxUrl   = '<?php echo esc_js($ajax_url); ?>';
        const delNonce  = '<?php echo esc_js($delete_nonce); ?>';
        const confirmTxt = document.getElementById('confirm_txt');
        const btnDelete  = document.getElementById('btn_delete');

        // Enable button only when user types "DELETE ALL"
        confirmTxt.addEventListener('input', function() {
            const ok = confirmTxt.value.trim() === 'DELETE ALL';
            btnDelete.disabled = !ok;
            btnDelete.style.opacity = ok ? '1' : '0.5';
            btnDelete.style.cursor  = ok ? 'pointer' : 'not-allowed';
        });

        btnDelete.addEventListener('click', async function() {
            if (btnDelete.disabled) return;
            if (!confirm('Last chance: permanently delete ALL business listings?')) return;

            // Disable UI
            btnDelete.disabled = true;
            btnDelete.style.opacity = '0.5';
            confirmTxt.disabled = true;
            document.getElementById('del_progress').style.display = 'block';
            document.getElementById('del_result').style.display   = 'none';

            const initialTotal = parseInt(
                document.getElementById('lbl_count').textContent.replace(/,/g,''), 10
            ) || 1;

            let totalDeleted = 0;
            let done = false;

            while (!done) {
                try {
                    const res  = await fetch(ajaxUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ action: 'locable_delete_batch', _nonce: delNonce })
                    });
                    const json = await res.json();

                    if (!json.success) { done = true; break; }

                    totalDeleted += (json.data.deleted || 0);
                    done          = json.data.done;

                    const pct = Math.min(100, Math.round(totalDeleted / initialTotal * 100));
                    document.getElementById('del_bar').style.width    = pct + '%';
                    document.getElementById('del_label').textContent  =
                        'Deleted ' + totalDeleted + ' of ~' + initialTotal + ' listings…';
                    document.getElementById('lbl_count').textContent  =
                        Math.max(0, initialTotal - totalDeleted) + ' remaining';

                    await new Promise(r => setTimeout(r, 60));
                } catch(e) {
                    done = true;
                }
            }

            document.getElementById('del_bar').style.width   = '100%';
            document.getElementById('del_label').textContent = 'Done!';
            document.getElementById('lbl_count').textContent = '0';

            const res = document.getElementById('del_result');
            res.style.display    = 'block';
            res.style.background = '#ecfdf5';
            res.style.border     = '1px solid #6ee7b7';
            res.innerHTML = '✅ <strong>Complete!</strong> Removed <strong>' + totalDeleted +
                            '</strong> business listing' + (totalDeleted !== 1 ? 's' : '') + '.';
        });
    })();
    </script>
    <?php
}

// ─── 4. SETTINGS PAGE ────────────────────────────────────────────────────────
function locable_maps_settings_page() {
    $message = '';

    if (isset($_POST['save_locable_settings']) && check_admin_referer('locable_save_settings')) {
        update_option('locable_google_maps_api_key',   sanitize_text_field($_POST['locable_google_maps_api_key'] ?? ''));
        update_option('locable_grid_fallback_image',   esc_url_raw($_POST['locable_grid_fallback_image'] ?? ''));
        update_option('locable_detail_fallback_image', esc_url_raw($_POST['locable_detail_fallback_image'] ?? ''));
        $message = "<div class='notice notice-success'><p><strong>Locable Settings &amp; Fallback Images updated successfully!</strong></p></div>";
    }

    $current_key    = get_option('locable_google_maps_api_key', '');
    $grid_fallback  = get_option('locable_grid_fallback_image', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&q=80');
    $detail_fallback = get_option('locable_detail_fallback_image', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop&q=80');
    ?>
    <div class="wrap">
        <h1>Locable Directory - Configuration &amp; Image Fallback Settings</h1>
        <p>Configure your Google Maps API key and default placeholder fallback images.</p>
        <?php echo $message; ?>
        <form method="post" style="background:#fff;border:1px solid #ccd0d4;padding:20px;border-radius:8px;max-width:650px;margin-top:20px;">
            <?php wp_nonce_field('locable_save_settings'); ?>
            <h2 style="margin-top:0;">1. Google Maps API Key</h2>
            <input type="text" name="locable_google_maps_api_key" value="<?php echo esc_attr($current_key); ?>" style="width:100%;padding:8px;font-family:monospace;margin-bottom:20px;" />

            <h2>2. Fallback Placeholder Images</h2>
            <p style="font-size:13px;color:#666;">Used whenever a business listing lacks a thumbnail.</p>

            <label style="font-weight:bold;display:block;margin-bottom:6px;">Grid Card Fallback URL:</label>
            <input type="url" name="locable_grid_fallback_image" value="<?php echo esc_url($grid_fallback); ?>" style="width:100%;padding:8px;margin-bottom:15px;" />

            <label style="font-weight:bold;display:block;margin-bottom:6px;">Detail Cover Fallback URL:</label>
            <input type="url" name="locable_detail_fallback_image" value="<?php echo esc_url($detail_fallback); ?>" style="width:100%;padding:8px;margin-bottom:20px;" />

            <input type="submit" name="save_locable_settings" class="button button-primary" value="Save All Directory Settings" />
        </form>
    </div>
    <?php
}

// ─── 5. CSV IMPORTER PAGE (chunked AJAX upload) ───────────────────────────────
function locable_csv_importer_page() {
    // Show current PHP limits so admin can verify
    $upload_max = ini_get('upload_max_filesize');
    $post_max   = ini_get('post_max_size');
    ?>
    <div class="wrap">
        <h1>Locable Directory – Bulk CSV Importer &amp; Exporter</h1>
        <p>
            Upload your extracted CSV file to bulk import or update listings.
            <code>placeId</code> is the unique key — existing records are updated, new ones are created.
            <br>
            <strong>Current server limits:</strong>
            Max upload = <code><?php echo esc_html($upload_max); ?></code> |
            Max POST = <code><?php echo esc_html($post_max); ?></code>
        </p>

        <div style="background:#fff;border:1px solid #ccd0d4;padding:24px;border-radius:8px;max-width:680px;margin-top:20px;">
            <h2 style="margin-top:0;">Import CSV Sheet</h2>

            <p style="font-size:13px;color:#666;">
                Supports files up to 64MB. For very large files the import runs in batches — do not close the tab until done.
            </p>

            <!-- File picker -->
            <input type="file" id="locable_csv_file" accept=".csv" style="display:block;margin-bottom:12px;" />
            <button id="locable_start_import" class="button button-primary" style="padding:8px 20px;">
                Upload &amp; Process CSV
            </button>

            <!-- Progress area (hidden until import starts) -->
            <div id="locable_progress_wrap" style="display:none;margin-top:20px;">
                <div style="background:#e5e7eb;border-radius:8px;overflow:hidden;height:22px;">
                    <div id="locable_progress_bar" style="background:#0ea5e9;height:100%;width:0%;transition:width 0.3s;border-radius:8px;"></div>
                </div>
                <p id="locable_progress_label" style="font-size:13px;color:#374151;margin-top:6px;">Preparing…</p>
            </div>

            <!-- Result box -->
            <div id="locable_result" style="display:none;margin-top:16px;padding:14px;border-radius:6px;font-size:14px;"></div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- DANGER ZONE: Delete All Businesses                     -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div id="locable_danger_zone" style="background:#fff5f5;border:2px solid #fca5a5;padding:24px;border-radius:8px;max-width:680px;margin-top:30px;">
            <h2 style="margin-top:0;color:#dc2626;">&#9888; Danger Zone — Empty All Businesses</h2>
            <p style="font-size:13px;color:#7f1d1d;margin-bottom:16px;">
                This will permanently delete <strong>every</strong> business listing from WordPress.
                Deletions are processed in batches of 50 so the server never crashes — even with thousands of records.
                This action <strong>cannot be undone</strong>.
            </p>

            <!-- Live count badge -->
            <div style="margin-bottom:16px;font-size:14px;">
                Total businesses currently stored:
                <span id="locable_biz_count" style="background:#fef2f2;border:1px solid #fca5a5;padding:2px 10px;border-radius:999px;font-weight:700;color:#dc2626;">Loading…</span>
            </div>

            <button id="locable_delete_all_btn" class="button" style="background:#dc2626;color:#fff;border-color:#b91c1c;padding:8px 20px;font-weight:700;font-size:14px;">
                🗑 Empty All Businesses
            </button>

            <!-- Delete progress (hidden) -->
            <div id="locable_del_progress_wrap" style="display:none;margin-top:20px;">
                <div style="background:#fee2e2;border-radius:8px;overflow:hidden;height:22px;">
                    <div id="locable_del_bar" style="background:#dc2626;height:100%;width:0%;transition:width 0.3s;border-radius:8px;"></div>
                </div>
                <p id="locable_del_label" style="font-size:13px;color:#7f1d1d;margin-top:6px;">Preparing…</p>
            </div>

            <!-- Delete result -->
            <div id="locable_del_result" style="display:none;margin-top:16px;padding:14px;border-radius:6px;font-size:14px;"></div>
        </div>

        <!-- ══ Confirmation Modal ══ -->
        <div id="locable_confirm_modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:12px;padding:32px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <h2 style="margin-top:0;color:#dc2626;">⚠️ Confirm Deletion</h2>
                <p style="font-size:14px;color:#374151;">
                    You are about to <strong>permanently delete ALL business listings</strong>.
                    This cannot be undone.<br><br>
                    Type <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">DELETE ALL</code> below to confirm:
                </p>
                <input id="locable_confirm_input" type="text" placeholder="Type DELETE ALL here…"
                    style="width:100%;padding:10px;border:2px solid #fca5a5;border-radius:6px;font-size:14px;box-sizing:border-box;margin-bottom:16px;" />
                <div style="display:flex;gap:12px;">
                    <button id="locable_confirm_yes" class="button" style="background:#dc2626;color:#fff;border-color:#b91c1c;padding:8px 20px;font-weight:700;flex:1;" disabled>
                        Yes, Delete Everything
                    </button>
                    <button id="locable_confirm_no" class="button" style="flex:1;padding:8px 20px;">Cancel</button>
                </div>
            </div>
        </div>
    </div>

    <script>
    (function(){
        const CHUNK_SIZE = 200; // rows per AJAX batch
        const nonce     = '<?php echo wp_create_nonce("locable_csv_import_nonce"); ?>';
        const ajaxUrl   = '<?php echo admin_url("admin-ajax.php"); ?>';

        document.getElementById('locable_start_import').addEventListener('click', async function() {
            const fileInput = document.getElementById('locable_csv_file');
            if (!fileInput.files.length) { alert('Please select a CSV file first.'); return; }

            const file = fileInput.files[0];
            let text = await file.text(); // read entire file in browser (JS heap, not PHP)

            // ── Strip UTF-8 BOM (\uFEFF) added by Excel / Google Sheets ──
            text = text.replace(/^\uFEFF/, '');

            // Auto-detect delimiter then parse
            const delimiter = detectDelimiter(text);
            const rows = parseCSV(text, delimiter);

            // Clean every header: trim whitespace, strip any leftover BOM/invisible chars
            const header = (rows[0] || []).map(h => h.replace(/^\uFEFF/, '').trim());

            // Show detected columns for debugging
            const detectedCols = header.join(', ');

            // Case-insensitive search for placeId column
            const placeIdKey = header.find(h => h.toLowerCase() === 'placeid');
            if (!placeIdKey) {
                showResult('error',
                    '❌ <strong>CSV Error:</strong> Could not find a <code>placeId</code> column.<br>' +
                    '<strong>Columns detected in your file:</strong><br><code>' + detectedCols + '</code><br><br>' +
                    'Your first column name must be exactly <code>placeId</code> (any capitalisation is fine).');
                return;
            }

            // Only keep rows whose column count matches the header
            const dataRows = rows.slice(1).filter(r => r.length >= header.length);

            const total   = dataRows.length;
            let created   = 0, updated = 0, skipped = 0, errCount = 0;
            let offset    = 0;

            document.getElementById('locable_progress_wrap').style.display = 'block';
            document.getElementById('locable_result').style.display = 'none';
            setProgress(0, `Starting… 0 / ${total} rows`);

            while (offset < total) {
                const chunk = dataRows.slice(offset, offset + CHUNK_SIZE);
                const payload = chunk.map(r => {
                    const obj = {};
                    // Use the already-cleaned header keys; remap placeIdKey → 'placeId'
                    header.forEach((h, i) => {
                        const key = h === placeIdKey ? 'placeId' : h;
                        obj[key] = (r[i] ?? '').trim();
                    });
                    return obj;
                });

                try {
                    const res = await fetch(ajaxUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            action:  'locable_import_chunk',
                            _nonce:  nonce,
                            payload: JSON.stringify(payload)
                        })
                    });
                    const json = await res.json();
                    if (json.success) {
                        created  += json.data.created  || 0;
                        updated  += json.data.updated  || 0;
                        skipped  += json.data.skipped  || 0;
                        errCount += json.data.errors   || 0;
                    } else {
                        errCount += chunk.length;
                    }
                } catch (e) {
                    errCount += chunk.length;
                }

                offset += CHUNK_SIZE;
                const pct = Math.min(100, Math.round(offset / total * 100));
                setProgress(pct, `Processed ${Math.min(offset, total)} / ${total} rows…`);
            }

            const icon = errCount > 0 ? '⚠️' : '✅';
            showResult(
                errCount > 0 ? 'warning' : 'success',
                `${icon} <strong>Import Complete!</strong><br>
                ✅ Created: <strong>${created}</strong> new businesses<br>
                🔄 Updated: <strong>${updated}</strong> existing businesses<br>
                ⏭ Skipped (no placeId): <strong>${skipped}</strong><br>
                ❌ Errors: <strong>${errCount}</strong>`
            );
            setProgress(100, 'Done!');
        });

        function setProgress(pct, label) {
            document.getElementById('locable_progress_bar').style.width = pct + '%';
            document.getElementById('locable_progress_label').textContent = label;
        }

        function showResult(type, html) {
            const el = document.getElementById('locable_result');
            el.style.display = 'block';
            el.style.background = type === 'success' ? '#ecfdf5' : (type === 'warning' ? '#fffbeb' : '#fef2f2');
            el.style.border     = '1px solid ' + (type === 'success' ? '#6ee7b7' : (type === 'warning' ? '#fcd34d' : '#fca5a5'));
            el.innerHTML = html;
        }

        /**
         * Detect the delimiter used in a CSV by counting occurrences
         * of comma, semicolon, and tab in the first line.
         * Returns the character that appears most often.
         */
        function detectDelimiter(text) {
            const firstLine = text.split(/\r?\n/)[0] || '';
            const counts = {
                ',': (firstLine.match(/,/g) || []).length,
                ';': (firstLine.match(/;/g) || []).length,
                '\t': (firstLine.match(/\t/g) || []).length,
            };
            // Pick whichever appears most; default to comma
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ',';
        }

        /**
         * RFC-4180 compliant CSV parser (handles quoted fields with embedded separators/newlines).
         * BOM stripping and delimiter detection are done before calling this function.
         * @param {string} text  - raw CSV text (BOM already stripped)
         * @param {string} sep   - delimiter character (auto-detected)
         * Returns array of arrays (rows of cells).
         */
        function parseCSV(text, sep = ',') {
            const rows = [];
            let row = [], cell = '', inQuote = false, i = 0;

            // Normalise line endings
            text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            while (i < text.length) {
                const ch = text[i];

                if (inQuote) {
                    if (ch === '"') {
                        if (text[i + 1] === '"') { // escaped quote
                            cell += '"'; i += 2; continue;
                        } else {
                            inQuote = false; i++; continue;
                        }
                    }
                    cell += ch; i++; continue;
                }

                if (ch === '"') { inQuote = true; i++; continue; }
                if (ch === sep) { row.push(cell); cell = ''; i++; continue; }
                if (ch === '\n') {
                    row.push(cell); cell = '';
                    if (row.some(c => c !== '')) rows.push(row); // skip blank lines
                    row = []; i++; continue;
                }
                cell += ch; i++;
            }
            // Last cell / row
            row.push(cell);
            if (row.some(c => c !== '')) rows.push(row);

            return rows;
        }

        // ══════════════════════════════════════════════════════════
        // DELETE ALL BUSINESSES – chunked AJAX (50 per batch)
        // ══════════════════════════════════════════════════════════
        const delNonce  = '<?php echo wp_create_nonce("locable_delete_all_nonce"); ?>';
        const modal     = document.getElementById('locable_confirm_modal');
        const confirmIn = document.getElementById('locable_confirm_input');
        const confirmYes= document.getElementById('locable_confirm_yes');
        const confirmNo = document.getElementById('locable_confirm_no');

        // Load live count on page open
        async function loadBizCount() {
            try {
                const r = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ action: 'locable_count_businesses' })
                });
                const j = await r.json();
                document.getElementById('locable_biz_count').textContent =
                    j.success ? j.data.total + ' businesses' : 'Unknown';
            } catch(e) {
                document.getElementById('locable_biz_count').textContent = 'Could not load';
            }
        }
        loadBizCount();

        // Open confirmation modal
        document.getElementById('locable_delete_all_btn').addEventListener('click', function() {
            confirmIn.value = '';
            confirmYes.disabled = true;
            modal.style.display = 'flex';
            confirmIn.focus();
        });

        // Enable confirm button only when user types exactly "DELETE ALL"
        confirmIn.addEventListener('input', function() {
            confirmYes.disabled = (confirmIn.value.trim() !== 'DELETE ALL');
        });

        // Cancel
        confirmNo.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        // Close modal on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Confirmed – start chunked deletion
        confirmYes.addEventListener('click', async function() {
            modal.style.display = 'none';
            confirmYes.disabled = true;

            const delWrap  = document.getElementById('locable_del_progress_wrap');
            const delBar   = document.getElementById('locable_del_bar');
            const delLabel = document.getElementById('locable_del_label');
            const delResult= document.getElementById('locable_del_result');

            delWrap.style.display  = 'block';
            delResult.style.display= 'none';
            document.getElementById('locable_delete_all_btn').disabled = true;

            // Get initial total for progress %
            let initialTotal = 1;
            try {
                const cr = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ action: 'locable_count_businesses' })
                });
                const cj = await cr.json();
                if (cj.success) initialTotal = Math.max(1, cj.data.total);
            } catch(e) {}

            let totalDeleted = 0;
            let done = false;

            while (!done) {
                try {
                    const res = await fetch(ajaxUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            action:  'locable_delete_batch',
                            _nonce:  delNonce
                        })
                    });
                    const json = await res.json();
                    if (!json.success) { done = true; break; }

                    totalDeleted += json.data.deleted || 0;
                    done          = json.data.done;

                    const pct = Math.min(100, Math.round(totalDeleted / initialTotal * 100));
                    delBar.style.width  = pct + '%';
                    delLabel.textContent= `Deleted ${totalDeleted} of ~${initialTotal} businesses…`;

                    // Small pause so the browser stays responsive
                    await new Promise(r => setTimeout(r, 80));
                } catch(e) {
                    done = true;
                }
            }

            delBar.style.width   = '100%';
            delLabel.textContent = 'Done!';

            // Refresh count badge
            document.getElementById('locable_biz_count').textContent = '0 businesses';
            document.getElementById('locable_delete_all_btn').disabled = false;

            delResult.style.display = 'block';
            delResult.style.background = '#ecfdf5';
            delResult.style.border     = '1px solid #6ee7b7';
            delResult.innerHTML = `✅ <strong>All businesses deleted.</strong> Removed <strong>${totalDeleted}</strong> listing${totalDeleted !== 1 ? 's' : ''} in total.`;
        });

    })();
    </script>
    <?php
}

// ─── 6. AJAX HANDLER – process one chunk of rows ─────────────────────────────
add_action('wp_ajax_locable_import_chunk', 'locable_ajax_import_chunk');

function locable_ajax_import_chunk() {
    // Security
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    if (!isset($_POST['_nonce']) || !wp_verify_nonce($_POST['_nonce'], 'locable_csv_import_nonce')) {
        wp_send_json_error(['message' => 'Nonce verification failed'], 403);
    }

    $payload_raw = stripslashes($_POST['payload'] ?? '[]');
    $rows        = json_decode($payload_raw, true);

    if (!is_array($rows)) {
        wp_send_json_error(['message' => 'Invalid payload JSON'], 400);
    }

    $created = $updated = $skipped = $errors = 0;

    foreach ($rows as $row) {
        $placeId = sanitize_text_field($row['placeId'] ?? '');
        $title   = sanitize_text_field($row['title']   ?? '');

        if (empty($placeId)) { $skipped++; continue; }
        if (empty($title))   { $title = 'Untitled Business'; }

        // Upsert: find by placeId meta
        $existing = get_posts(array(
            'post_type'      => 'business_listing',
            'meta_key'       => 'placeId',
            'meta_value'     => $placeId,
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ));

        $post_data = array(
            'post_title'   => $title,
            'post_content' => sanitize_textarea_field($row['description'] ?? ''),
            'post_type'    => 'business_listing',
            'post_status'  => 'publish',
        );

        if (!empty($existing)) {
            $post_data['ID'] = $existing[0];
            $post_id = wp_update_post($post_data, true);
            if (!is_wp_error($post_id)) $updated++; else $errors++;
        } else {
            $post_id = wp_insert_post($post_data, true);
            if (!is_wp_error($post_id)) $created++; else $errors++;
        }

        if (is_wp_error($post_id)) continue;

        // ── Save all meta fields ──
        $meta_fields = array(
            'placeId'        => sanitize_text_field($row['placeId']        ?? ''),
            'dataId'         => sanitize_text_field($row['dataId']         ?? ''),
            'type'           => sanitize_text_field($row['type']           ?? ''),
            'typeSlug'       => sanitize_text_field($row['typeSlug']       ?? ''),
            'otherTypes'     => sanitize_text_field($row['otherTypes']     ?? ''),
            'slug'           => sanitize_title($row['slug']                ?? $placeId),
            'city'           => sanitize_text_field($row['city']           ?? ''),
            'state'          => locable_detect_state_from_meta(
                                  sanitize_text_field($row['state'] ?? ''),
                                  sanitize_text_field($row['city'] ?? ''),
                                  sanitize_text_field($row['address'] ?? '')
                                ),
            'zip'            => sanitize_text_field($row['zip']            ?? ''),
            'country'        => sanitize_text_field($row['country']        ?? ''),
            'address'        => sanitize_text_field($row['address']        ?? ''),
            'website'        => esc_url_raw($row['website']                ?? ''),
            'phone'          => sanitize_text_field($row['phone']          ?? ''),
            'price'          => sanitize_text_field($row['price']          ?? '$$'),
            'rating'         => floatval($row['rating']                    ?? 0),
            'reviews'        => intval($row['reviews']                     ?? 0),
            'openState'      => sanitize_text_field($row['openState']      ?? ''),
            'workingHours'   => wp_kses_post($row['workingHours']          ?? ''),
            'serviceOptions' => sanitize_text_field($row['serviceOptions'] ?? ''),
            'thumbnail'      => esc_url_raw($row['thumbnail']              ?? ''),
            'latitude'       => floatval($row['latitude']                  ?? 0),
            'longitude'      => floatval($row['longitude']                 ?? 0),
            'keyword'        => sanitize_text_field($row['keyword']        ?? ''),
            'googleMapsRank' => intval($row['googleMapsRank']              ?? 0),
            'verified'       => ($row['verified'] ?? 'false') === 'true' ? 'true' : 'false',
        );

        foreach ($meta_fields as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }

        // ── Auto-fill WP Taxonomies (Business Types & Locations) without duplicates ──
        if (!empty($meta_fields['type'])) {
            wp_set_object_terms($post_id, $meta_fields['type'], 'business_type', false);
        }
        
        $city = $meta_fields['city'];
        if (empty($city) && !empty($meta_fields['address'])) {
            if (preg_match('/,\s*([^,]+),\s*[A-Z]{2}/i', $meta_fields['address'], $m)) {
                $city = trim($m[1]);
                update_post_meta($post_id, 'city', $city);
                update_post_meta($post_id, 'citySlug', sanitize_title($city));
            }
        }
        if (!empty($city)) {
            wp_set_object_terms($post_id, $city, 'business_location', false);
        }
    }

    wp_send_json_success(array(
        'created' => $created,
        'updated' => $updated,
        'skipped' => $skipped,
        'errors'  => $errors,
    ));
}

// ─── 7. AJAX: Count all business_listing posts ────────────────────────────────
add_action('wp_ajax_locable_count_businesses', 'locable_ajax_count_businesses');

function locable_ajax_count_businesses() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized'], 403);
    }

    $count = wp_count_posts('business_listing');
    $total = isset($count->publish) ? (int)$count->publish : 0;
    // Include drafts, private etc.
    foreach ((array)$count as $status => $n) {
        if ($status !== 'publish') $total += (int)$n;
    }

    wp_send_json_success(['total' => $total]);
}

// ─── 8. AJAX: Delete one batch of business_listing posts ─────────────────────
add_action('wp_ajax_locable_delete_batch', 'locable_ajax_delete_batch');

function locable_ajax_delete_batch() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    if (!isset($_POST['_nonce']) || !wp_verify_nonce($_POST['_nonce'], 'locable_delete_all_nonce')) {
        wp_send_json_error(['message' => 'Nonce failed'], 403);
    }

    // Fetch a small batch (no offset needed — always fetch the first N since we delete them)
    $batch_size = 50;
    $posts = get_posts(array(
        'post_type'      => 'business_listing',
        'posts_per_page' => $batch_size,
        'post_status'    => 'any',
        'fields'         => 'ids',
        'orderby'        => 'ID',
        'order'          => 'ASC',
    ));

    $deleted = 0;
    foreach ($posts as $id) {
        if (wp_delete_post($id, true)) $deleted++; // true = force delete (skip trash)
    }

    // Return how many still remain
    $remaining_count = wp_count_posts('business_listing');
    $remaining = 0;
    foreach ((array)$remaining_count as $n) { $remaining += (int)$n; }

    wp_send_json_success(array(
        'deleted'   => $deleted,
        'remaining' => $remaining,
        'done'      => ($remaining === 0 || count($posts) === 0),
    ));
}

// ─── 9. AJAX: Auto-Populate & Sync WP Taxonomies for Existing Listings ─────────
add_action('wp_ajax_locable_sync_taxonomies', 'locable_ajax_sync_taxonomies');

function locable_ajax_sync_taxonomies() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized'], 403);
    }

    $offset = intval($_POST['offset'] ?? 0);
    $batch_size = 200;

    $posts = get_posts(array(
        'post_type'      => 'business_listing',
        'posts_per_page' => $batch_size,
        'offset'         => $offset,
        'post_status'    => 'any',
        'fields'         => 'ids',
        'orderby'        => 'ID',
        'order'          => 'ASC',
    ));

    $processed = 0;
    foreach ($posts as $id) {
        $type = get_post_meta($id, 'type', true);
        $city = get_post_meta($id, 'city', true);

        if (!empty($type)) {
            wp_set_object_terms($id, $type, 'business_type', false);
        }
        if (!empty($city)) {
            wp_set_object_terms($id, $city, 'business_location', false);
        }
        $processed++;
    }

    $count = wp_count_posts('business_listing');
    $total = isset($count->publish) ? (int)$count->publish : 0;

    wp_send_json_success(array(
        'processed' => $processed,
        'nextOffset' => $offset + $processed,
        'done'      => count($posts) < $batch_size,
        'total'     => $total,
    ));
}

// ─── 9b. Google Maps Integration & Live Review Sync Metabox ────────────────────
add_action('add_meta_boxes', 'locable_add_gmaps_sync_metabox');
function locable_add_gmaps_sync_metabox() {
    add_meta_box(
        'locable_gmaps_sync_box',
        '⚡ Google Maps Integration & Live Review Sync',
        'locable_render_gmaps_sync_metabox',
        'business_listing',
        'normal',
        'high'
    );
}

function locable_render_gmaps_sync_metabox($post) {
    $placeId   = get_post_meta($post->ID, 'placeId', true);
    $rating    = get_post_meta($post->ID, 'rating', true) ?: '5.0';
    $reviews   = get_post_meta($post->ID, 'reviews', true) ?: '0';
    $title     = get_post_meta($post->ID, 'title', true) ?: $post->post_title;
    $city      = get_post_meta($post->ID, 'city', true) ?: 'San Diego';
    $address   = get_post_meta($post->ID, 'address', true) ?: '';
    $state     = get_post_meta($post->ID, 'state', true) ?: 'CA';

    wp_nonce_field('locable_gmaps_sync_action', 'locable_gmaps_nonce');
    ?>
    <div style="padding:10px;">
        <p style="font-size:13px;color:#475569;margin-bottom:12px;">
            Link this business to its official Google Maps Place ID to automatically display <strong>real live Google Reviews, Star Ratings, &amp; Reviewer Photos</strong> on your website.
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
            <div>
                <label style="display:block;font-weight:700;margin-bottom:4px;">Google Place ID (e.g. ChIJ...)</label>
                <input type="text" name="locable_place_id" value="<?php echo esc_attr($placeId); ?>" style="width:100%;padding:6px 10px;font-family:monospace;" placeholder="ChIJ..." />
            </div>
            <div>
                <label style="display:block;font-weight:700;margin-bottom:4px;">Current Live Stats</label>
                <div style="padding:6px 10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;font-weight:700;color:#0f172a;">
                    ★ <?php echo esc_html($rating); ?> / 5.0 (<?php echo esc_html($reviews); ?> Reviews)
                </div>
            </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;">
            <input type="submit" name="locable_save_gmaps_btn" class="button button-secondary" value="Save Place ID" />
            <input type="submit" name="locable_autofind_gmaps_btn" class="button button-primary button-hero" style="background:#0ea5e9;border-color:#0284c7;" value="🔍 Auto-Find &amp; Sync Google Place ID &amp; Live Reviews" onclick="return confirm('Search Google Places API for <?php echo esc_js($title); ?> in <?php echo esc_js($city); ?> and sync Place ID?');" />
        </div>
    </div>
    <?php
}

add_action('save_post_business_listing', 'locable_handle_gmaps_sync_save');
function locable_handle_gmaps_sync_save($post_id) {
    if (!isset($_POST['locable_gmaps_nonce']) || !wp_verify_nonce($_POST['locable_gmaps_nonce'], 'locable_gmaps_sync_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if (isset($_POST['locable_place_id']) && !empty($_POST['locable_place_id'])) {
        update_post_meta($post_id, 'placeId', sanitize_text_field($_POST['locable_place_id']));
    }

    if (isset($_POST['locable_autofind_gmaps_btn'])) {
        $title   = get_post_meta($post_id, 'title', true) ?: get_the_title($post_id);
        $city    = get_post_meta($post_id, 'city', true) ?: 'San Diego';
        $address = get_post_meta($post_id, 'address', true) ?: '';
        $state   = get_post_meta($post_id, 'state', true) ?: 'CA';

        $api_key = 'AIzaSyAusNwdN9zPqXJ_doW_M4mbdrhtJkZkdpU';
        $query   = urlencode(trim("$title $address $city $state"));
        $response = wp_remote_get("https://maps.googleapis.com/maps/api/place/textsearch/json?query={$query}&key={$api_key}");

        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (!empty($body['results'][0]['place_id'])) {
                $g_place_id = $body['results'][0]['place_id'];
                $g_rating   = floatval($body['results'][0]['rating'] ?? 5.0);
                $g_reviews  = intval($body['results'][0]['user_ratings_total'] ?? 0);

                update_post_meta($post_id, 'placeId', $g_place_id);
                update_post_meta($post_id, 'rating', $g_rating);
                update_post_meta($post_id, 'reviews', $g_reviews);
            }
        }
    }
}
function locable_apply_suggested_edit_to_business($edit_id) {
    $placeId       = get_post_meta($edit_id, 'placeId', true);
    $businessTitle = get_post_meta($edit_id, 'businessTitle', true);

    $target_id = 0;
    
    // 1. Try finding target by numeric post ID if placeId is numeric
    if (!empty($placeId) && is_numeric($placeId)) {
        $p = get_post(intval($placeId));
        if ($p && $p->post_type === 'business_listing') {
            $target_id = $p->ID;
        }
    }

    // 2. Try finding target by placeId meta key
    if (!$target_id && !empty($placeId)) {
        $target = get_posts(array(
            'post_type'      => 'business_listing',
            'meta_key'       => 'placeId',
            'meta_value'     => $placeId,
            'posts_per_page' => 1,
            'post_status'    => 'any',
        ));
        if (!empty($target)) {
            $target_id = $target[0]->ID;
        }
    }

    // 3. Fallback: try finding target by exact title
    if (!$target_id && !empty($businessTitle)) {
        $target = get_posts(array(
            'post_type'      => 'business_listing',
            'title'          => $businessTitle,
            'posts_per_page' => 1,
            'post_status'    => 'any',
        ));
        if (!empty($target)) {
            $target_id = $target[0]->ID;
        }
    }

    if ($target_id) {
        $pPhone    = get_post_meta($edit_id, 'proposedPhone', true);
        $pWeb      = get_post_meta($edit_id, 'proposedWebsite', true);
        $pAddr     = get_post_meta($edit_id, 'proposedAddress', true);
        $pDesc     = get_post_meta($edit_id, 'proposedDescription', true);
        $pHours    = get_post_meta($edit_id, 'proposedHours', true);
        $pServices = get_post_meta($edit_id, 'proposedServices', true);

        if (!empty($pPhone))    update_post_meta($target_id, 'phone', $pPhone);
        if (!empty($pWeb))      update_post_meta($target_id, 'website', $pWeb);
        if (!empty($pAddr))     update_post_meta($target_id, 'address', $pAddr);
        if (!empty($pDesc))     update_post_meta($target_id, 'description', $pDesc);
        if (!empty($pHours))    update_post_meta($target_id, 'workingHours', $pHours);

        if (!empty($pServices)) {
            update_post_meta($target_id, 'services', $pServices);
            $services_arr = array_values(array_filter(array_map('trim', explode(',', $pServices))));
            update_post_meta($target_id, 'serviceOptions', wp_json_encode($services_arr));
        }
    }

    update_post_meta($edit_id, 'editStatus', 'approved');
    wp_update_post(array('ID' => $edit_id, 'post_status' => 'publish'));
    return true;
}

add_action('add_meta_boxes', 'locable_add_suggested_edit_metabox');
function locable_add_suggested_edit_metabox() {
    add_meta_box(
        'locable_approve_edit_box',
        '⚡ Locable Suggested Edit Action',
        'locable_render_suggested_edit_metabox',
        'suggested_edit',
        'normal',
        'high'
    );
}

function locable_render_suggested_edit_metabox($post) {
    $placeId   = get_post_meta($post->ID, 'placeId', true);
    $userEmail = get_post_meta($post->ID, 'userEmail', true);
    $userName  = get_post_meta($post->ID, 'userName', true);
    $status    = get_post_meta($post->ID, 'editStatus', true) ?: 'pending';

    $pPhone    = get_post_meta($post->ID, 'proposedPhone', true);
    $pWeb      = get_post_meta($post->ID, 'proposedWebsite', true);
    $pAddr     = get_post_meta($post->ID, 'proposedAddress', true);
    $pServices = get_post_meta($post->ID, 'proposedServices', true);
    $pDesc     = get_post_meta($post->ID, 'proposedDescription', true);
    $pHours    = get_post_meta($post->ID, 'proposedHours', true);

    wp_nonce_field('locable_approve_edit_action', 'locable_approve_nonce');
    ?>
    <div style="padding:10px;">
        <p><strong>Submitted By:</strong> <?php echo esc_html($userName ?: 'Guest User'); ?> (<?php echo esc_html($userEmail ?: 'N/A'); ?>)</p>
        <p><strong>Status:</strong> <span style="background:<?php echo $status === 'approved' ? '#dcfce7' : ($status === 'rejected' ? '#fee2e2' : '#fef3c7'); ?>;color:<?php echo $status === 'approved' ? '#15803d' : ($status === 'rejected' ? '#b91c1c' : '#b45309'); ?>;padding:3px 10px;border-radius:6px;font-weight:700;"><?php echo strtoupper($status); ?></span></p>

        <table class="widefat striped" style="margin-top:15px;">
            <thead>
                <tr>
                    <th>Field</th>
                    <th>Proposed Edit Value</th>
                </tr>
            </thead>
            <tbody>
                <tr><td><strong>Phone</strong></td><td><?php echo esc_html($pPhone ?: 'N/A'); ?></td></tr>
                <tr><td><strong>Website</strong></td><td><?php echo esc_html($pWeb ?: 'N/A'); ?></td></tr>
                <tr><td><strong>Address</strong></td><td><?php echo esc_html($pAddr ?: 'N/A'); ?></td></tr>
                <tr><td><strong>Services Offered</strong></td><td><?php echo esc_html($pServices ?: 'N/A'); ?></td></tr>
                <tr><td><strong>Hours</strong></td><td><?php echo esc_html($pHours ?: 'N/A'); ?></td></tr>
                <tr><td><strong>Description</strong></td><td><?php echo esc_html($pDesc ?: 'N/A'); ?></td></tr>
            </tbody>
        </table>

        <?php if ($status !== 'approved') : ?>
            <div style="margin-top:20px;">
                <input type="submit" name="locable_approve_edit_btn" class="button button-primary button-hero" value="✔ Approve & Apply Edits to Business Listing" onclick="return confirm('Approve this edit and apply proposed values to the live business listing?');" />
                <input type="submit" name="locable_reject_edit_btn" class="button button-secondary" style="color:#b91c1c;" value="✖ Reject Edit Request" />
            </div>
        <?php else : ?>
            <p style="color:#15803d;font-weight:700;margin-top:15px;">✔ These edits have been approved and applied to the live business listing!</p>
        <?php endif; ?>
    </div>
    <?php
}

add_action('save_post_suggested_edit', 'locable_handle_suggested_edit_approval');
function locable_handle_suggested_edit_approval($post_id) {
    if (!isset($_POST['locable_approve_nonce']) || !wp_verify_nonce($_POST['locable_approve_nonce'], 'locable_approve_edit_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if (isset($_POST['locable_approve_edit_btn'])) {
        locable_apply_suggested_edit_to_business($post_id);
    } elseif (isset($_POST['locable_reject_edit_btn'])) {
        update_post_meta($post_id, 'editStatus', 'rejected');
    }
}

// ─── 1-Click Approve / Deny / Delete Admin Table Columns for Suggested Edits ───
add_filter('manage_suggested_edit_posts_columns', 'locable_set_suggested_edit_columns');
function locable_set_suggested_edit_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'Edit Request for Business';
    $new_columns['user_info'] = 'Submitted By';
    $new_columns['proposed_details'] = 'Proposed Changes';
    $new_columns['edit_status'] = 'Status';
    $new_columns['admin_actions'] = '1-Click Admin Actions';
    $new_columns['date'] = 'Date Submitted';
    return $new_columns;
}

add_action('manage_suggested_edit_posts_custom_column', 'locable_render_suggested_edit_columns', 10, 2);
function locable_render_suggested_edit_columns($column, $post_id) {
    $userName  = get_post_meta($post_id, 'userName', true);
    $userEmail = get_post_meta($post_id, 'userEmail', true);
    $status    = get_post_meta($post_id, 'editStatus', true) ?: 'pending';

    $pPhone    = get_post_meta($post_id, 'proposedPhone', true);
    $pWeb      = get_post_meta($post_id, 'proposedWebsite', true);
    $pAddr     = get_post_meta($post_id, 'proposedAddress', true);
    $pServices = get_post_meta($post_id, 'proposedServices', true);

    if ($column === 'user_info') {
        echo '<strong>' . esc_html($userName ?: 'User') . '</strong><br><span style="color:#64748b;font-size:12px;">' . esc_html($userEmail) . '</span>';
    } elseif ($column === 'proposed_details') {
        echo '<div style="font-size:12px;color:#334155;line-height:1.4;">';
        if ($pPhone)    echo '<div><strong>Phone:</strong> ' . esc_html($pPhone) . '</div>';
        if ($pWeb)      echo '<div><strong>Web:</strong> ' . esc_html($pWeb) . '</div>';
        if ($pAddr)     echo '<div><strong>Addr:</strong> ' . esc_html($pAddr) . '</div>';
        if ($pServices) echo '<div><strong>Services:</strong> ' . esc_html($pServices) . '</div>';
        if (!$pPhone && !$pWeb && !$pAddr && !$pServices) echo '<em>General updates</em>';
        echo '</div>';
    } elseif ($column === 'edit_status') {
        $bg = $status === 'approved' ? '#dcfce7' : ($status === 'rejected' ? '#fee2e2' : '#fef3c7');
        $color = $status === 'approved' ? '#15803d' : ($status === 'rejected' ? '#b91c1c' : '#b45309');
        echo '<span style="background:' . $bg . ';color:' . $color . ';padding:4px 10px;border-radius:12px;font-weight:700;font-size:11px;display:inline-block;">' . strtoupper($status) . '</span>';
    } elseif ($column === 'admin_actions') {
        $approve_url = wp_nonce_url(admin_url('admin.php?action=locable_quick_edit_status&status=approved&post_id=' . $post_id), 'locable_edit_action_' . $post_id);
        $reject_url  = wp_nonce_url(admin_url('admin.php?action=locable_quick_edit_status&status=rejected&post_id=' . $post_id), 'locable_edit_action_' . $post_id);
        $delete_url  = get_delete_post_link($post_id, '', true);

        echo '<div style="display:flex;gap:6px;align-items:center;flex-wrap:nowrap;">';
        if ($status !== 'approved') {
            echo '<a href="' . esc_url($approve_url) . '" class="button button-small button-primary" style="background:#10b981;border-color:#059669;color:#ffffff;font-weight:700;">✔ Approve</a>';
        }
        if ($status !== 'rejected') {
            echo '<a href="' . esc_url($reject_url) . '" class="button button-small" style="color:#dc2626;border-color:#fca5a5;font-weight:600;">✖ Deny</a>';
        }
        if ($delete_url) {
            echo '<a href="' . esc_url($delete_url) . '" class="button button-small" style="color:#64748b;font-weight:600;" onclick="return confirm(\'Delete this edit suggestion?\');">🗑 Delete</a>';
        }
        echo '</div>';
    }
}

// ── 1-Click Action Handler for Edit Suggestions ──
add_action('admin_action_locable_quick_edit_status', 'locable_handle_quick_edit_status');
function locable_handle_quick_edit_status() {
    $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
    $status  = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';

    if ($post_id && check_admin_referer('locable_edit_action_' . $post_id)) {
        if ($status === 'approved') {
            locable_apply_suggested_edit_to_business($post_id);
        } elseif ($status === 'rejected') {
            update_post_meta($post_id, 'editStatus', 'rejected');
        }
    }
    wp_safe_redirect(admin_url('edit.php?post_type=suggested_edit'));
    exit;
}

// ─── 11. Registered User WP Admin Approval Box ─────────────────────────────
add_action('add_meta_boxes', 'locable_add_user_approval_metabox');
function locable_add_user_approval_metabox() {
    add_meta_box(
        'locable_approve_user_box',
        '⚡ Locable User Account Status',
        'locable_render_user_approval_metabox',
        'directory_user',
        'normal',
        'high'
    );
}

function locable_render_user_approval_metabox($post) {
    $name   = get_post_meta($post->ID, 'name', true);
    $email  = get_post_meta($post->ID, 'email', true);
    $status = get_post_meta($post->ID, 'accountStatus', true) ?: 'pending';
    $delete_url = get_delete_post_link($post->ID, '', true);

    wp_nonce_field('locable_approve_user_action', 'locable_user_approve_nonce');
    ?>
    <div style="padding:10px;">
        <p style="font-size:14px;"><strong>Full Name:</strong> <?php echo esc_html($name ?: $post->post_title); ?></p>
        <p style="font-size:14px;"><strong>Email Address:</strong> <?php echo esc_html($email); ?></p>
        <p style="font-size:14px;"><strong>Account Status:</strong> 
            <span style="background:<?php echo $status === 'approved' ? '#dcfce7' : ($status === 'rejected' ? '#fee2e2' : '#fef3c7'); ?>;color:<?php echo $status === 'approved' ? '#15803d' : ($status === 'rejected' ? '#b91c1c' : '#b45309'); ?>;padding:4px 12px;border-radius:6px;font-weight:700;">
                <?php echo strtoupper($status); ?>
            </span>
        </p>

        <div style="margin-top:20px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <input type="submit" name="locable_approve_user_btn" class="button button-primary button-hero" style="background:#10b981;border-color:#059669;" value="✔ Approve User Account" onclick="return confirm('Approve this user account?');" />
            <input type="submit" name="locable_reject_user_btn" class="button button-secondary button-hero" style="color:#b91c1c;border-color:#fca5a5;" value="✖ Deny / Reject Account" onclick="return confirm('Deny/Reject this user account?');" />
            <?php if ($delete_url) : ?>
                <a href="<?php echo esc_url($delete_url); ?>" class="button button-secondary button-hero" style="color:#64748b;" onclick="return confirm('Delete this user account permanently?');">🗑 Delete Account</a>
            <?php endif; ?>
        </div>
    </div>
    <?php
}

add_action('save_post_directory_user', 'locable_handle_user_approval');
function locable_handle_user_approval($post_id) {
    if (!isset($_POST['locable_user_approve_nonce']) || !wp_verify_nonce($_POST['locable_user_approve_nonce'], 'locable_approve_user_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if (isset($_POST['locable_approve_user_btn'])) {
        update_post_meta($post_id, 'accountStatus', 'approved');
        wp_update_post(array('ID' => $post_id, 'post_status' => 'publish'));
    } elseif (isset($_POST['locable_reject_user_btn'])) {
        update_post_meta($post_id, 'accountStatus', 'rejected');
    }
}

// ─── 11b. 1-Click Approve / Deny / Delete Admin Table Columns ───────────────────
add_filter('manage_directory_user_posts_columns', 'locable_set_directory_user_columns');
function locable_set_directory_user_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'User Account';
    $new_columns['user_email'] = 'Email Address';
    $new_columns['account_status'] = 'Account Status';
    $new_columns['approval_actions'] = '1-Click Admin Actions';
    $new_columns['date'] = 'Registered Date';
    return $new_columns;
}

add_action('manage_directory_user_posts_custom_column', 'locable_render_directory_user_columns', 10, 2);
function locable_render_directory_user_columns($column, $post_id) {
    $email  = get_post_meta($post_id, 'email', true);
    $status = get_post_meta($post_id, 'accountStatus', true) ?: 'pending';

    if ($column === 'user_email') {
        echo '<strong>' . esc_html($email) . '</strong>';
    } elseif ($column === 'account_status') {
        $bg = $status === 'approved' ? '#dcfce7' : ($status === 'rejected' ? '#fee2e2' : '#fef3c7');
        $color = $status === 'approved' ? '#15803d' : ($status === 'rejected' ? '#b91c1c' : '#b45309');
        echo '<span style="background:' . $bg . ';color:' . $color . ';padding:4px 12px;border-radius:12px;font-weight:700;font-size:12px;display:inline-block;">' . strtoupper($status) . '</span>';
    } elseif ($column === 'approval_actions') {
        $approve_url = wp_nonce_url(admin_url('admin.php?action=locable_quick_user_status&status=approved&post_id=' . $post_id), 'locable_user_action_' . $post_id);
        $reject_url  = wp_nonce_url(admin_url('admin.php?action=locable_quick_user_status&status=rejected&post_id=' . $post_id), 'locable_user_action_' . $post_id);
        $delete_url  = get_delete_post_link($post_id, '', true);

        echo '<div style="display:flex;gap:6px;align-items:center;">';
        if ($status !== 'approved') {
            echo '<a href="' . esc_url($approve_url) . '" class="button button-small button-primary" style="background:#10b981;border-color:#059669;color:#ffffff;font-weight:700;">✔ Approve</a>';
        }
        if ($status !== 'rejected') {
            echo '<a href="' . esc_url($reject_url) . '" class="button button-small" style="color:#dc2626;border-color:#fca5a5;font-weight:600;">✖ Deny</a>';
        }
        if ($delete_url) {
            echo '<a href="' . esc_url($delete_url) . '" class="button button-small" style="color:#64748b;font-weight:600;" onclick="return confirm(\'Delete this user account?\');">🗑 Delete</a>';
        }
        echo '</div>';
    }
}

// ── 1-Click Action Handler ──
add_action('admin_action_locable_quick_user_status', 'locable_handle_quick_user_status');
function locable_handle_quick_user_status() {
    $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
    $status  = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';

    if ($post_id && check_admin_referer('locable_user_action_' . $post_id)) {
        if (in_array($status, array('approved', 'rejected'))) {
            update_post_meta($post_id, 'accountStatus', $status);
            if ($status === 'approved') {
                wp_update_post(array('ID' => $post_id, 'post_status' => 'publish'));
            }
        }
    }
    wp_safe_redirect(admin_url('edit.php?post_type=directory_user'));
    exit;
}

// ─── 12. Public REST Routes for User Registration, Edits & Listings ─────────────
add_action('rest_api_init', 'locable_register_public_rest_routes');

function locable_register_public_rest_routes() {
    register_rest_route('locable/v1', '/register-user', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_register_user',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/suggest-edit', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_suggest_edit',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/submit-listing', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_submit_listing',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/upload-media', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_upload_media',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/change-password', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_change_password',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/test-email', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_test_email',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/send-verification-email', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_send_verification_email',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/verify-email', array(
        'methods'             => 'POST',
        'callback'            => 'locable_rest_verify_email',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('locable/v1', '/user-status', array(
        'methods'             => 'GET',
        'callback'            => 'locable_rest_get_user_status',
        'permission_callback' => '__return_true',
    ));
}

function locable_rest_upload_media($request) {
    if (empty($_FILES['file'])) {
        return new WP_Error('no_file', 'No image file provided for upload.', array('status' => 400));
    }

    $user_email = sanitize_email($_POST['userEmail'] ?? 'guest');
    $image_type = sanitize_text_field($_POST['imageType'] ?? 'general');
    $email_slug = sanitize_title(str_replace('@', '-at-', $user_email));

    require_once(ABSPATH . 'wp-admin/includes/image.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/media.php');

    $upload_dir_callback = function($param) use ($email_slug) {
        $param['subdir'] = '/directory_users/' . ($email_slug ?: 'general');
        $param['path']   = $param['basedir'] . $param['subdir'];
        $param['url']    = $param['baseurl'] . $param['subdir'];
        if (!file_exists($param['path'])) {
            wp_mkdir_p($param['path']);
        }
        return $param;
    };

    add_filter('upload_dir', $upload_dir_callback);
    $file_return = wp_handle_upload($_FILES['file'], array('test_form' => false));

    if (isset($file_return['error'])) {
        remove_filter('upload_dir', $upload_dir_callback);
        return new WP_Error('upload_failed', $file_return['error'], array('status' => 500));
    }

    $filename = $file_return['file'];
    $attachment = array(
        'post_mime_type' => $file_return['type'],
        'post_title'     => preg_replace('/\.[^.]+$/', '', basename($filename)),
        'post_content'   => '',
        'post_status'    => 'inherit'
    );

    $attachment_id = wp_insert_attachment($attachment, $filename);
    $attach_data   = wp_generate_attachment_metadata($attachment_id, $filename);
    wp_update_attachment_metadata($attachment_id, $attach_data);
    remove_filter('upload_dir', $upload_dir_callback);

    update_post_meta($attachment_id, 'uploaded_by_email', $user_email);
    update_post_meta($attachment_id, 'locable_image_type', $image_type);

    return array(
        'success'       => true,
        'attachment_id' => $attachment_id,
        'url'           => $file_return['url'],
        'file'          => basename($filename),
        'mime_type'     => $file_return['type'],
    );
}

// ── Public REST Routes for Reviews ──
add_action('rest_api_init', function() {
    register_rest_route('locable/v1', '/submit-review', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'locable_rest_submit_review',
    ));
    register_rest_route('locable/v1', '/reviews', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'locable_rest_get_reviews',
    ));
});

function locable_rest_submit_review($request) {
    $params = $request->get_json_params();
    $businessPlaceId = sanitize_text_field($params['businessPlaceId'] ?? $params['businessId'] ?? '');
    $businessSlug    = sanitize_text_field($params['businessSlug'] ?? '');
    $reviewerName    = sanitize_text_field($params['reviewerName'] ?? 'Guest User');
    $reviewerEmail   = sanitize_email($params['reviewerEmail'] ?? '');
    $rating          = floatval($params['rating'] ?? 5);
    $title           = sanitize_text_field($params['title'] ?? 'Customer Review');
    $comment         = sanitize_textarea_field($params['comment'] ?? '');

    if (empty($comment)) {
        return new WP_Error('missing_comment', 'Comment is required', array('status' => 400));
    }

    $post_id = wp_insert_post(array(
        'post_title'   => $title . ' - ' . $reviewerName,
        'post_content' => $comment,
        'post_type'    => 'business_review',
        'post_status'  => 'publish',
    ));

    if (is_wp_error($post_id)) return $post_id;

    update_post_meta($post_id, 'businessPlaceId', $businessPlaceId);
    update_post_meta($post_id, 'businessSlug', $businessSlug);
    update_post_meta($post_id, 'reviewerName', $reviewerName);
    update_post_meta($post_id, 'reviewerEmail', $reviewerEmail);
    update_post_meta($post_id, 'rating', $rating);
    update_post_meta($post_id, 'title', $title);
    update_post_meta($post_id, 'comment', $comment);
    update_post_meta($post_id, 'status', 'approved');
    update_post_meta($post_id, 'source', 'locable');
    update_post_meta($post_id, 'helpfulCount', 0);
    update_post_meta($post_id, 'date', current_time('mysql'));

    // Recalculate and update target business_listing post meta rating and reviews
    if (!empty($businessPlaceId)) {
        $target = get_posts(array(
            'post_type'      => 'business_listing',
            'meta_key'       => 'placeId',
            'meta_value'     => $businessPlaceId,
            'posts_per_page' => 1,
            'post_status'    => 'any',
        ));
        if (!empty($target)) {
            $target_id = $target[0]->ID;
            $all_reviews = get_posts(array(
                'post_type'      => 'business_review',
                'meta_key'       => 'businessPlaceId',
                'meta_value'     => $businessPlaceId,
                'posts_per_page' => 100,
                'post_status'    => 'any',
            ));
            $total_reviews = count($all_reviews);
            $sum_rating = 0;
            foreach ($all_reviews as $r) {
                $r_rating = floatval(get_post_meta($r->ID, 'rating', true) ?: 5);
                $sum_rating += $r_rating;
            }
            $avg_rating = $total_reviews > 0 ? round($sum_rating / $total_reviews, 1) : 5.0;
            update_post_meta($target_id, 'rating', $avg_rating);
            update_post_meta($target_id, 'reviews', $total_reviews);
        }
    }

    $review_obj = array(
        'id'               => 'locable-' . $post_id,
        'businessPlaceId'  => $businessPlaceId,
        'businessSlug'     => $businessSlug,
        'reviewerName'     => $reviewerName,
        'rating'           => $rating,
        'title'            => $title,
        'comment'          => $comment,
        'date'             => current_time('Y-m-d'),
        'verifiedCustomer' => true,
        'helpfulCount'     => 0,
        'status'           => 'approved',
        'source'           => 'locable',
    );

    return array('success' => true, 'message' => 'Review published successfully!', 'review' => $review_obj);
}

function locable_rest_get_reviews($request) {
    $placeId = sanitize_text_field($request->get_param('placeId') ?? $request->get_param('businessId') ?? '');
    $slug    = sanitize_text_field($request->get_param('slug') ?? '');

    $meta_query = array('relation' => 'OR');
    if (!empty($placeId)) {
        $meta_query[] = array('key' => 'businessPlaceId', 'value' => $placeId);
    }
    if (!empty($slug)) {
        $meta_query[] = array('key' => 'businessSlug', 'value' => $slug);
    }

    if (count($meta_query) === 1) {
        return array('reviews' => array());
    }

    $posts = get_posts(array(
        'post_type'      => 'business_review',
        'post_status'    => 'any',
        'meta_query'     => $meta_query,
        'posts_per_page' => 100,
    ));

    $reviews = array();
    foreach ($posts as $p) {
        $meta = get_post_meta($p->ID);
        $reviews[] = array(
            'id'               => 'locable-' . $p->ID,
            'businessPlaceId'  => (string)($meta['businessPlaceId'][0] ?? ''),
            'businessSlug'     => (string)($meta['businessSlug'][0] ?? ''),
            'reviewerName'     => (string)($meta['reviewerName'][0] ?? 'Verified Customer'),
            'rating'           => floatval($meta['rating'][0] ?? 5),
            'title'            => (string)($meta['title'][0] ?? $p->post_title),
            'comment'          => (string)($meta['comment'][0] ?? $p->post_content),
            'date'             => $p->post_date,
            'verifiedCustomer' => true,
            'helpfulCount'     => intval($meta['helpfulCount'][0] ?? 0),
            'status'           => 'approved',
            'source'           => 'locable',
        );
    }

    return array('reviews' => $reviews);
}

// ── Custom Admin Columns for Business Reviews ──
add_filter('manage_business_review_posts_columns', 'locable_set_business_review_columns');
function locable_set_business_review_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'Review Title';
    $new_columns['business'] = 'Business Place ID';
    $new_columns['reviewer'] = 'Reviewer Info';
    $new_columns['rating_val'] = 'Rating';
    $new_columns['date'] = 'Date Submitted';
    return $new_columns;
}

add_action('manage_business_review_posts_custom_column', 'locable_render_business_review_columns', 10, 2);
function locable_render_business_review_columns($column, $post_id) {
    $placeId  = get_post_meta($post_id, 'businessPlaceId', true);
    $name     = get_post_meta($post_id, 'reviewerName', true);
    $email    = get_post_meta($post_id, 'reviewerEmail', true);
    $rating   = get_post_meta($post_id, 'rating', true) ?: 5;

    if ($column === 'business') {
        echo '<code>' . esc_html($placeId) . '</code>';
    } elseif ($column === 'reviewer') {
        echo '<strong>' . esc_html($name) . '</strong><br><span style="color:#64748b;font-size:12px;">' . esc_html($email) . '</span>';
    } elseif ($column === 'rating_val') {
        echo '<span style="color:#eab308;font-weight:800;">★ ' . esc_html($rating) . ' / 5</span>';
    }
}

function locable_rest_register_user($request) {
    $params   = $request->get_json_params();
    $name     = sanitize_text_field($params['name'] ?? '');
    $email    = sanitize_email($params['email'] ?? '');
    $password = $params['password'] ?? '';

    if (empty($email)) {
        return new WP_Error('missing_email', 'Email is required', array('status' => 400));
    }

    // 1. Create or sync Real WordPress User Account in wp_users
    $wp_user = get_user_by('email', $email);
    if (!$wp_user) {
        $username = sanitize_user(current(explode('@', $email)) . '_' . wp_rand(100, 999));
        $pass_to_set = !empty($password) ? $password : wp_generate_password(12, true);
        
        $user_id = wp_insert_user(array(
            'user_login'    => $username,
            'user_pass'     => $pass_to_set,
            'user_email'    => $email,
            'display_name'  => $name ?: $username,
            'first_name'    => $name,
            'role'          => 'directory_user',
        ));
    } else {
        $user_id = $wp_user->ID;
        if (!empty($password)) {
            wp_set_password($password, $user_id);
        }
    }

    // 2. Create or sync CPT directory_user post for Directory admin management
    $existing = get_posts(array(
        'post_type'      => 'directory_user',
        'meta_key'       => 'email',
        'meta_value'     => $email,
        'post_status'    => 'any',
        'posts_per_page' => 1,
    ));

    if (!empty($existing)) {
        $id = $existing[0]->ID;
        $status = get_post_meta($id, 'accountStatus', true) ?: 'pending';
        return array(
            'id'            => $id,
            'wp_user_id'    => $wp_user ? $wp_user->ID : 0,
            'name'          => get_post_meta($id, 'name', true) ?: $name,
            'email'         => $email,
            'accountStatus' => $status,
        );
    }

    $post_id = wp_insert_post(array(
        'post_title'  => ($name ?: $email) . " ($email)",
        'post_type'   => 'directory_user',
        'post_status' => 'publish',
    ));

    if (is_wp_error($post_id)) {
        return $post_id;
    }

    update_post_meta($post_id, 'name', $name);
    update_post_meta($post_id, 'email', $email);
    update_post_meta($post_id, 'accountStatus', 'pending');

    return array(
        'id'            => $post_id,
        'wp_user_id'    => isset($user_id) && !is_wp_error($user_id) ? $user_id : 0,
        'name'          => $name,
        'email'         => $email,
        'accountStatus' => 'pending',
    );
}

function locable_rest_change_password($request) {
    $params   = $request->get_json_params();
    $email    = sanitize_email($params['email'] ?? '');
    $oldPass  = $params['oldPassword'] ?? '';
    $newPass  = $params['newPassword'] ?? '';

    if (empty($email) || empty($newPass)) {
        return new WP_Error('missing_fields', 'Email and new password are required.', array('status' => 400));
    }

    $wp_user = get_user_by('email', $email);
    if (!$wp_user) {
        return new WP_Error('user_not_found', 'WordPress user account not found.', array('status' => 404));
    }

    if (!empty($oldPass) && !wp_check_password($oldPass, $wp_user->user_pass, $wp_user->ID)) {
        return new WP_Error('invalid_password', 'Current password is incorrect.', array('status' => 400));
    }

    wp_set_password($newPass, $wp_user->ID);

    return array(
        'success' => true,
        'message' => 'Password changed successfully in WordPress!'
    );
}

function locable_rest_test_email($request) {
    $params  = $request->get_json_params();
    $toEmail = sanitize_email($params['to'] ?? get_option('admin_email'));

    if (empty($toEmail)) {
        return new WP_Error('missing_email', 'Destination email address required.', array('status' => 400));
    }

    $subject = 'Locable Directory - SendGrid SMTP Test Email';
    $message = '<html><body><h2>Locable Directory Email Test</h2><p>Hello! This is a test email sent from Locable Directory via WordPress <code>wp_mail()</code> and your SendGrid SMTP plugin setup.</p><p>If you see this email, your SendGrid SMTP is configured and working perfectly!</p></body></html>';
    $headers = array('Content-Type: text/html; charset=UTF-8');

    $mail_error = null;
    $error_catcher = function($wp_error) use (&$mail_error) {
        $mail_error = $wp_error;
    };
    add_action('wp_mail_failed', $error_catcher);

    $sent = wp_mail($toEmail, $subject, $message, $headers);
    remove_action('wp_mail_failed', $error_catcher);

    if ($sent) {
        return array(
            'success' => true,
            'message' => "Test email successfully sent to $toEmail via SendGrid SMTP!",
        );
    } else {
        $error_msg = 'wp_mail() returned false.';
        if (is_wp_error($mail_error)) {
            $error_msg = $mail_error->get_error_message();
        }
        return new WP_Error('email_failed', "Failed to send email: $error_msg", array('status' => 500));
    }
}

function locable_rest_send_verification_email($request) {
    $params   = $request->get_json_params();
    $name     = sanitize_text_field($params['name'] ?? '');
    $email    = sanitize_email($params['email'] ?? '');
    $password = $params['password'] ?? '';

    if (empty($email) || empty($name)) {
        return new WP_Error('missing_fields', 'Name and email are required.', array('status' => 400));
    }

    // Check if user is ALREADY verified and registered in WP
    $existing_user = get_user_by('email', $email);
    if ($existing_user) {
        return new WP_Error('user_exists', 'An account with this email address already exists. Please login.', array('status' => 400));
    }

    // Generate 6-Digit PIN & Expiration (24 Hours)
    $pin      = sprintf('%06d', rand(100000, 999999));
    $token    = md5($email . $pin . 'locable_secret_salt_' . time());
    $expires  = time() + 86400; // 24 hours

    $verification_data = array(
        'name'     => $name,
        'email'    => $email,
        'password' => $password,
        'pin'      => $pin,
        'token'    => $token,
        'expires'  => $expires,
    );

    $option_key = '_locable_verify_' . md5($email);
    update_option($option_key, $verification_data, false);

    // Build Verification Link (Frontend URL)
    $site_url = 'http://localhost:3000';
    $verify_link = $site_url . '/verify-email?email=' . urlencode($email) . '&token=' . $token;

    // Send Verification Email via SendGrid SMTP
    $subject = "Verify Your Email Address - LocalNest Directory";
    $message = '
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.04); }
        .logo { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 24px; }
        .pin-box { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #FF5B3E; background: #FFF0ED; padding: 16px 28px; border-radius: 14px; text-align: center; margin: 24px 0; border: 1px solid #ffccd5; }
        .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 16px 0; text-align: center; }
        .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏠 LocalNest Business Directory</div>
        <h2 style="margin-top:0; font-size:20px; color:#0f172a;">Confirm Your Registration</h2>
        <p style="font-size:15px; color:#475569; line-height:1.6;">Hi <strong>' . esc_html($name) . '</strong>,</p>
        <p style="font-size:15px; color:#475569; line-height:1.6;">Thank you for registering your business account. Please enter the 6-digit verification PIN below or click the verification button to confirm your email address:</p>
        
        <div class="pin-box">' . $pin . '</div>

        <div style="text-align: center;">
          <a href="' . esc_url($verify_link) . '" class="btn">Click Here to Verify Email</a>
        </div>

        <p style="font-size:13px; color:#64748b; margin-top: 20px;">Once verified, your account will be submitted for admin approval in WordPress.</p>

        <div class="footer">
          LocalNest Directory Marketplace &bull; San Diego, CA
        </div>
      </div>
    </body>
    </html>';

    $headers = array('Content-Type: text/html; charset=UTF-8');

    $sent = wp_mail($email, $subject, $message, $headers);

    return array(
        'success' => true,
        'message' => "Verification code sent to $email via SendGrid SMTP",
        'requiresVerification' => true,
        'email' => $email,
        'sent' => $sent
    );
}

function locable_rest_verify_email($request) {
    $params = $request->get_json_params();
    $email  = sanitize_email($params['email'] ?? '');
    $pin    = trim($params['pin'] ?? '');
    $token  = trim($params['token'] ?? '');

    if (empty($email)) {
        return new WP_Error('missing_email', 'Email address is required for verification.', array('status' => 400));
    }

    $option_key = '_locable_verify_' . md5($email);
    $data = get_option($option_key);

    if (!$data || !is_array($data)) {
        return new WP_Error('invalid_code', 'No pending registration found for this email address or verification expired. Please register again.', array('status' => 400));
    }

    if (time() > $data['expires']) {
        delete_option($option_key);
        return new WP_Error('code_expired', 'Verification code has expired (24h limit). Please register again.', array('status' => 400));
    }

    $is_pin_match   = !empty($pin) && $pin === $data['pin'];
    $is_token_match = !empty($token) && $token === $data['token'];

    if (!$is_pin_match && !$is_token_match) {
        return new WP_Error('wrong_code', 'Invalid 6-digit verification code or token. Please check your email.', array('status' => 400));
    }

    $name     = $data['name'];
    $password = $data['password'];
    $username = sanitize_user(str_replace('@', '_', $email));

    $wp_user = get_user_by('email', $email);
    if (!$wp_user) {
        $user_id = wp_insert_user(array(
            'user_login'    => $username,
            'user_pass'     => $password ?: wp_generate_password(12, true),
            'user_email'    => $email,
            'display_name'  => $name ?: $username,
            'first_name'    => $name,
            'role'          => 'directory_user',
        ));
    } else {
        $user_id = $wp_user->ID;
        if (!empty($password)) {
            wp_set_password($password, $user_id);
        }
    }

    $existing_cpt = get_posts(array(
        'post_type'      => 'directory_user',
        'meta_key'       => 'email',
        'meta_value'     => $email,
        'post_status'    => 'any',
        'posts_per_page' => 1,
    ));

    if (!empty($existing_cpt)) {
        $cpt_id = $existing_cpt[0]->ID;
    } else {
        $cpt_id = wp_insert_post(array(
            'post_title'  => ($name ?: $email) . " ($email)",
            'post_type'   => 'directory_user',
            'post_status' => 'publish',
        ));
    }

    if (!is_wp_error($cpt_id)) {
        update_post_meta($cpt_id, 'name', $name);
        update_post_meta($cpt_id, 'email', $email);
        update_post_meta($cpt_id, 'accountStatus', 'pending');
        update_post_meta($cpt_id, 'emailVerified', 'true');
        update_post_meta($cpt_id, 'verifiedAt', current_time('mysql'));
    }

    delete_option($option_key);

    $admin_email = get_option('admin_email');
    if ($admin_email) {
        $admin_sub = "New User Registration Pending Approval: $name";
        $admin_msg = "Hello Admin,\n\nNew user '$name' ($email) has verified their email address and registered on LocalNest Directory.\n\nAccount Status: Pending Approval\nRole: Directory Business Owner (directory_user)\n\nPlease log in to WP-Admin -> Users or Directory Users to review and approve this account.\n";
        wp_mail($admin_email, $admin_sub, $admin_msg);
    }

    return array(
        'success'       => true,
        'message'       => 'Email verified successfully! Account submitted for WP-Admin approval.',
        'user'          => array(
            'id'            => (string)$cpt_id,
            'wp_user_id'    => is_numeric($user_id) ? $user_id : 0,
            'name'          => $name,
            'email'         => $email,
            'accountStatus' => 'pending',
            'emailVerified' => true,
        )
    );
}

function locable_rest_get_user_status($request) {
    $email = sanitize_email($request->get_param('email'));

    if (empty($email)) {
        return new WP_Error('missing_email', 'Email parameter required.', array('status' => 400));
    }

    $status = 'pending';
    $name   = '';
    $id     = 0;

    $existing_cpt = get_posts(array(
        'post_type'      => 'directory_user',
        'meta_key'       => 'email',
        'meta_value'     => $email,
        'post_status'    => 'any',
        'posts_per_page' => 1,
    ));

    if (!empty($existing_cpt)) {
        $cpt    = $existing_cpt[0];
        $id     = $cpt->ID;
        $status = get_post_meta($id, 'accountStatus', true) ?: 'pending';
        $name   = get_post_meta($id, 'name', true) ?: $cpt->post_title;
    } else {
        $wp_user = get_user_by('email', $email);
        if ($wp_user) {
            $name   = $wp_user->display_name ?: $wp_user->first_name;
            $status = 'approved';
        }
    }

    return array(
        'success'       => true,
        'email'         => $email,
        'name'          => $name,
        'accountStatus' => $status,
    );
}

function locable_rest_suggest_edit($request) {
    $params = $request->get_json_params();
    $placeId       = sanitize_text_field($params['placeId'] ?? '');
    $businessTitle = sanitize_text_field($params['businessTitle'] ?? 'Business Listing');
    $userEmail     = sanitize_email($params['userEmail'] ?? '');
    $userName      = sanitize_text_field($params['userName'] ?? '');

    $post_id = wp_insert_post(array(
        'post_title'  => "Suggest Edit: $businessTitle (by " . ($userName ?: $userEmail) . ")",
        'post_type'   => 'suggested_edit',
        'post_status' => 'publish',
    ));

    if (is_wp_error($post_id)) return $post_id;

    update_post_meta($post_id, 'placeId', $placeId);
    update_post_meta($post_id, 'businessTitle', $businessTitle);
    update_post_meta($post_id, 'userEmail', $userEmail);
    update_post_meta($post_id, 'userName', $userName);
    update_post_meta($post_id, 'proposedPhone', sanitize_text_field($params['proposedPhone'] ?? ''));
    update_post_meta($post_id, 'proposedWebsite', esc_url_raw($params['proposedWebsite'] ?? ''));
    update_post_meta($post_id, 'proposedAddress', sanitize_text_field($params['proposedAddress'] ?? ''));
    update_post_meta($post_id, 'proposedServices', sanitize_text_field($params['proposedServices'] ?? ''));
    update_post_meta($post_id, 'proposedDescription', sanitize_textarea_field($params['proposedDescription'] ?? ''));
    update_post_meta($post_id, 'proposedHours', sanitize_textarea_field($params['proposedHours'] ?? ''));
    update_post_meta($post_id, 'editStatus', 'pending');

    return array('success' => true, 'id' => $post_id);
}

function locable_rest_submit_listing($request) {
    $params = $request->get_json_params();
    $title     = sanitize_text_field($params['title'] ?? '');
    $userEmail = sanitize_email($params['userEmail'] ?? '');
    $city      = sanitize_text_field($params['city'] ?? 'San Diego');
    $type      = sanitize_text_field($params['type'] ?? 'General');
    $address   = sanitize_text_field($params['address'] ?? '');
    $phone       = sanitize_text_field($params['phone'] ?? '');
    $website     = sanitize_text_field($params['website'] ?? '');
    $description = sanitize_textarea_field($params['description'] ?? '');

    // Server-Side Strict Field Validations
    if (empty($title) || strlen($title) < 3) {
        return new WP_Error('invalid_title', 'Business Name must be at least 3 characters.', array('status' => 400));
    }
    if (empty($type)) {
        return new WP_Error('invalid_type', 'Please select a business category.', array('status' => 400));
    }
    if (empty($address) || strlen($address) < 4) {
        return new WP_Error('invalid_address', 'Please enter a valid street address.', array('status' => 400));
    }
    if (empty($zip) || !preg_match('/^\d{5}$/', $zip)) {
        return new WP_Error('invalid_zip', 'Enter a valid 5-digit ZIP code (e.g. 92101).', array('status' => 400));
    }

    if (!empty($phone)) {
        $clean_digits = preg_replace('/[^\d]/', '', $phone);
        if (strlen($clean_digits) < 10 || strlen($clean_digits) > 15) {
            return new WP_Error('invalid_phone', 'Enter a valid 10-digit phone number (e.g. (619) 555-0199).', array('status' => 400));
        }
    }

    if (!empty($website)) {
        if (!preg_match('/^https?:\/\//i', $website)) {
            $website = 'https://' . $website;
        }
        if (!filter_var($website, FILTER_VALIDATE_URL)) {
            return new WP_Error('invalid_website', 'Enter a valid website URL (e.g. https://mybusiness.com).', array('status' => 400));
        }
    }

    if (empty($description) || strlen($description) < 15) {
        return new WP_Error('invalid_description', 'Business description must be at least 15 characters long.', array('status' => 400));
    }

    $post_id = wp_insert_post(array(
        'post_title'   => $title,
        'post_content' => sanitize_textarea_field($params['description'] ?? ''),
        'post_type'    => 'business_listing',
        'post_status'  => 'pending',
    ));

    if (is_wp_error($post_id)) return $post_id;

    $user_google_id = sanitize_text_field($params['googlePlaceId'] ?? $params['googleMapsUrl'] ?? '');
    $placeId = 'chij_user_' . $post_id;

    if (!empty($user_google_id)) {
        if (preg_match('/ChIJ[a-zA-Z0-9_-]+/', $user_google_id, $m)) {
            $placeId = $m[0];
        }
    }

    $api_key = 'AIzaSyAusNwdN9zPqXJ_doW_M4mbdrhtJkZkdpU';
    $g_rating  = 5.0;
    $g_reviews = 1;
    $gmaps_found = false;

    // 1. If user provided a real Google Place ID (ChIJ...) or link
    if (strpos($placeId, 'ChIJ') === 0) {
        $details_url = "https://maps.googleapis.com/maps/api/place/details/json?place_id={$placeId}&fields=rating,user_ratings_total,geometry,place_id&key={$api_key}";
        $g_res = wp_remote_get($details_url);
        if (!is_wp_error($g_res) && wp_remote_retrieve_response_code($g_res) === 200) {
            $g_data = json_decode(wp_remote_retrieve_body($g_res), true);
            if (!empty($g_data['result'])) {
                $g_rating    = floatval($g_data['result']['rating'] ?? 5.0);
                $g_reviews   = intval($g_data['result']['user_ratings_total'] ?? 1);
                $gmaps_found = true;
            }
        }
    }

    // 2. Auto-detect Google Place ID if not manually provided or if place details failed
    if (!$gmaps_found) {
        $search_query = urlencode(trim("$title $address $city $state"));
        $g_res = wp_remote_get("https://maps.googleapis.com/maps/api/place/textsearch/json?query={$search_query}&key={$api_key}");

        if (!is_wp_error($g_res) && wp_remote_retrieve_response_code($g_res) === 200) {
            $g_data = json_decode(wp_remote_retrieve_body($g_res), true);
            if (!empty($g_data['results'][0]['place_id'])) {
                $placeId     = $g_data['results'][0]['place_id'];
                $g_rating    = floatval($g_data['results'][0]['rating'] ?? 5.0);
                $g_reviews   = intval($g_data['results'][0]['user_ratings_total'] ?? 1);
                $gmaps_found = true;
            }
        }
    }

    $thumbnail = esc_url_raw($params['thumbnail'] ?? '');
    $coverImage = esc_url_raw($params['coverImage'] ?? $thumbnail);

    $full_address = trim("$address, $city, $state $zip");
    $maps_url = "https://maps.google.com/maps?q=" . urlencode($full_address) . "&output=embed";

    update_post_meta($post_id, 'placeId', $placeId);
    update_post_meta($post_id, 'userEmail', $userEmail);
    update_post_meta($post_id, 'title', $title);
    update_post_meta($post_id, 'type', $type);
    update_post_meta($post_id, 'typeSlug', sanitize_title($type));
    update_post_meta($post_id, 'city', $city);
    update_post_meta($post_id, 'citySlug', sanitize_title($city));
    update_post_meta($post_id, 'address', $address);
    update_post_meta($post_id, 'state', $state);
    update_post_meta($post_id, 'zip', $zip);
    update_post_meta($post_id, 'phone', sanitize_text_field($params['phone'] ?? ''));
    update_post_meta($post_id, 'website', esc_url_raw($params['website'] ?? ''));
    update_post_meta($post_id, 'price', sanitize_text_field($params['price'] ?? '$$'));
    update_post_meta($post_id, 'workingHours', sanitize_textarea_field($params['workingHours'] ?? ''));
    update_post_meta($post_id, 'thumbnail', $thumbnail);
    update_post_meta($post_id, 'coverImage', $coverImage);
    update_post_meta($post_id, 'description', sanitize_textarea_field($params['description'] ?? ''));
    
    $raw_services = $params['serviceOptions'] ?? $params['services'] ?? '';
    $services_arr = array();

    if (is_array($raw_services)) {
        $services_arr = array_values(array_filter(array_map('sanitize_text_field', $raw_services)));
    } elseif (is_string($raw_services) && !empty(trim($raw_services))) {
        $services_arr = array_values(array_filter(array_map('trim', explode(',', sanitize_text_field($raw_services)))));
    }

    if (!empty($services_arr)) {
        $clean_services_str = implode(', ', $services_arr);
        update_post_meta($post_id, 'serviceOptions', $clean_services_str);
        update_post_meta($post_id, 'services', $clean_services_str);
    }

    update_post_meta($post_id, 'googleMapsEmbedUrl', $maps_url);
    update_post_meta($post_id, 'latitude', '32.7157');
    update_post_meta($post_id, 'longitude', '-117.1611');
    update_post_meta($post_id, 'rating', $g_rating);
    update_post_meta($post_id, 'reviews', $g_reviews);
    update_post_meta($post_id, 'verified', 'false');

    wp_set_object_terms($post_id, $type, 'business_type', false);
    wp_set_object_terms($post_id, $city, 'business_location', false);

    // Initial Welcome Review
    wp_insert_post(array(
        'post_title'   => "Verified Owner Listing for $title",
        'post_content' => "Welcome to Locable Marketplace! $title is officially registered and open for customer reviews.",
        'post_type'    => 'business_review',
        'post_status'  => 'publish',
        'meta_input'   => array(
            'businessPlaceId' => $placeId,
            'rating'          => '5.0',
            'reviewerName'    => 'Locable Verified Badge',
            'reviewerEmail'   => $userEmail,
            'visitDate'       => current_time('Y-m-d'),
        )
    ));

    return array('success' => true, 'id' => $post_id, 'placeId' => $placeId, 'mapsUrl' => $maps_url);
}

// ─── 13. Business Listing Approval Controls & Admin Table Columns ───────────────
add_action('add_meta_boxes', 'locable_add_business_approval_metabox');
function locable_add_business_approval_metabox() {
    add_meta_box(
        'locable_approve_business_box',
        '⚡ Locable Business Approval Status',
        'locable_render_business_approval_metabox',
        'business_listing',
        'normal',
        'high'
    );
}

function locable_render_business_approval_metabox($post) {
    $title     = get_post_meta($post->ID, 'title', true) ?: $post->post_title;
    $userEmail = get_post_meta($post->ID, 'userEmail', true) ?: 'Administrator';
    $status    = $post->post_status === 'publish' ? 'published' : ($post->post_status === 'draft' ? 'rejected' : 'pending');
    $delete_url = get_delete_post_link($post->ID, '', true);

    wp_nonce_field('locable_approve_business_action', 'locable_business_approve_nonce');
    ?>
    <div style="padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <p style="font-size:14px;margin:0 0 6px;"><strong>Business Title:</strong> <?php echo esc_html($title); ?></p>
        <p style="font-size:14px;margin:0 0 6px;"><strong>Submitted By User:</strong> <?php echo esc_html($userEmail); ?></p>
        <p style="font-size:14px;margin:0 0 12px;"><strong>Current Status:</strong> 
            <span style="background:<?php echo $status === 'published' ? '#dcfce7' : ($status === 'rejected' ? '#fee2e2' : '#fef3c7'); ?>;color:<?php echo $status === 'published' ? '#15803d' : ($status === 'rejected' ? '#b91c1c' : '#b45309'); ?>;padding:4px 12px;border-radius:6px;font-weight:700;">
                <?php echo strtoupper($status === 'published' ? 'LIVE & PUBLISHED' : ($status === 'rejected' ? 'REJECTED' : 'PENDING REVIEW')); ?>
            </span>
        </p>

        <div style="margin-top:15px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <?php if ($status !== 'published') : ?>
                <input type="submit" name="locable_approve_business_btn" class="button button-primary button-hero" style="background:#10b981;border-color:#059669;" value="✔ Approve & Publish Listing Live" onclick="return confirm('Approve and publish this business listing live?');" />
            <?php endif; ?>
            <?php if ($status !== 'rejected') : ?>
                <input type="submit" name="locable_reject_business_btn" class="button button-secondary button-hero" style="color:#b91c1c;border-color:#fca5a5;" value="✖ Reject Listing" onclick="return confirm('Reject this business listing?');" />
            <?php endif; ?>
            <?php if ($delete_url) : ?>
                <a href="<?php echo esc_url($delete_url); ?>" class="button button-secondary button-hero" style="color:#64748b;" onclick="return confirm('Delete this business listing permanently?');">🗑 Delete Listing</a>
            <?php endif; ?>
        </div>
    </div>
    <?php
}

add_action('save_post_business_listing', 'locable_handle_business_approval');
function locable_handle_business_approval($post_id) {
    if (!isset($_POST['locable_business_approve_nonce']) || !wp_verify_nonce($_POST['locable_business_approve_nonce'], 'locable_approve_business_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if (isset($_POST['locable_approve_business_btn'])) {
        wp_update_post(array('ID' => $post_id, 'post_status' => 'publish'));
    } elseif (isset($_POST['locable_reject_business_btn'])) {
        wp_update_post(array('ID' => $post_id, 'post_status' => 'draft'));
    }
}

// ─── 14. Full Business Listing Custom Fields Editor Metabox ───────────────
add_action('add_meta_boxes', 'locable_add_business_fields_metabox');
function locable_add_business_fields_metabox() {
    add_meta_box(
        'locable_business_fields_box',
        '🏢 Locable Business Listing Details & Custom Fields (Editable)',
        'locable_render_business_fields_metabox',
        'business_listing',
        'normal',
        'high'
    );
}

function locable_render_business_fields_metabox($post) {
    wp_nonce_field('locable_save_business_fields_action', 'locable_business_fields_nonce');

    $type           = get_post_meta($post->ID, 'type', true);
    $city           = get_post_meta($post->ID, 'city', true);
    $address        = get_post_meta($post->ID, 'address', true);
    $state          = get_post_meta($post->ID, 'state', true) ?: 'CA';
    $zip            = get_post_meta($post->ID, 'zip', true);
    $phone          = get_post_meta($post->ID, 'phone', true);
    $website        = get_post_meta($post->ID, 'website', true);
    $price          = get_post_meta($post->ID, 'price', true) ?: '$$';
    $rating         = get_post_meta($post->ID, 'rating', true) ?: '5.0';
    $reviews        = get_post_meta($post->ID, 'reviews', true) ?: '1';
    $verified       = get_post_meta($post->ID, 'verified', true) === 'true' ? 'true' : 'false';
    $openState      = get_post_meta($post->ID, 'openState', true) ?: 'Open Now';
    $serviceOptions = get_post_meta($post->ID, 'serviceOptions', true) ?: get_post_meta($post->ID, 'services', true);
    $workingHours   = get_post_meta($post->ID, 'workingHours', true);
    $thumbnail      = get_post_meta($post->ID, 'thumbnail', true);
    $coverImage     = get_post_meta($post->ID, 'coverImage', true);
    $placeId        = get_post_meta($post->ID, 'placeId', true);

    $founderName       = get_post_meta($post->ID, 'founderName', true) ?: get_post_meta($post->ID, 'founder_name', true);
    $founderRole       = get_post_meta($post->ID, 'founderRole', true) ?: get_post_meta($post->ID, 'founder_role', true);
    $founderExperience = get_post_meta($post->ID, 'founderExperience', true) ?: get_post_meta($post->ID, 'founder_experience', true);
    $founderQuote      = get_post_meta($post->ID, 'founderQuote', true) ?: get_post_meta($post->ID, 'founder_quote', true);
    $founderAvatar     = get_post_meta($post->ID, 'founderAvatar', true) ?: get_post_meta($post->ID, 'founder_avatar', true);
    $licenseStatus     = get_post_meta($post->ID, 'licenseStatus', true) ?: get_post_meta($post->ID, 'license_status', true);

    ?>
    <style>
        .locable-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .locable-meta-field { display: flex; flex-direction: column; gap: 4px; }
        .locable-meta-field label { font-weight: 700; font-size: 13px; color: #1e293b; }
        .locable-meta-field input, .locable-meta-field select, .locable-meta-field textarea { width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; }
        .locable-section-title { font-size: 14px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 18px 0 12px; }
    </style>

    <div style="padding:10px 0;">
        <div class="locable-section-title">📍 Category & Location Details</div>
        <div class="locable-meta-grid">
            <div class="locable-meta-field">
                <label>Primary Trade / Category:</label>
                <?php
                $terms = get_terms(array('taxonomy' => 'business_type', 'hide_empty' => false));
                $cat_names = array(
                    'Medical Spa & Wellness', 'Medical Spa', 'Skin Care Clinic', 'Plumbing', 'Emergency Plumbing',
                    'Drain Cleaning', 'Water Heaters', 'HVAC & Air Conditioning', 'AC Repair', 'Heating Installation',
                    'Roofing', 'Roof Repair', 'Electricians', 'EV Charger Install', 'Panel Upgrades',
                    'Solar Power & Storage', 'Landscaping & Turf', 'House Cleaning', 'Pest Control', 'Handyman Services',
                    'Auto Repair & Mechanics', 'Dentist & Dental Clinic', 'Chiropractor', 'Pet Grooming & Veterinary',
                    'Photography & Videography', 'Legal & Attorney Services', 'Accounting & Tax Services',
                    'Real Estate Agency', 'Fitness & Gym', 'Barbershop & Salon', 'Architect', 'Roofer', 'Solar Contractor'
                );
                if (!is_wp_error($terms) && !empty($terms)) {
                    foreach ($terms as $t) {
                        if (!in_array($t->name, $cat_names)) {
                            $cat_names[] = $t->name;
                        }
                    }
                }
                if ($type && !in_array($type, $cat_names)) {
                    $cat_names[] = $type;
                }
                sort($cat_names);
                $is_custom = $type && !in_array($type, $cat_names);
                ?>
                <select id="locable_meta_type_select" onchange="locableHandleCategoryChange(this)" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-size:13px;background:#ffffff;">
                    <option value="">-- Choose Category --</option>
                    <?php foreach ($cat_names as $c_name) : ?>
                        <option value="<?php echo esc_attr($c_name); ?>" <?php selected($type, $c_name); ?>>
                            <?php echo esc_html($c_name); ?>
                        </option>
                    <?php endforeach; ?>
                    <option value="__custom__" <?php echo $is_custom ? 'selected' : ''; ?>>✨ + Enter Custom Category...</option>
                </select>
                <input type="text" name="locable_meta_type" id="locable_meta_type_input" value="<?php echo esc_attr($type); ?>" placeholder="Type custom category name..." style="width:100%;margin-top:6px;padding:8px 12px;border-radius:6px;border:1px solid #0ea5e9;font-size:13px;display:<?php echo $is_custom ? 'block' : 'none'; ?>;" />
                <script>
                function locableHandleCategoryChange(sel) {
                    var inp = document.getElementById('locable_meta_type_input');
                    if (sel.value === '__custom__') {
                        inp.style.display = 'block';
                        inp.value = '';
                        inp.focus();
                    } else {
                        inp.style.display = 'none';
                        inp.value = sel.value;
                    }
                }
                </script>
                <span style="font-size:11px;color:#64748b;margin-top:2px;">Select primary business category from list or enter custom category.</span>
            </div>
            <div class="locable-meta-field">
                <label>City Name:</label>
                <input type="text" name="locable_meta_city" value="<?php echo esc_attr($city); ?>" placeholder="e.g. San Diego, La Mesa" />
            </div>
        </div>

        <div class="locable-meta-grid">
            <div class="locable-meta-field" style="grid-column: span 2;">
                <label>Street Address:</label>
                <input type="text" name="locable_meta_address" value="<?php echo esc_attr($address); ?>" placeholder="e.g. 560 Fourth Ave, Suite 827" />
            </div>
            <div class="locable-meta-field">
                <label>State:</label>
                <input type="text" name="locable_meta_state" value="<?php echo esc_attr($state); ?>" placeholder="CA" />
            </div>
            <div class="locable-meta-field">
                <label>Zip Code:</label>
                <input type="text" name="locable_meta_zip" value="<?php echo esc_attr($zip); ?>" placeholder="92101" />
            </div>
        </div>

        <div class="locable-section-title">📞 Contact & Pricing</div>
        <div class="locable-meta-grid">
            <div class="locable-meta-field">
                <label>Phone Number (Auto-Formatted, Max 10 digits):</label>
                <input type="text" id="locable_meta_phone_input" name="locable_meta_phone" value="<?php echo esc_attr($phone); ?>" placeholder="(619) 555-0199" maxlength="14" oninput="locableFormatPhone(this);" />
            </div>
            <div class="locable-meta-field">
                <label>Website URL:</label>
                <input type="text" name="locable_meta_website" value="<?php echo esc_attr($website); ?>" placeholder="https://example.com" />
            </div>
            <div class="locable-meta-field">
                <label>Price Tier:</label>
                <select name="locable_meta_price">
                    <option value="$" <?php selected($price, '$'); ?>>$ (Inexpensive)</option>
                    <option value="$$" <?php selected($price, '$$'); ?>>$$ (Moderate)</option>
                    <option value="$$$" <?php selected($price, '$$$'); ?>>$$$ (Expensive)</option>
                    <option value="$$$$" <?php selected($price, '$$$$'); ?>>$$$$ (Ultra High End)</option>
                </select>
            </div>
            <div class="locable-meta-field">
                <label>Verified Badge Status:</label>
                <select name="locable_meta_verified">
                    <option value="true" <?php selected($verified, 'true'); ?>>Verified (Green Badge)</option>
                    <option value="false" <?php selected($verified, 'false'); ?>>Unverified</option>
                </select>
            </div>
        </div>

        <script>
        function locableFormatPhone(input) {
            let digits = input.value.replace(/\D/g, '').substring(0, 10);
            let formatted = '';
            if (digits.length > 6) {
                formatted = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6, 10);
            } else if (digits.length > 3) {
                formatted = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6);
            } else if (digits.length > 0) {
                formatted = '(' + digits;
            }
            input.value = formatted;
        }
        </script>

        <div class="locable-section-title">⭐ Google Ratings & Reviews</div>
        <div class="locable-meta-grid">
            <div class="locable-meta-field">
                <label>Rating (e.g. 4.9 or 5.0):</label>
                <input type="number" step="0.1" min="1.0" max="5.0" name="locable_meta_rating" value="<?php echo esc_attr($rating); ?>" />
            </div>
            <div class="locable-meta-field">
                <label>Total Reviews Count (e.g. 5373):</label>
                <input type="number" name="locable_meta_reviews" value="<?php echo esc_attr($reviews); ?>" />
            </div>
            <div class="locable-meta-field">
                <label>Open Status Text:</label>
                <input type="text" name="locable_meta_openState" value="<?php echo esc_attr($openState); ?>" placeholder="e.g. Open Now, Open · Closes 6 PM" />
            </div>
            <div class="locable-meta-field">
                <label>Google Place ID (ChIJ...):</label>
                <input type="text" name="locable_meta_placeId" value="<?php echo esc_attr($placeId); ?>" placeholder="ChIJ..." />
            </div>
        </div>

        <div class="locable-section-title">🛠️ Services Offered & Checkmark Badges</div>
        <div class="locable-meta-field" style="margin-bottom:15px;">
            <label>Services (Comma-separated string or list):</label>
            <textarea name="locable_meta_services" rows="2" placeholder="Drone Photography, Aerial Videography, Onsite Services"><?php echo esc_textarea($serviceOptions); ?></textarea>
        </div>

        <div class="locable-section-title">🕒 Working Hours</div>
        <div class="locable-meta-field" style="margin-bottom:15px;">
            <label>Working Hours Schedule:</label>
            <textarea name="locable_meta_workingHours" rows="3" placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM"><?php echo esc_textarea($workingHours); ?></textarea>
        </div>

        <div class="locable-section-title">👑 Founders & Leadership Details</div>
        <div class="locable-meta-grid">
            <div class="locable-meta-field">
                <label>Founder / Owner Name:</label>
                <input type="text" name="locable_meta_founderName" value="<?php echo esc_attr($founderName); ?>" placeholder="e.g. Nina Bacci" />
            </div>
            <div class="locable-meta-field">
                <label>Founder Title / Role:</label>
                <input type="text" name="locable_meta_founderRole" value="<?php echo esc_attr($founderRole); ?>" placeholder="e.g. Managing Director & Founder" />
            </div>
            <div class="locable-meta-field">
                <label>Local Experience Badge:</label>
                <input type="text" name="locable_meta_founderExperience" value="<?php echo esc_attr($founderExperience); ?>" placeholder="e.g. 15+ Yrs San Diego Service" />
            </div>
            <div class="locable-meta-field">
                <label>License / Registration Status:</label>
                <input type="text" name="locable_meta_licenseStatus" value="<?php echo esc_attr($licenseStatus); ?>" placeholder="e.g. ACTIVE (Verified)" />
            </div>
        </div>
        <div class="locable-meta-field" style="margin-bottom:15px;">
            <label>Founder Personal Statement / Commitment Quote:</label>
            <textarea name="locable_meta_founderQuote" rows="2" placeholder="e.g. Committed to handcrafted quality and 100% customer satisfaction..."><?php echo esc_textarea($founderQuote); ?></textarea>
        </div>
        <div class="locable-meta-field" style="margin-bottom:15px;">
            <label>Founder Avatar / Photo Image URL:</label>
            <input type="text" name="locable_meta_founderAvatar" value="<?php echo esc_attr($founderAvatar); ?>" placeholder="https://domain.com/uploads/founder.jpg" />
        </div>

        <div class="locable-section-title">🖼️ Media & Images</div>
        <div class="locable-meta-grid">
            <div class="locable-meta-field">
                <label>Thumbnail / Logo Image URL:</label>
                <input type="text" name="locable_meta_thumbnail" value="<?php echo esc_attr($thumbnail); ?>" placeholder="https://..." />
            </div>
            <div class="locable-meta-field">
                <label>Cover / Banner Image URL:</label>
                <input type="text" name="locable_meta_coverImage" value="<?php echo esc_attr($coverImage); ?>" placeholder="https://..." />
            </div>
        </div>
    </div>
    <?php
}

add_action('save_post_business_listing', 'locable_save_business_fields_meta', 20, 2);
function locable_save_business_fields_meta($post_id, $post) {
    if (!isset($_POST['locable_business_fields_nonce']) || !wp_verify_nonce($_POST['locable_business_fields_nonce'], 'locable_save_business_fields_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    // Sync Title & Description meta with main WP post title & content
    if (!empty($post->post_title)) {
        update_post_meta($post_id, 'title', sanitize_text_field($post->post_title));
    }
    if (!empty($post->post_content)) {
        update_post_meta($post_id, 'description', sanitize_textarea_field($post->post_content));
    }

    if (isset($_POST['locable_meta_founderName'])) {
        update_post_meta($post_id, 'founderName', sanitize_text_field($_POST['locable_meta_founderName']));
        update_post_meta($post_id, 'founder_name', sanitize_text_field($_POST['locable_meta_founderName']));
    }
    if (isset($_POST['locable_meta_founderRole'])) {
        update_post_meta($post_id, 'founderRole', sanitize_text_field($_POST['locable_meta_founderRole']));
        update_post_meta($post_id, 'founder_role', sanitize_text_field($_POST['locable_meta_founderRole']));
    }
    if (isset($_POST['locable_meta_founderExperience'])) {
        update_post_meta($post_id, 'founderExperience', sanitize_text_field($_POST['locable_meta_founderExperience']));
        update_post_meta($post_id, 'founder_experience', sanitize_text_field($_POST['locable_meta_founderExperience']));
    }
    if (isset($_POST['locable_meta_founderQuote'])) {
        update_post_meta($post_id, 'founderQuote', sanitize_textarea_field($_POST['locable_meta_founderQuote']));
        update_post_meta($post_id, 'founder_quote', sanitize_textarea_field($_POST['locable_meta_founderQuote']));
    }
    if (isset($_POST['locable_meta_founderAvatar'])) {
        update_post_meta($post_id, 'founderAvatar', esc_url_raw($_POST['locable_meta_founderAvatar']));
        update_post_meta($post_id, 'founder_avatar', esc_url_raw($_POST['locable_meta_founderAvatar']));
    }
    if (isset($_POST['locable_meta_licenseStatus'])) {
        update_post_meta($post_id, 'licenseStatus', sanitize_text_field($_POST['locable_meta_licenseStatus']));
        update_post_meta($post_id, 'license_status', sanitize_text_field($_POST['locable_meta_licenseStatus']));
    }

    if (isset($_POST['locable_meta_type'])) {
        $type = sanitize_text_field($_POST['locable_meta_type']);
        update_post_meta($post_id, 'type', $type);
        update_post_meta($post_id, 'typeSlug', sanitize_title($type));
        wp_set_object_terms($post_id, $type, 'business_type', false);
    }

    if (isset($_POST['locable_meta_city'])) {
        $city = sanitize_text_field($_POST['locable_meta_city']);
        update_post_meta($post_id, 'city', $city);
        update_post_meta($post_id, 'citySlug', sanitize_title($city));
        wp_set_object_terms($post_id, $city, 'business_location', false);
    }

    if (isset($_POST['locable_meta_address'])) {
        update_post_meta($post_id, 'address', sanitize_text_field($_POST['locable_meta_address']));
    }
    if (isset($_POST['locable_meta_state'])) {
        $state = sanitize_text_field($_POST['locable_meta_state']);
        update_post_meta($post_id, 'state', $state);
        update_post_meta($post_id, 'stateSlug', sanitize_title($state));
    }
    if (isset($_POST['locable_meta_zip'])) {
        update_post_meta($post_id, 'zip', sanitize_text_field($_POST['locable_meta_zip']));
    }
    if (isset($_POST['locable_meta_phone'])) {
        $p_raw = preg_replace('/\D/', '', $_POST['locable_meta_phone']);
        $p_digits = substr($p_raw, 0, 10);
        if (strlen($p_digits) === 10) {
            $p_fmt = sprintf('(%s) %s-%s', substr($p_digits, 0, 3), substr($p_digits, 3, 3), substr($p_digits, 6, 4));
        } else {
            $p_fmt = sanitize_text_field($_POST['locable_meta_phone']);
        }
        update_post_meta($post_id, 'phone', $p_fmt);
    }
    if (isset($_POST['locable_meta_website'])) {
        update_post_meta($post_id, 'website', esc_url_raw($_POST['locable_meta_website']));
    }
    if (isset($_POST['locable_meta_price'])) {
        update_post_meta($post_id, 'price', sanitize_text_field($_POST['locable_meta_price']));
    }
    if (isset($_POST['locable_meta_verified'])) {
        update_post_meta($post_id, 'verified', $_POST['locable_meta_verified'] === 'true' ? 'true' : 'false');
    }
    if (isset($_POST['locable_meta_rating'])) {
        update_post_meta($post_id, 'rating', floatval($_POST['locable_meta_rating']));
    }
    if (isset($_POST['locable_meta_reviews'])) {
        update_post_meta($post_id, 'reviews', intval($_POST['locable_meta_reviews']));
    }
    if (isset($_POST['locable_meta_openState'])) {
        update_post_meta($post_id, 'openState', sanitize_text_field($_POST['locable_meta_openState']));
    }
    if (isset($_POST['locable_meta_placeId'])) {
        update_post_meta($post_id, 'placeId', sanitize_text_field($_POST['locable_meta_placeId']));
    }
    if (isset($_POST['locable_meta_thumbnail'])) {
        update_post_meta($post_id, 'thumbnail', esc_url_raw($_POST['locable_meta_thumbnail']));
    }
    if (isset($_POST['locable_meta_coverImage'])) {
        update_post_meta($post_id, 'coverImage', esc_url_raw($_POST['locable_meta_coverImage']));
    }
    if (isset($_POST['locable_meta_services'])) {
        $services_str = sanitize_textarea_field($_POST['locable_meta_services']);
        update_post_meta($post_id, 'serviceOptions', $services_str);
        update_post_meta($post_id, 'services', $services_str);
    }
    if (isset($_POST['locable_meta_workingHours'])) {
        update_post_meta($post_id, 'workingHours', sanitize_textarea_field($_POST['locable_meta_workingHours']));
    }
}

add_action('admin_head', 'locable_admin_custom_css');
function locable_admin_custom_css() {
    echo '<style>
        .column-admin_actions { width: 220px !important; text-align: left; }
        .column-listing_status, .column-user_status { width: 140px !important; }
        .column-submitted_by { width: 160px !important; }
        .column-category_city { width: 170px !important; }
        td.admin_actions .button { padding: 2px 8px !important; font-size: 11px !important; height: 26px !important; line-height: 24px !important; white-space: nowrap !important; }
    </style>';
}

// ── 1-Click Admin Table Columns for Business Listings ──
add_filter('manage_business_listing_posts_columns', 'locable_set_business_listing_columns');
function locable_set_business_listing_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'Business Listing Name';
    $new_columns['submitted_by'] = 'Submitted By';
    $new_columns['category_city'] = 'Category & Location';
    $new_columns['listing_status'] = 'Approval Status';
    $new_columns['admin_actions'] = '1-Click Admin Actions';
    $new_columns['date'] = 'Date';
    return $new_columns;
}

add_action('manage_business_listing_posts_custom_column', 'locable_render_business_listing_columns', 10, 2);
function locable_render_business_listing_columns($column, $post_id) {
    $post      = get_post($post_id);
    $userEmail = get_post_meta($post_id, 'userEmail', true) ?: 'Admin';
    $type      = get_post_meta($post_id, 'type', true) ?: 'General';
    $city      = get_post_meta($post_id, 'city', true) ?: 'San Diego';
    $status    = $post->post_status === 'publish' ? 'published' : ($post->post_status === 'draft' ? 'rejected' : 'pending');

    if ($column === 'submitted_by') {
        echo '<strong>' . esc_html($userEmail) . '</strong>';
    } elseif ($column === 'category_city') {
        echo '<span>' . esc_html($type) . ' • ' . esc_html($city) . '</span>';
    } elseif ($column === 'listing_status') {
        $bg = $status === 'published' ? '#dcfce7' : ($status === 'rejected' ? '#fee2e2' : '#fef3c7');
        $color = $status === 'published' ? '#15803d' : ($status === 'rejected' ? '#b91c1c' : '#b45309');
        echo '<span style="background:' . $bg . ';color:' . $color . ';padding:3px 10px;border-radius:12px;font-weight:700;font-size:11px;display:inline-block;">' . strtoupper($status === 'published' ? 'LIVE' : ($status === 'rejected' ? 'REJECTED' : 'PENDING REVIEW')) . '</span>';
    } elseif ($column === 'admin_actions') {
        $approve_url = wp_nonce_url(admin_url('admin.php?action=locable_quick_business_status&status=publish&post_id=' . $post_id), 'locable_biz_action_' . $post_id);
        $reject_url  = wp_nonce_url(admin_url('admin.php?action=locable_quick_business_status&status=draft&post_id=' . $post_id), 'locable_biz_action_' . $post_id);
        $delete_url  = get_delete_post_link($post_id, '', true);

        echo '<div style="display:inline-flex;gap:4px;align-items:center;flex-wrap:nowrap;">';
        if ($status !== 'published') {
            echo '<a href="' . esc_url($approve_url) . '" class="button button-small button-primary" style="background:#10b981;border-color:#059669;color:#ffffff;font-weight:700;">✔ Approve</a>';
        }
        if ($status !== 'rejected') {
            echo '<a href="' . esc_url($reject_url) . '" class="button button-small" style="color:#dc2626;border-color:#fca5a5;font-weight:600;">✖ Deny</a>';
        }
        if ($delete_url) {
            echo '<a href="' . esc_url($delete_url) . '" class="button button-small" style="color:#64748b;font-weight:600;" onclick="return confirm(\'Delete this listing?\');">🗑 Delete</a>';
        }
        echo '</div>';
    }
}

// ── 1-Click Status Handler for Business Listings ──
add_action('admin_action_locable_quick_business_status', 'locable_handle_quick_business_status');
function locable_handle_quick_business_status() {
    $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
    $status  = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';

    if ($post_id && check_admin_referer('locable_biz_action_' . $post_id)) {
        if (in_array($status, array('publish', 'draft'))) {
            wp_update_post(array('ID' => $post_id, 'post_status' => $status));
        }
    }
    wp_safe_redirect(admin_url('edit.php?post_type=business_listing'));
    exit;
}

// ── 1-Click Bulk Google Places Sync for All Existing Business Listings ──
add_action('admin_action_locable_bulk_google_sync', 'locable_handle_bulk_google_sync');
function locable_handle_bulk_google_sync() {
    if (!current_user_can('manage_options')) wp_die('Unauthorized');
    check_admin_referer('locable_bulk_sync_action');

    $api_key = 'AIzaSyAusNwdN9zPqXJ_doW_M4mbdrhtJkZkdpU';
    $posts = get_posts(array(
        'post_type'      => 'business_listing',
        'post_status'    => 'any',
        'posts_per_page' => -1,
    ));

    foreach ($posts as $p) {
        $title   = get_post_meta($p->ID, 'title', true) ?: $p->post_title;
        $address = get_post_meta($p->ID, 'address', true);
        $city    = get_post_meta($p->ID, 'city', true) ?: 'San Diego';
        $state   = get_post_meta($p->ID, 'state', true) ?: 'CA';

        $query = urlencode(trim("$title $address $city $state"));
        $url   = "https://maps.googleapis.com/maps/api/place/textsearch/json?query={$query}&key={$api_key}";

        $res = wp_remote_get($url);
        if (!is_wp_error($res) && wp_remote_retrieve_response_code($res) === 200) {
            $data = json_decode(wp_remote_retrieve_body($res), true);
            if (!empty($data['results'][0])) {
                $g = $data['results'][0];
                update_post_meta($p->ID, 'placeId', $g['place_id']);
                update_post_meta($p->ID, 'rating', floatval($g['rating'] ?? 5.0));
                update_post_meta($p->ID, 'reviews', intval($g['user_ratings_total'] ?? 1));
                if (!empty($g['geometry']['location']['lat'])) update_post_meta($p->ID, 'latitude', floatval($g['geometry']['location']['lat']));
                if (!empty($g['geometry']['location']['lng'])) update_post_meta($p->ID, 'longitude', floatval($g['geometry']['location']['lng']));
            }
        }
    }

    wp_safe_redirect(admin_url('edit.php?post_type=business_listing&bulk_synced=1'));
    exit;
}

// ── Public REST Route for User Submitted Listings ──
add_action('rest_api_init', function() {
    register_rest_route('locable/v1', '/user-listings', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function($request) {
            $email = sanitize_email($request->get_param('email'));
            if (empty($email)) return array('listings' => array());

            $posts = get_posts(array(
                'post_type'      => 'business_listing',
                'post_status'    => 'any',
                'meta_key'       => 'userEmail',
                'meta_value'     => $email,
                'posts_per_page' => 100,
            ));

            $results = array();
            foreach ($posts as $p) {
                $meta = get_post_meta($p->ID);
                $status = $p->post_status === 'publish' ? 'published' : ($p->post_status === 'draft' ? 'rejected' : 'pending');
                
                $rawService = $meta['serviceOptions'][0] ?? '';
                $servicesArr = array();
                if (!empty($rawService)) {
                    $decoded = json_decode($rawService, true);
                    if (is_array($decoded)) $servicesArr = $decoded;
                    else $servicesArr = array_filter(array_map('trim', explode(',', $rawService)));
                }

                $results[] = array(
                    'id'             => (string)$p->ID,
                    'placeId'        => (string)($meta['placeId'][0] ?? $p->ID),
                    'title'          => $p->post_title,
                    'type'           => (string)($meta['type'][0] ?? 'General'),
                    'city'           => (string)($meta['city'][0] ?? 'San Diego'),
                    'address'        => (string)($meta['address'][0] ?? ''),
                    'phone'          => (string)($meta['phone'][0] ?? ''),
                    'website'        => (string)($meta['website'][0] ?? ''),
                    'description'    => (string)($meta['description'][0] ?? $p->post_content),
                    'workingHours'   => (string)($meta['workingHours'][0] ?? ''),
                    'serviceOptions' => $servicesArr,
                    'status'         => $status,
                    'createdAt'      => $p->post_date,
                );
            }
            return array('listings' => $results);
        }
    ));
});

function locable_detect_state_from_meta($state = '', $city = '', $address = '') {
    $clean_state = trim($state);
    if (!empty($clean_state)) {
        if (strlen($clean_state) === 2) return strtoupper($clean_state);
        if (strtolower($clean_state) === 'new york') return 'NY';
        if (strtolower($clean_state) === 'california') return 'CA';
        return strtoupper($clean_state);
    }

    $full_text = strtoupper("$address $city");

    if (strtolower($city) === 'new york' || strpos($full_text, 'NEW YORK') !== false || strpos($full_text, 'NY') !== false) {
        return 'NY';
    }
    if (strpos($full_text, 'CALIFORNIA') !== false || strpos($full_text, 'CA') !== false || strpos(strtolower($city), 'san diego') !== false || strpos(strtolower($city), 'la mesa') !== false || strpos(strtolower($city), 'chula vista') !== false || strpos(strtolower($city), 'oceanside') !== false || strpos(strtolower($city), 'carlsbad') !== false) {
        return 'CA';
    }

    if (preg_match('/,\s*([A-Z]{2})\s+\d{5}/i', $address, $matches)) {
        return strtoupper($matches[1]);
    }

    return '';
}

// ── Headless REST API CORS & Zero-Cache Headers ──
add_action('rest_api_init', function() {
    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-Accel-Expires: 0');

    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, Origin, Accept');
        header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('X-Accel-Expires: 0');
        return $value;
    });
}, 15);

add_filter('rest_post_dispatch', function($response) {
    if ($response instanceof WP_REST_Response) {
        $response->header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
        $response->header('Pragma', 'no-cache');
        $response->header('Expires', '0');
        $response->header('X-Accel-Expires', '0');
    }
    return $response;
}, 999);
