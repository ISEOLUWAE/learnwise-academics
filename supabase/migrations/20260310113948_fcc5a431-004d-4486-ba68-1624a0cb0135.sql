
-- Insert 30 MCQ questions for DTS201
INSERT INTO public.quiz_questions (course_id, question, options, correct_answer, explanation) VALUES
('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is the primary purpose of a data dictionary?', '["To clean and transform data", "To store the actual data values", "To create data visualizations", "To provide a centralized repository of metadata about the data"]', 3, 'A data dictionary serves as a centralized repository that stores metadata — information about the data such as definitions, types, relationships, and constraints — rather than the actual data values themselves.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'In CRISP-DM, the path from Data Preparation to Modeling and back to Data Preparation indicates what type of process?', '["Iterative", "Linear", "Sequential", "Random"]', 0, 'CRISP-DM is an iterative process. The arrows between Data Preparation and Modeling indicate that you may need to go back and re-prepare data based on insights gained during modeling.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What type of data is "Hair Color" (e.g., Brown, Black, Blonde, Red)?', '["Ratio", "Ordinal", "Interval", "Nominal"]', 3, 'Hair Color is nominal data because the categories (Brown, Black, Blonde, Red) have no inherent order or ranking — they are simply labels for different categories.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What does the metric "Precision" measure?', '["Overall, how many predictions were correct", "The trade-off between true positives and false positives", "Of all actual positives, how many were correctly predicted", "Of all positive predictions, how many were correct"]', 3, 'Precision measures the proportion of positive predictions that were actually correct: TP / (TP + FP). It answers "Of all the items the model predicted as positive, how many truly were positive?"'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is the main function of the "Reduce" phase in MapReduce?', '["To aggregate and summarize the intermediate results from the Map phase", "To filter and sort input data", "To store data on HDFS", "To replicate data across nodes"]', 0, 'The Reduce phase takes the intermediate key-value pairs produced by the Map phase and aggregates/summarizes them to produce the final output results.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'The technical assessment of a model (e.g., based on accuracy or MSE) occurs in which phase?', '["Modeling phase", "Business Understanding phase", "Evaluation phase", "Deployment phase"]', 2, 'The Evaluation phase involves assessing the model both technically (using metrics like accuracy, MSE, etc.) and against business objectives to determine if the model meets the project goals.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Which of the following is NOT a characteristic of Big Data?', '["Velocity", "Viscosity", "Variety", "Volume"]', 1, 'The classic characteristics of Big Data are Volume, Velocity, Variety, Veracity, and Value. Viscosity is not one of the recognized V''s of Big Data.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is a petabyte?', '["1,000 gigabytes", "1,000 terabytes", "1,000 bytes", "1,000 exabytes"]', 1, 'A petabyte equals 1,000 terabytes (or approximately 10^15 bytes). It follows the hierarchy: bytes → kilobytes → megabytes → gigabytes → terabytes → petabytes → exabytes.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'A data quality report is an important output of which phase?', '["Modeling", "Business Understanding", "Data Understanding", "Deployment"]', 2, 'The Data Understanding phase involves exploring and assessing the quality of available data, producing a data quality report that identifies issues like missing values, inconsistencies, and errors.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Which of the following is an example of quantitative data?', '["Eye Color", "Weight", "Gender", "Satisfaction Rating (on a scale)"]', 1, 'Weight is quantitative data because it represents a measurable numerical quantity. Eye Color and Gender are qualitative/categorical, and Satisfaction Rating on a scale is ordinal.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is the main goal of the Modeling phase?', '["To apply modeling techniques to the prepared dataset", "To put the model into production", "To assess the model against business objectives", "To define the business problem"]', 0, 'The Modeling phase focuses on selecting and applying appropriate modeling techniques to the prepared dataset, calibrating model parameters, and generating models.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'In a dataset, what is an "observation"?', '["The process of looking at data", "A type of database query", "A single entity or record", "A column representing a characteristic"]', 2, 'An observation (also called a record or row) represents a single entity or instance in a dataset, containing values for each variable/feature measured.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'The "determine next steps" task is part of which phase?', '["Modeling", "Business Understanding", "Evaluation", "Deployment"]', 2, 'The Evaluation phase includes the task of determining next steps — deciding whether to deploy the model, iterate further, or start a new project based on the evaluation results.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Creating a new feature by combining existing features is called what?', '["Feature Selection", "Feature Scaling", "Feature Engineering", "Feature Encoding"]', 2, 'Feature Engineering is the process of creating new features from existing ones to improve model performance. This can involve combining, transforming, or deriving new variables from the raw data.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'A cancer detection test fails to identify a patient who actually has cancer. What type of error is this?', '["True Positive", "False Negative", "False Positive", "True Negative"]', 1, 'A False Negative occurs when the model predicts negative (no cancer) but the actual condition is positive (has cancer). This is particularly dangerous in medical diagnostics.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', '"Annual Income in Dollars" is an example of which type of data?', '["Nominal", "Ratio", "Interval", "Ordinal"]', 1, 'Annual Income is ratio data because it has a true zero point ($0 means no income), equal intervals, and meaningful ratios (e.g., $60K is twice $30K).'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Why is the "review process" step important in the Evaluation phase?', '["It allows the model to be retrained automatically", "It helps catch oversights and ensures a high-quality process", "It speeds up model training", "It reduces the dataset size"]', 1, 'The review process step helps identify any oversights, errors, or quality issues in the entire data mining process, ensuring that the results are reliable and the methodology is sound.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is the role of domain expertise in the Business Understanding phase?', '["It improves algorithm accuracy automatically", "It helps translate business problems into data mining problems", "It replaces the need for data preparation", "It ensures the dataset is large"]', 1, 'Domain expertise is critical in the Business Understanding phase because it helps translate real-world business problems into well-defined data mining problems with clear objectives and success criteria.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What does a confusion matrix show?', '["The structure of a database", "The performance of a classification model", "The structure of a neural network", "The training time of a model"]', 1, 'A confusion matrix displays the performance of a classification model by showing the counts of true positives, true negatives, false positives, and false negatives in a tabular format.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Which metric is most sensitive to false positives?', '["Recall", "Precision", "Accuracy", "F1 Score"]', 1, 'Precision is most sensitive to false positives because it is calculated as TP / (TP + FP). A high number of false positives directly decreases precision.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Which of the following is NOT a common data quality problem?', '["Missing values", "High model accuracy", "Duplicate data", "Inconsistent values"]', 1, 'High model accuracy is a desirable outcome, not a data quality problem. Common data quality issues include missing values, duplicates, inconsistencies, and outliers.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What type of data format is JSON?', '["Structured", "Semi-structured", "Unstructured", "Binary"]', 1, 'JSON (JavaScript Object Notation) is semi-structured data. It has some organizational properties (key-value pairs, nested objects) but does not conform to the rigid structure of relational database tables.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Google Workspace (e.g., Gmail, Docs) is an example of which cloud service model?', '["IaaS", "PaaS", "SaaS", "FaaS"]', 2, 'Google Workspace is Software as a Service (SaaS) — complete applications delivered over the internet that users can access directly without managing underlying infrastructure or platforms.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Data Science combines which of the following disciplines?', '["Statistics, Computer Science, and Domain Expertise", "Networking and Hardware Engineering", "Software Engineering and Web Development", "Mathematics and Graphic Design"]', 0, 'Data Science is an interdisciplinary field that combines Statistics (for analysis), Computer Science (for computation and algorithms), and Domain Expertise (for contextual understanding).'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'The tasks "Initial Data Collection" and "Data Description" belong to which phase?', '["Business Understanding", "Data Preparation", "Modeling", "Data Understanding"]', 3, 'Initial Data Collection and Data Description are key tasks in the Data Understanding phase, where you gather data and explore its properties, structure, and quality.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is the primary activity in the "Explore Data" step?', '["Creating visualizations and running queries to find initial insights", "Deploying the final model", "Writing production code", "Replacing missing data automatically"]', 0, 'The Explore Data step involves creating visualizations, running queries, and performing statistical analyses to discover initial patterns, insights, and relationships in the data.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'A model performs very well technically but stakeholders reject it because it doesn''t fit the workflow. Which phase was likely insufficient?', '["Data Preparation", "Modeling", "Business Understanding", "Deployment"]', 2, 'If stakeholders reject a technically sound model because it doesn''t fit their workflow, it indicates insufficient Business Understanding — the business objectives and constraints were not properly captured.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Which SQL command is used to add new rows to a table?', '["UPDATE", "DELETE", "INSERT", "ALTER"]', 2, 'The INSERT SQL command is used to add new rows of data to a table. UPDATE modifies existing rows, DELETE removes rows, and ALTER changes table structure.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'Which of the following is an example of a continuous variable?', '["Number of students", "Temperature", "Gender", "Country"]', 1, 'Temperature is a continuous variable because it can take any value within a range (e.g., 36.5°C, 37.2°C). Number of students is discrete, while Gender and Country are categorical.'),

('203ee6ac-e5c8-4644-bb3c-855884ba8de4', 'What is the purpose of a centralized metadata repository in data management?', '["To store raw datasets", "To manage and document information about the data", "To perform data visualization", "To execute database queries"]', 1, 'A centralized metadata repository manages and documents information about data assets — including definitions, formats, relationships, lineage, and quality metrics — enabling better data governance and understanding.');
