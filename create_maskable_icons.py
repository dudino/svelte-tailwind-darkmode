from PIL import Image, ImageDraw
import math

def create_maskable_icon(size, filename):
    # Create a new image with the specified size
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # For maskable icons, we need a safe zone of 10% padding (20% total)
    # This means the main content should be within 80% of the total size
    safe_margin = size * 0.1
    content_size = size - (2 * safe_margin)
    
    # Create solid background that fills the entire icon (for maskable)
    # This ensures there's always visible content even when heavily masked
    for y in range(size):
        # Gradient from pink (#ec489a) to purple (#7c3aed)
        ratio = y / size
        r = int(236 * (1 - ratio) + 124 * ratio)
        g = int(72 * (1 - ratio) + 58 * ratio)
        b = int(154 * (1 - ratio) + 237 * ratio)
        color = (r, g, b, 255)
        draw.line([(0, y), (size, y)], fill=color)
    
    # The icon content should be centered and within the safe zone
    center_x, center_y = size // 2, size // 2
    scale = content_size / 512  # Scale based on safe content area
    
    # Draw spa elements (scaled down and centered within safe zone)
    stone_color = (255, 255, 255, 200)
    
    # Spa stones - positioned within safe zone
    stone1_size = max(int(25 * scale), 3)
    stone2_size = max(int(20 * scale), 2)
    stone3_size = max(int(15 * scale), 2)
    
    # Adjust positions to be within safe zone
    stone1_x = center_x - int(60 * scale)
    stone1_y = center_y - int(100 * scale)
    stone2_x = center_x + int(20 * scale)
    stone2_y = center_y - int(80 * scale)
    stone3_x = center_x + int(70 * scale)
    stone3_y = center_y - int(40 * scale)
    
    # Ensure stones are within safe zone
    stone1_x = max(safe_margin + stone1_size, min(size - safe_margin - stone1_size, stone1_x))
    stone1_y = max(safe_margin + stone1_size, min(size - safe_margin - stone1_size, stone1_y))
    
    draw.ellipse([
        stone1_x - stone1_size, stone1_y - stone1_size,
        stone1_x + stone1_size, stone1_y + stone1_size
    ], fill=stone_color)
    
    if stone2_size > 1:
        stone2_x = max(safe_margin + stone2_size, min(size - safe_margin - stone2_size, stone2_x))
        stone2_y = max(safe_margin + stone2_size, min(size - safe_margin - stone2_size, stone2_y))
        draw.ellipse([
            stone2_x - stone2_size, stone2_y - stone2_size,
            stone2_x + stone2_size, stone2_y + stone2_size
        ], fill=(255, 255, 255, 150))
    
    if stone3_size > 1:
        stone3_x = max(safe_margin + stone3_size, min(size - safe_margin - stone3_size, stone3_x))
        stone3_y = max(safe_margin + stone3_size, min(size - safe_margin - stone3_size, stone3_y))
        draw.ellipse([
            stone3_x - stone3_size, stone3_y - stone3_size,
            stone3_x + stone3_size, stone3_y + stone3_size
        ], fill=(255, 255, 255, 100))
    
    # Draw central lotus/spa symbol within safe zone
    lotus_size = max(int(30 * scale), 5)
    lotus_y = center_y + int(40 * scale)
    
    # Ensure lotus is within safe zone
    lotus_y = max(safe_margin + lotus_size, min(size - safe_margin - lotus_size, lotus_y))
    
    draw.ellipse([
        center_x - lotus_size, lotus_y - lotus_size,
        center_x + lotus_size, lotus_y + lotus_size
    ], fill=(255, 255, 255, 180))
    
    # Add center dot
    center_dot_size = max(int(8 * scale), 2)
    draw.ellipse([
        center_x - center_dot_size, lotus_y - center_dot_size,
        center_x + center_dot_size, lotus_y + center_dot_size
    ], fill=(255, 255, 255, 255))
    
    # Save the image
    img.save(filename, 'PNG', optimize=True)
    print(f"Created maskable icon: {filename} ({size}x{size})")

# Create maskable versions of the main icon sizes
create_maskable_icon(192, 'd:/rpod/Desktop/Affinity/svelte-tailwind-darkmode/static/icon-192-maskable.png')
create_maskable_icon(512, 'd:/rpod/Desktop/Affinity/svelte-tailwind-darkmode/static/icon-512-maskable.png')

print("Maskable icons created successfully!")
