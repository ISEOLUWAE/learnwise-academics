
-- 400 Level courses
UPDATE courses SET overview = 'Learning Outcomes:
At the end of this course, students should be able to:
1. explain research, types, approaches and significance of research;
2. discuss statement of problem, research methods, methodology, research process, criteria and strategy for good research;
3. discuss scientific investigation, problem formulation, and technique of the research problem;
4. discuss the guidelines for constructing questionnaire/schedule, guidelines for successful interviewing, research proposal and research plan;
5. explain types of reports, technical report writing, procedures and guidelines.

Course Contents:
Foundations of Research. Types of Research. Research Approaches. Significance of Research. Research Methods versus Methodology. Research Process. Criteria and Strategy for Good Research. Problems Encountered by Researchers in Nigeria. Principles of Scientific Research. Scientific investigation. Problem formulation. Definition and technique of the Research Problem. Selection of Appropriate Method for Data Collection. Primary Data and Secondary Data. Guidelines for Constructing Questionnaire/Schedule. Guidelines for Successful Interviewing. Difference between Survey and Experiment. Developing Research Proposal and Research Plan. Formulation of working hypothesis and Testing. Literature review. Procedure for reviewing related relevant studies and referencing cited works. Types of Reports. Technical Report Writing. Layout and mechanics of writing a Research Report. Standard Techniques for Research Documentation. Sampling Design. Different Types of Sample Designs. Steps in Sampling Design. Criteria of Selecting a Sampling Procedure. Methods of analysis. Processing and Analysis of Data Elements/Types of Analysis. Interpretation and Presentation of results. How to prepare References and Bibliography.' WHERE code = 'COS 409' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. explain the use of big-O, omega, and theta notation to describe the amount of work done by an algorithm,
2. use big-O, omega, and theta notation to give asymptotic upper, lower, and tight bounds on time and space complexity of algorithms,
3. determine the time and space complexity of simple algorithms,
4. deduce recurrence relations that describe the time complexity of recursively defined algorithms,
5. solve elementary recurrence relations,
6. for each of the strategies (brute-force, greedy, divide-and-conquer, recursive backtracking, and dynamic programming), identify a practical example to which it would apply,
7. use pattern matching to analyse substrings, and
8. use numerical approximation to solve mathematical problems.

Course Contents:
Basic algorithmic analysis. Asymptotic analysis of Upper and average complexity bounds. Standard Complexity Classes. Time and space trade-offs in analysis recursive algorithms. Algorithmic Strategies. Fundamental computing algorithms. Numerical algorithms. Sequential and Binary search algorithms. Sorting algorithms, Binary Search trees. Hash tables. Graphs and their representation.' WHERE code = 'COS 401' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. identify a researchable project topic in Computer Science;
2. search and review literature pertinent to identified problem statement;
3. acknowledge and reference sources of information used in the research report;
4. conceptualise and design a research methodology to address an identified problem;
5. determine tools for analysing data collected based on research objectives;
6. write a coherent proposal on the research project to be conducted; and
7. orally present the written project proposal.

Course Contents:
An independent or group investigation of appropriate software, hardware, communication and networks or IT related problems in Computer Science carried out under the supervision of a lecturer. Before registering, the student must submit a written proposal to the supervisor to review. The proposal should give a brief outline of the project, estimated schedule of completion, and computer resources needed. A formal written report is essential and an oral presentation may also be required.' WHERE code = 'CSC 497' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. describe project management planning;
2. describe project scheduling;
3. explain management of project resources;
4. discuss project procurement, monitoring and execution; and
5. explain project communication and time management.

