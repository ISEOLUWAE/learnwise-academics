
-- Fix ENT 312 and GST 312 semesters to Second (300L Second Semester per handbook)
UPDATE courses SET semester = 'Second' WHERE code = 'ENT 312' AND department = 'Computer Science';
UPDATE courses SET semester = 'Second' WHERE code = 'GST 312' AND department = 'Computer Science';

-- Update shared courses to Computer Science department so CS students see them correctly
UPDATE courses SET department = 'Computer Science', 
  description = 'English language skills: sound patterns, word classes, sentence types, grammar, logical thinking, writing activities, comprehension strategies.',
  overview = 'Sound patterns in English Language. English word classes. Sentence in English. Grammar and Usage. Logical and Critical Thinking. Writing Activities. Comprehension Strategies.'
WHERE code = 'GST 111';

UPDATE courses SET department = 'Computer Science',
  description = 'Nigerian history, culture, political evolution, trade and economics, social justice, norms and values, re-orientation strategies.',
  overview = 'Nigerian history, culture and art up to 1800. Nigeria under colonial rule. Evolution of Nigeria as a political unit. Challenges of nation-building. Trade and economics of self-reliance. Social justice.'
WHERE code = 'GST 112';

UPDATE courses SET department = 'Computer Science',
  description = 'Calculus: functions, limits, continuity, differentiation techniques, curve sketching, integration methods, definite integrals, areas and volumes.',
  overview = 'Function of a real variable, graphs, limits and continuity. The derivative. Techniques of differentiation. Integration as inverse of differentiation. Methods of integration. Definite integrals. Application to areas, volumes.'
WHERE code = 'MTH 102';
