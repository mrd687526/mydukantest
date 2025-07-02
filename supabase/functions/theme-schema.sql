-- E-commerce Theme Editor Schema Migration

-- 1. Themes Table
CREATE TABLE IF NOT EXISTS themes (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE
);

-- 2. Theme Templates Table
CREATE TABLE IF NOT EXISTS theme_templates (
  id BIGSERIAL PRIMARY KEY,
  theme_id BIGINT REFERENCES themes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_json JSONB NOT NULL
);

-- 3. Theme Section Definitions Table
CREATE TABLE IF NOT EXISTS theme_section_definitions (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  settings_schema_json JSONB NOT NULL
);

-- 4. Pre-populate Section Definitions
INSERT INTO theme_section_definitions (key, name, settings_schema_json) VALUES
  ('header', 'Header', '[
    { "type": "image_picker", "id": "logo", "label": "Logo" },
    { "type": "repeater", "id": "nav_links", "label": "Navigation Links", "fields": [
      { "type": "text", "id": "label", "label": "Label" },
      { "type": "link", "id": "url", "label": "URL" }
    ] },
    { "type": "text", "id": "announcement", "label": "Announcement Bar Text" },
    { "type": "color", "id": "announcement_bg", "label": "Announcement Bar Background", "default": "#F5F5F5" }
  ]'),
  ('footer', 'Footer', '[
    { "type": "repeater", "id": "links", "label": "Footer Links", "fields": [
      { "type": "text", "id": "label", "label": "Label" },
      { "type": "link", "id": "url", "label": "URL" }
    ] },
    { "type": "repeater", "id": "social", "label": "Social Media", "fields": [
      { "type": "icon_picker", "id": "icon", "label": "Icon" },
      { "type": "link", "id": "url", "label": "URL" }
    ] },
    { "type": "text", "id": "contact_info", "label": "Contact Info" }
  ]'),
  ('hero-banner', 'Hero Banner', '[
    { "type": "text", "id": "heading", "label": "Heading", "default": "Welcome to our store!" },
    { "type": "text", "id": "subheading", "label": "Subheading" },
    { "type": "image_picker", "id": "background_image", "label": "Background Image" },
    { "type": "color", "id": "text_color", "label": "Text Color", "default": "#FFFFFF" },
    { "type": "link", "id": "button_link", "label": "Button Link" }
  ]'),
  ('featured-products', 'Featured Products', '[
    { "type": "collection_picker", "id": "collection", "label": "Collection" },
    { "type": "product_picker", "id": "products", "label": "Manual Product Selection", "multiple": true },
    { "type": "number", "id": "max_products", "label": "Max Products", "default": 4 }
  ]'),
  ('product-grid', 'Product Grid', '[
    { "type": "collection_picker", "id": "collection", "label": "Collection" },
    { "type": "number", "id": "columns", "label": "Columns", "default": 3 }
  ]'),
  ('product-detail', 'Product Detail', '[
    { "type": "product_picker", "id": "product", "label": "Product" },
    { "type": "color", "id": "button_color", "label": "Add to Cart Button Color", "default": "#000000" }
  ]'),
  ('cart', 'Cart', '[
    { "type": "color", "id": "cart_bg", "label": "Cart Background Color", "default": "#FFFFFF" }
  ]'); 