Course Contents:
Introduction to Project Management. The Project Management Lifecycle. Managing Project Teams. Managing project communication. Project Initiation and Planning. Managing Project Scope. Managing Project Scheduling. Managing Project Resources. Project quality and tools to manage project quality. Managing project risk. Managing Project Procurement. Project Execution, Control and Closure. Managing Project Control and Closure: Obtaining information, Cost control, Change control, administrative closure, Personnel closure, Contractual closure and Project auditing.' WHERE code = 'INS 401' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. explain the fundamental concepts and principles of numerical computation;
2. develop skills in using numerical methods to solve mathematical problems;
3. choose appropriate numerical methods for specific problems;
4. develop programming skills to implement numerical algorithms using MATLAB, Python, or C++;
5. analyze the accuracy and stability of numerical methods;
6. enumerate the importance of numerical computation in applications;
7. Develop critical thinking and problem-solving skills through the application of numerical methods.

Course Contents:
Overview of the numerical computation approaches. Basic concepts and principles. Numerical errors. Floating-point arithmetic. Linear programming. Nonlinear optimization. Convex optimization. Root finding. Interpolation and approximation. Numerical integration and differentiation. Linear systems of equations. Ordinary differential equation. Partial differential equation. Numerical methods for differential equations. Hypothesis testing. Regression analysis. Bayesian statistics. Introduction to Machine learning. Supervised learning. Unsupervised learning. Deep learning. Reinforcement learning. Cache-oblivious algorithms. Lagrange Dual Problems. Monte Carlo methods. Optimization methods. Stability and convergence analysis. Error analysis. Applications of numerical analysis.' WHERE code = 'LAG-CSC 405' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. have an overview of entrepreneurship;
2. learn how to develop their technical ideas into potential business opportunities;
3. do market research, to develop go-to-market strategies, value propositions;
4. differentiate their products or services from actual or potential competitors.

Course Contents:
Asynchronous Group Communication; Synchronous Group Communication. Definitions of agents; Agent architectures; Agent theory; Software agents, personal assistants, and information access. Team participation, Team processes, Roles and responsibilities in a software team, Team conflict resolution, Risks associated with virtual teams. Risk categories including security, safety, market, financial, technology, people, quality, structure and process. Team management, Project management tools, Cost/benefit analysis. Monopolies and their economic implications. Effect of skilled labour supply and demand on quality of computing products. Pricing strategies in the computing domain. Outsourcing and off-shoring software development. Consequences of globalization for the computer science profession. Entrepreneurship: prospects and pitfalls. Network effect or demand-side economies of scale. Use of engineering economics in dealing with finances. Being a sustainable practitioner. Environmental impacts of design choices. Guidelines for sustainable design standards. Systemic effects of complex computer-mediated phenomena. Research on applications of computing to environmental issues. Reading, understanding and summarizing technical material. Writing effective technical documentation. Dynamics of oral, written, and electronic team and group communication. Communicating professionally with stakeholders. Utilizing collaboration tools. Dealing with cross-cultural environments.' WHERE code = 'LAG-CSC 407' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Interpret how a Compiler verifies entire program, so there are no syntax or semantic errors.
2. Describe compiler architecture, register allocation and compiler optimization.
3. Master how to create internal structure in memory.
4. Translate entire program in other language.
5. Link the files into an executable format.
6. Check for syntax errors and data types.
7. Interpret how a compiler handle language performance issue.
8. Implement a non-trivial programming project.
9. Implement techniques used for constructing a compiler.

Course Contents:
Programs that take (other) programs as input such as interpreters, compilers, type-checkers, documentation generators. Abstract syntax trees contrast with concrete syntax. Data structures to represent code for execution. Translation or transmission. Interpretation vs. compilation to native code vs. compilation to portable intermediate representation. Language translation pipeline: parsing, optional type-checking, translation, linking, execution. Execution as native code or within a virtual machine. Run-time representation of core language constructs such as objects (method tables) and first-class functions (closures). Run-time layout of memory, call-stack, Heap, static data. Implementing loops, recursion, and tail calls. Memory management. Scanning (lexical analysis) using regular expressions. Parsing strategies including top-down and bottom-up techniques. Role of context-free grammars. High-level program representations such as abstract syntax trees. Scope and binding resolution. Type checking. Instruction selection, scheduling, Register allocation. Peephole optimization. Flow-insensitive and flow-sensitive analyses. Role of static analysis in program optimization and verification.' WHERE code = 'LAG-CSC 413' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Describe the fundamental issues and challenges of machine learning;
2. Apply the underlying mathematical relationships within and across Machine Learning algorithms;
3. Design and implement various machine learning algorithms in real-world applications;
4. Use statistical techniques for classification and measuring their accuracy;
5. Apply supervised learning techniques for classification;
6. Apply un-supervised learning techniques for classification.

