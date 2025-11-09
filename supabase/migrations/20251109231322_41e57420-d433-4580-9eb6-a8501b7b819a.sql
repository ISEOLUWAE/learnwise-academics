-- Add quiz questions for MTH 101 (General Mathematics I)
INSERT INTO quiz_questions (course_id, question, options, correct_answer, explanation) VALUES 
('2691b406-4537-471c-9525-084ba33b7c10', 'What is the derivative of x²?', '["x", "2x", "x³", "2x²"]', 1, 'The power rule states that d/dx(xⁿ) = n·xⁿ⁻¹. For x², the derivative is 2x¹ = 2x.'),
('2691b406-4537-471c-9525-084ba33b7c10', 'What is the integral of 1/x dx?', '["x²", "ln|x| + C", "1/x²", "e^x"]', 1, 'The integral of 1/x is the natural logarithm: ∫(1/x)dx = ln|x| + C'),
('2691b406-4537-471c-9525-084ba33b7c10', 'What is lim(x→0) (sin x)/x?', '["0", "1", "∞", "undefined"]', 1, 'This is a standard limit. Using L''Hôpital''s rule or the squeeze theorem, lim(x→0) (sin x)/x = 1'),
('2691b406-4537-471c-9525-084ba33b7c10', 'If f(x) = 3x³ - 2x + 5, what is f''(x)?', '["9x² - 2", "9x²", "3x² - 2", "x³ - 2x"]', 0, 'Taking the derivative: f''(x) = 3(3x²) - 2(1) + 0 = 9x² - 2'),
('2691b406-4537-471c-9525-084ba33b7c10', 'What is the slope of the tangent line to y = x² at x = 3?', '["3", "6", "9", "12"]', 1, 'The slope of the tangent line is the derivative at that point. y'' = 2x, so at x = 3, the slope is 2(3) = 6'),
('2691b406-4537-471c-9525-084ba33b7c10', 'Simplify: √(49)', '["7", "49", "14", "±7"]', 0, 'The square root of 49 is 7 (we take the principal/positive root).'),
('2691b406-4537-471c-9525-084ba33b7c10', 'What is 15% of 200?', '["15", "30", "45", "60"]', 1, '15% of 200 = (15/100) × 200 = 0.15 × 200 = 30'),
('2691b406-4537-471c-9525-084ba33b7c10', 'Solve for x: 2x + 5 = 15', '["5", "10", "7.5", "20"]', 0, 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5'),
('2691b406-4537-471c-9525-084ba33b7c10', 'What is the value of π (pi) approximately?', '["3.14", "2.71", "1.41", "1.73"]', 0, 'Pi (π) is approximately 3.14159... or about 3.14'),
('2691b406-4537-471c-9525-084ba33b7c10', 'If a circle has a radius of 7 cm, what is its area? (Use π ≈ 22/7)', '["44 cm²", "154 cm²", "49 cm²", "98 cm²"]', 1, 'Area of circle = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²');