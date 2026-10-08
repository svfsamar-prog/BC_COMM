
INSERT INTO sanjivani.periods (month_year, year, month, days_in_month, uploaded_by)
VALUES ('AUGUST 2026', 2026, 8, 31, 'admin')
ON CONFLICT (month_year) DO NOTHING;