Course Contents:
Definition and examples of a broad variety of machine learning tasks, including classification. Inductive learning. Simple statistical-based learning, such as Naive Bayesian Classifier, decision trees. The over-fitting problem. Measuring classifier accuracy. General statistical-based learning, parameter estimation (maximum likelihood). Inductive logic programming (ILP). Supervised learning. Learning decision trees. Support vector machines. Neural networks. Deep learning fundamentals. Unsupervised learning. Clustering algorithms. Dimensionality reduction. Reinforcement learning basics.' WHERE code = 'LAG-CSC 417' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Explain and apply fundamental concepts and principles of modelling and simulation;
2. Develop skills in using modelling and simulation to solve real-world problems;
3. Develop and validate models and simulations;
4. Develop programming skills using simulation software such as AnyLogic, MATLAB/Simulink, or Arena;
5. Analyze and interpret simulation results;
6. Explain the importance of modelling and simulation in applications;
7. Develop critical thinking and problem-solving skills;
8. Communicate modelling and simulation results effectively.

Course Contents:
Basic Modelling and Simulation concepts and definitions. Random Number generation. Introduction to distributed functions. Modelling methods. Agent-based modeling. System dynamics modelling. Introduction to discrete event simulation. Event scheduling. Queuing theory. Monte Carlo simulation. Simulation of stochastic systems. Statistics for modelling and simulation. Model validation and verification. Sensitivity computation. Optimization and control. Markov and Hidden Markov Chain. Discrete event simulation tools. Applications of modelling and simulation. Hands-on discrete event simulation.' WHERE code = 'LAG-CSC 419' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Describe the role of theoretical formalisms, such as operational and denotational semantics;
2. Apply these semantics in the context of programming languages;
3. Evaluate differences of these theoretical formalisms;
4. Create operational or denotational semantics of simple imperative programs;
5. Analyze the role of types in programming languages;
6. Formalize properties and reason about programs;
7. Apply basic principles for formalizing concurrent programming languages;
8. Specify the concrete and abstract syntax of a programming language;
9. Define the static semantics using typing judgments;
10. Define the dynamics semantics using operational and denotational methods;
11. Verify type safety;
12. Explain the propositions-as-types principle;
13. Formulate type and assertion languages for specifying program behaviour.

Course Contents:
Introduction and History of programming language. Program structure Data types, abstraction, and polymorphism. Memory Allocation and Deallocation. Object-oriented programming. Syntax. Values and types. Names, Scopes, and Bindings. Variables and Constants. Expressions Statements and Control-flow. Data types and Procedures. Parameter Passing. Mutually Recursive Procedures Data Abstraction and Procedural Representation. Runtime Environments. Object-Oriented Programming. Functional Programming. Logic Programming. Programming methodologies using example drawn from a variety of programming languages including LISP, Prolog, ML, Ada, Smalltalk, Icon, APL, JAVA and LUCID, Programming assignment to involve the use of some of these languages.' WHERE code = 'LAG-CSC 421' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. use applied probability theory in measuring the performance of a system;
2. analyse queue systems;
3. analyse queuing networks;
4. compare different systems using sample data; and
5. practice performance evaluation techniques and performance measures or metrics.

