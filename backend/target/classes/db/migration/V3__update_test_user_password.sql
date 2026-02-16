-- Update testuser password to 'password'
UPDATE users 
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOpNaNSxFEAd8Z5iNXcPaE817pUPexp.y' 
WHERE username = 'testuser';
