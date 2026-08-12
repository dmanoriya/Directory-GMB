<?php
/**
 * Plugin Name: San Diego Home Services Directory Helper
 * Description: Registers Custom Post Types (Listings, Reviews, Leads) & Taxonomies for Headless Next.js Integration.
 * Version: 1.0.0
 * Author: Antigravity AI
 */

if (!defined('ABSPATH')) exit;

// Register CPTs and Taxonomies
add_action('init', 'sd_directory_register_cpts');

function sd_directory_register_cpts() {
    // 1. Business Listing CPT
    register_post_type('business_listing', array(
        'labels' => array(
            'name' => 'Business Listings',
            'singular_name' => 'Business Listing',
            'add_new_item' => 'Add New Business',
            'edit_item' => 'Edit Business Listing'
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true, // Enables WP REST API & WPGraphQL
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields', 'revisions'),
        'menu_icon' => 'dashicons-store'
    ));

    // 2. Business Review CPT
    register_post_type('business_review', array(
        'labels' => array(
            'name' => 'Customer Reviews',
            'singular_name' => 'Customer Review',
            'add_new_item' => 'Add New Review'
        ),
        'public' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-star-filled'
    ));

    // 3. Lead Submissions CPT
    register_post_type('lead_submission', array(
        'labels' => array(
            'name' => 'Leads & SEO Audits',
            'singular_name' => 'Lead Submission'
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-email-alt'
    ));

    // Taxonomies
    register_taxonomy('service_category', 'business_listing', array(
        'labels' => array('name' => 'Service Categories', 'singular_name' => 'Service Category'),
        'hierarchical' => true,
        'show_in_rest' => true
    ));

    register_taxonomy('location', 'business_listing', array(
        'labels' => array('name' => 'Locations & Cities', 'singular_name' => 'Location'),
        'hierarchical' => true, // Country -> State -> County -> City
        'show_in_rest' => true
    ));
}