Course Contents:
Basic techniques of system performance evaluation. Performance modelling. Discrete event simulation. Verification and validation of simulation models. Analysis of simulation output data. Analysis of single-server queue. Analysis of queuing networks. Modelling of computer systems networks and other queuing or non-queuing systems. Comparing two or more systems. System tuning. Performance bottleneck identification. Characterizing the load on the system (workload characterization). Determining the number and size of components (capacity planning). Predicting the performance at future loads (forecasting). Queuing theory. Mean value analysis.' WHERE code = 'LAG-CSC 423' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Interpret the main concepts of advanced operating systems;
2. Proficient in details of operating systems and performance tuning;
3. Study classic systems papers that shaped the field;
4. Implement systems concepts like virtualization, client-server model;
5. Gain practical experience with systems programming, tools, and experimentation;
6. Gain experience with defining and refining a research project;
7. Present technical materials to others orally and in writing.

Course Contents:
Advanced concepts in process synchronization. Distributed systems – Distributed systems architectures. Theoretical foundations. Distributed file systems and Distributed coordination of processes – mutual exclusion, deadlock detection and agreement protocols. Distributed Resource management – file systems, shared memory, scheduling and mass storage. Fault tolerant and Recovery. Protection and Security. Hardware and software features that support these systems. Hardware concepts of distributed systems. Software concepts and design issues. Communication in distributed systems. Threads and thread usage. Multithreading operating system. Client-server model. Implementation of Client-server model. Remote procedure call. Synchronization in distributed systems. Clock synchronization. Mutual exclusion. Transaction and concurrent control. Deadlock in distributed systems. Processor Allocation. Real-time distributed systems. Distributed file systems.' WHERE code = 'LAG-CSC 425' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
The student is expected to have knowledge about:
1. The concept of telemedicine and e-health;
2. The history of telemedicine use;
3. Administrative standards used in the medical and healthcare sector;
4. Where and how telemedicine is used today;
5. The role of the computer scientist as a complement for medical practitioners;
6. Multi-disciplinary approach to problem solving;
7. Identifying specific problems in healthcare industry and bringing innovative solutions;
8. Advantages and limitations of telemedicine and e-health;
9. Handling medical data in ethical manners;
10. Medical image annotation and atlases creation.

Course Contents:
Introduction to Telemedicine and e-health. General Accepted Administrative Standards (Organizations, Health Professionals Clinical Standards Technical Standards). Telemedicine/Telehealth Terminology. Informatics. Mobile Telehealth. Pharmacy Solutions: (Telematics, Tele mentoring, Tele monitoring, Telepresence). Tele radiology and Picture Archiving and Communications Systems (PACs). DICOM. NEMA. HIPA. Compression. Anonymization and pseudomysation. Hospital information management system. Radiology information management systems. Remote Nursing. Drug usage and prescription management system. Ontology development.' WHERE code = 'LAG-CSC 427' AND department = 'Computer Science';

-- 400L Second Semester
UPDATE courses SET overview = 'Learning Outcomes:
1. state laws and regulations related to ethics;
2. identify and explain relevant codes of ethics for computing practice;
3. identify social and ethical issues in different areas of computing practice;
4. review real-life ethical cases and develop ethical resolutions and policies;
5. explain the consequences of ignoring and non-compliance with ethical provisions; and
6. develop a sound methodology in resolving ethical conflicts and crisis.

Course Contents:
Addresses social, ethical, legal and managerial issues in the application of Computer Science to the information technology industry. Through seminars and case studies, human issues confronting Computer Science graduates will be addressed. Topics include managerial and personal ethics, computer security, privacy, software reliability, personal responsibility for the quality of work, intellectual property, environment and health concerns, and fairness in the workplace.' WHERE code = 'CSC 402' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. demonstrate technical skills in Computer Science;
2. demonstrate generic transferable skills such as communication and team work;
3. produce a technical report in the chosen project;
4. defend the written project report; and
5. appreciate the art of carrying out full-fledged research.

