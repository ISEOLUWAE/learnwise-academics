-- Add sample quiz questions for MTH101 and COS101 (only existing courses)
INSERT INTO quiz_questions (course_id, question, options, correct_answer, explanation) VALUES
-- MTH101 questions
('2691b406-4537-471c-9525-084ba33b7c10', 
 'Solve for x: $2x + 5 = 13$', 
 '["$x = 4$", "$x = 3$", "$x = 5$", "$x = 6$"]', 
 0, 
 'Subtract 5 from both sides: $2x = 8$. Then divide by 2: $x = 4$'),

('2691b406-4537-471c-9525-084ba33b7c10', 
 'What is the derivative of $f(x) = x^3 + 2x^2 - 5x + 3$?', 
 '["$3x^2 + 4x - 5$", "$x^2 + 2x - 5$", "$3x^2 + 2x - 5$", "$3x^3 + 4x^2 - 5x$"]', 
 0, 
 'Using the power rule: $f''(x) = 3x^2 + 4x - 5$'),

('2691b406-4537-471c-9525-084ba33b7c10', 
 'Calculate: $\int (2x + 3) dx$', 
 '["$x^2 + 3x + C$", "$2x^2 + 3x + C$", "$x^2 + 6x + C$", "$2x + C$"]', 
 0, 
 'Using the power rule for integration: $\int (2x + 3) dx = x^2 + 3x + C$'),

('2691b406-4537-471c-9525-084ba33b7c10', 
 'What is the slope of the line passing through points $(2, 3)$ and $(6, 11)$?', 
 '["$2$", "$3$", "$4$", "$1$"]', 
 0, 
 'Slope = $\frac{y_2 - y_1}{x_2 - x_1} = \frac{11 - 3}{6 - 2} = \frac{8}{4} = 2$'),

('2691b406-4537-471c-9525-084ba33b7c10', 
 'Find the limit: $\lim_{x \to 2} \frac{x^2 - 4}{x - 2}$', 
 '["$4$", "$2$", "$0$", "undefined"]', 
 0, 
 'Factor the numerator: $\frac{(x-2)(x+2)}{x-2} = x+2$. As $x \to 2$, we get $2+2=4$'),

-- COS101 questions
('daea5136-2253-4005-ad24-43994ed1441c', 
 'What does the following Python code output?\n```python\nprint("Hello " + "World")\n```', 
 '["Hello World", "Hello + World", "HelloWorld", "Error"]', 
 0, 
 'The + operator concatenates strings in Python, resulting in "Hello World"'),

('daea5136-2253-4005-ad24-43994ed1441c', 
 'Which of the following is the correct syntax for a for loop in Python?', 
 '["for i in range(10):", "for (i = 0; i < 10; i++):", "for i from 0 to 10:", "loop i in range(10):"]', 
 0, 
 'Python uses "for variable in iterable:" syntax. range(10) creates numbers 0-9'),

('daea5136-2253-4005-ad24-43994ed1441c', 
 'What is the time complexity of binary search?', 
 '["O(log n)", "O(n)", "O(n log n)", "O(n²)"]', 
 0, 
 'Binary search eliminates half the search space in each step, giving O(log n) complexity'),

('daea5136-2253-4005-ad24-43994ed1441c', 
 'What will this code output?\n```python\nnums = [1, 2, 3]\nnums.append(4)\nprint(len(nums))\n```', 
 '["4", "3", "5", "Error"]', 
 0, 
 'The list starts with 3 elements, append(4) adds one more, so len(nums) = 4'),

('daea5136-2253-4005-ad24-43994ed1441c', 
 'Which data structure follows Last In, First Out (LIFO) principle?', 
 '["Stack", "Queue", "Array", "Linked List"]', 
 0, 
 'A stack follows LIFO - the last element added is the first one removed');