Course Contents:
This is a continuation of CSC 497. This contains the implementation and the evaluation of the project. A formal written report, chapters 4-5 have to be approved by the supervisor. A final report comprising chapters 1 - 5 will be submitted to the department for final grading. An oral presentation is required.' WHERE code = 'CSC 498' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Work in small teams and build a financial application using practical software engineering principles and technologies;
2. Build a risk management framework after running a risk assessment;
3. Acquire skills using IT risk assessment tools like COBRA, FAIR Privacy, NIST PRAM;
4. Design functional financial software for commercial purposes;
5. Acquire problem-solving skills on Fintech software development;
6. Exhibit Flexibility and Adaptability.

Course Contents:
An overview of the market. The inner workings of commercial banks and Fintech companies. The market players. Fixed income and dynamic income markets. The role of software engineers in the financial sector. Software engineering principles. Risk assessment. Risk assessment tools and techniques. Risk management frameworks. Study of sample financial software projects. Case studies. Software project testing. Software project maintenance. Software project presentation demonstration.' WHERE code = 'LAG-CSC 416' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Explain the applications, areas, and graphic pipeline, display, and hardcopy technologies;
2. Apply and compare algorithms for drawing 2D images, aliasing, anti-aliasing, and half toning techniques;
3. Analyse and apply clipping algorithms and transformation on 2D images;
4. Solve problems on viewing transformations, projection and hidden surface removal algorithms;
5. Explain basic ray tracing algorithm, shading, shadows, curves, and surfaces;
6. Equipped with practical experience of 3D modelling tools.

Course Contents:
Media applications including user interfaces, audio and video editing, game engines, CAD, visualization, virtual reality. Digitization of analog data, resolution, and the limits of human perception. Standard media formats, including lossless and lossy formats. Additive and subtractive colour models (CMYK and RGB). Vector and raster representations of images. Animation as a sequence of still images. Double buffering. Rendering. Forward and backward rendering. Polygonal representation. Basic radiometry, similar triangles, and projection model. Affine and coordinate system transformations. Ray tracing. Visibility and occlusion. Texture mapping. Application of spatial data structures to rendering. Sampling and anti-aliasing. Scene graphs and the graphics pipeline. Basic geometric operations. Parametric polynomial curves and surfaces. Implicit representation of curves and surfaces. Approximation techniques such as Bezier curves, spline curves and NURB splines. Surface representation techniques including tessellation, mesh representation. Procedural models such as fractals, generative modelling, and L-systems. Constructive Solid Geometry (CSG) representation.' WHERE code = 'LAG-CSC 418' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Interpret the basic principles and operations of data structures;
2. Apply Hashing, Disjoint sets and String-Matching techniques;
3. Apply the concepts of advanced Trees and Graphs;
4. Analyse scenarios and choose appropriate Data Structure;
5. Develop programs for sorting;
6. Apply algorithm design techniques;
7. Implement graph traversal algorithms.

Course Contents:
Hashing – General Idea. Hash Function. Separate Chaining. Hash Tables without linked lists. Linear Probing. Quadratic Probing. Double Hashing. Rehashing. Hash Tables in the Standard Library. Universal Hashing. Extendible Hashing. Priority Queues (Heaps) – Model. Simple implementations of Heap. Binary Heap. Structure Property. Heap Order Property. Basic Heap Operations. Binomial Queues. Trees – AVL. Single Rotation, Double Rotation, B-Trees. Multi-way Search Trees – 2-3 Trees. Red-Black Trees. Graphs Algorithms. Elementary Graph Algorithms. Topological sort. Single Source Shortest Path Algorithms. Dijkstra''s. Bellman-Ford. All-Pairs Shortest Paths: Floyd-Warshall''s Algorithm. Disjoint Sets. Equivalence relation. Smart Union and Path compression algorithm. String Matching. The naive string-matching algorithm. The Rabin-Karp algorithm. The Knuth-Morris-Pratt algorithm.' WHERE code = 'LAG-CSC 420' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Explain the concept behind computer network;
2. Know the various address schemes;
3. Differentiate between switches, routers, and hubs;
4. Know network protocols and their usages;
5. Know what constitutes a computer network.

Course Contents:
Organization of the Internet. Switching techniques. Physical pieces of a network, including hosts, routers, switches, ISPs, wireless, LAN, access point, and firewalls. Layering principles. Roles of the different layers. Naming and address schemes (DNS, IP addresses, etc.). Distributed applications (client/server, peer-to-peer, cloud, etc.). HTTP. Multiplexing with TCP and UDP. Socket APIs. Error control. Flow control TCP. Routing versus forwarding. Static routing. Internet Protocol (IP). Scalability issues (hierarchical addressing). Multiple Access Problem. Common approaches to multiple access. Local Area Networks. Ethernet. Switching. Fixed allocation versus dynamic allocation. End-to-end versus network assisted approaches. Fairness. Principles of congestion control. Approaches to congestion control.' WHERE code = 'LAG-CSC 422' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Describe computer architecture and organization, computer arithmetic, and CPU design;
2. Describe how numbers and characters are represented in a computer;
3. Have a detailed understanding of modern memory systems;
4. Describe I/O system and interconnection structures;
5. Draw a block diagram of the main parts of a computer;
6. Describe how a computer stores and retrieves information;
7. Identify high performance architecture design;
8. Familiar with hardware security measures;
9. Explain cache memory implementation;
10. Have a detailed understanding of parallel computer architectures;
11. Explain a wide variety of memory technologies;
12. Define bus, handshaking, serial, parallel, data rate;
13. Describe various data representations and arithmetic/logical operations.

Course Contents:
Distinction Between Computer Organization and Computer Architecture. History of Computers and Evolution of Intel Microprocessors. Working principles of microprocessor and Implementation of Interrupts. Computer Interconnection Structures. Bus Interconnection and PCI. Computer Memory System Overview. Cache Memory. Design Elements and Principles of Cache Design. Semiconductor Memories, RAM, ROM. Error Detection and Correction in Semiconductor Memories. Advanced DRAM Organization. External Memories. Magnetic Disk, RAID, Optical Memory. Magnetic Tape. External Devices, I/O Modules, I/O Processors. Direct Memory Access. Different External Interfaces. Operating System Overview. Scheduling of Processes. Memory Management. Arithmetic Logic Unit. Binary Integer Representation. Binary Integer Arithmetic. Binary Floating-Point Representation.' WHERE code = 'LAG-CSC 424' AND department = 'Computer Science';

UPDATE courses SET overview = 'Learning Outcomes:
1. Recall theoretical foundations of linear programming modelling;
2. Explain graphical, simplex, and analytical methods for optimization;
3. Identify appropriate optimization method for complex problems;
4. Demonstrate optimized material distribution using transportation model;
5. Find appropriate algorithm for allocation of resources;
6. Explain sequencing techniques for scheduling jobs on machines;
7. Identify equipment replacement techniques;
8. Apply game theory concepts to competitive situations;
9. Demonstrate selective inventory control models;
10. Explain dynamic programming for shortest path problems;
11. Develop queuing systems;
12. Identify methods for simulation of inventory and queuing problems.

Course Contents:
Development of Operation Research. Types of operation research models. Linear programming, problem formulation, graphical solution, simplex method, artificial variables techniques, two-phase method, big-M method. Transportation problem formulation. Assignment Problem formulation. Traveling Salesman Problem. Sequencing. Replacement of items. Theory of games. Inventory models. Waiting lines. Dynamic programming. Bellman''s Principle of optimality. Applications of dynamic programming. Introduction to simulation. Types of simulation models. Steps Involved in the Simulation Process. Application of Simulation to Queuing and Inventory.' WHERE code = 'LAG-CSC 426' AND department = 'Computer Science';
