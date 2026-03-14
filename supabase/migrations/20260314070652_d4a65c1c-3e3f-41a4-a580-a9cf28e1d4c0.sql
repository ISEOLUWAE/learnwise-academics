-- Add Week 11 material to ICT 201
INSERT INTO materials (course_id, title, type, link, content_text) VALUES
('ca315991-ea5c-40bc-b725-78114f252c36',
 'Week 11: Web Based Application and Information Systems in the Enterprise',
 'slide',
 '/materials/ict201/ICT_201_Week_11_Web_Based_Application_and_Information_Systems_in_the_Enterprise.pptx',
 'APPLICATION SERVICE PROVIDER (ASPS): Special web sites, called Application Service Providers (ASPs), allow access to their application programs. To use one of these Web-based applications, you would connect to the ASP, copy the application program to your computer system''s memory, and then run the application. Most ASPs provide access to a wide range of application programs and charge a fee for their services.

HOW WEB-BASED APPLICATION WORK: 1. Connect 2. Download 3. Run 4. Save and Exit 5. Remove Application

Connect: The user connects to a Web-site known as application service provider (ASPs). While some ASPs are free, most charge a fee to access and to use their applications.

Step 2: Download - The Application Service Provider (ASP) downloads or sends a copy of all or part of the requested application to the user. This copy is stored unto the user''s hard disk drive and is ready to be run.

Step 3: Run - The user runs the application form his hard disk drive.

Step 4: Save and Exit - When the user has completed work with the application, the created files can be saved on the user''s computer system and/or at the ASP.

Step 5: Remove Application - Once the user has exited the program, the program is automatically erased from his/her hard disk and is not available to be run again.

PROCEDURES OF USING WEB-BASED APPLICATION - Registration: Several ASP sites exist on the Web. Accessing Applications: Each time you connect to the WebOS site and log in, your Web-based desktop will appear. Web-Based Desktop: The Web-based desktop looks and operates like the traditional windows desktop.

FORCES BEHIND WEB-ENABLED SYSTEMS - Web-enablement: The tendency of systems developers to incorporate features of the Internet in enterprise systems. Widespread Use of Browsers. Flexibility through Plug-ins. Legacy System: Refers to the many mainframe, midrange, client/server or PC applications that are used to manage business functions. Interoperability: The perfect exchange of data and information in all forms between the individual components of an application. Heterogeneous Applications.

INFORMATION SYSTEM: A system in which data and information flow from one person or department to another. Enterprise Information System/Business Information System. Transaction-Processing System (TPS). Action Document. Detail Report/Transaction Log. Summary Report. Exception Report. Updated Master Data. Characteristics of TPS.

SECURITY: Security is the means of safeguarding and protecting an enterprise''s information technology assets. Types of Security: Site Security, Resource Security, Network Security, Service Security. Security Program. Harden. Types of Security Breach: Intrusion, Interception. Results of Security Breach. Denial-of-Services Attack. Internet Scam. Malicious programs (malware): viruses, worms, Trojan horse. Sources of Security Breach: Employees, Identity Theft, Computer Viruses, Hackers and Crackers, Organized Crime, Terrorists, Cyberterrorism. Security Measures. Security Policies and Procedures. Virus Protection Software. Digital Signature Encryption. Public Key Infrastructure (PKI). Secure Electronic Transaction (SET).'
);

-- Add theory questions from Week 11 verbatim
INSERT INTO theory_quiz_bank (course_id, question, reference_answer) VALUES
('ca315991-ea5c-40bc-b725-78114f252c36',
 'What are Application Service Providers (ASPs)?',
 'Special web sites, called Application Service Providers (ASPs), allow access to their application programs. To use one of these Web-based applications, you would connect to the ASP, copy the application program to your computer system''s memory, and then run the application. Most ASPs provide access to a wide range of application programs and charge a fee for their services.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'List and explain the five steps of how web-based applications work.',
 '1. Connect: The user connects to a Web-site known as application service provider (ASPs). While some ASPs are free, most charge a fee to access and to use their applications. 2. Download: The ASP downloads or sends a copy of all or part of the requested application to the user. 3. Run: The user runs the application from his hard disk drive. 4. Save and Exit: The created files can be saved on the user''s computer system and/or at the ASP. 5. Remove Application: Once the user has exited the program, the program is automatically erased from his/her hard disk.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What are the procedures of using web-based applications?',
 'Registration: Several ASP sites exist on the Web and some of their services are free. One of the best known site is WebOS. Their only requirement is that you register for their services. Accessing Applications: Each time you connect to the WebOS site and log in, your Web-based desktop will appear with numerous icons to access Web-based applications. Web-Based Desktop: The Web-based desktop looks and operates like the traditional windows desktop.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What is web-enablement and what are the forces behind web-enabled systems?',
 'Web-enablement is the tendency of systems developers to incorporate features of the Internet in enterprise systems. Forces include: Widespread Use of Browsers, Flexibility through Plug-ins (software programs that extend browser capabilities), Universal front-end application, and Legacy Systems.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'Define interoperability and heterogeneous applications.',
 'Interoperability is the perfect exchange of data and information in all forms (data, text, sound, and image, including animation) between the individual components of an application (hardware, software, and network). Heterogeneous Applications may be written in different programming languages, run on different types of computers, and use varying communications networks and transmission methods.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What is an Information System?',
 'An Information System is a system in which data and information flow from one person or department to another.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'Define Enterprise Information System and Transaction-Processing System (TPS).',
 'Enterprise Information System/Business Information System is used to refer to the family of IT applications that underlies the activities of running and managing a business. Transaction-Processing System (TPS) is a shared business information system that uses a combination of information communication technology and manual procedures to process data and information and to manage transactions.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'List and explain the types of TPS output and reports.',
 'Action Document: A document designed to trigger a specific action or to signify that a transaction has taken place. Detail Report/Transaction Log: A report describing each processed transaction. Summary Report: Shows the overall results of processing for a period of time. Exception Report: Lists unusual, erroneous, or unacceptable transactions or results. Updated Master Data: An adjustment of all records in response to a processed transaction.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'List the characteristics of Transaction Processing Systems (TPS).',
 'Processes high volume of similar business transactions, Supports multiple users in routine everyday transactions, Use relatively simple procedures to control processing and to ensure accuracy, Produces documents and reports, Updates files and databases.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'Define security in the context of information technology and list the types of security.',
 'Security is the means of safeguarding and protecting an enterprise''s information technology assets, by keeping away from criminals, natural hazards, and other threats, while a breach is a breakdown in security. Types: Site Security, Resource Security, Network Security, Service Security.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What is a Security Program and what does it mean to harden a system?',
 'A Security Program defines the policies and protective measures that will be used, the responsibilities of individuals involved in maintaining security. To Harden means designing a security program to a potential IT target, making the level of effort greater than the value of breaking into a system, network, or facility.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What are the types of security breaches?',
 'Intrusion: Forced and unauthorized entry into a system. Interception: Aimed at preventing the capture of data and information transmitted over an enterprise network or other communications link.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'List and explain the results of a security breach.',
 'Destruction of Resources, Corruption of Data and Applications, Denial of Services, Theft of Services, Theft of Resources. Denial-of-Services Attack deprives an enterprise of services they would normally expect. Internet Scam: fraudulent acts designed to trick individuals into spending their time and money with little or no return.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What are malicious programs (malware)? Explain viruses, worms, and Trojan horses.',
 'Malicious programs (malware) include viruses, worms, and Trojan horse. Viruses migrate through networks and operating systems and most attached to programs and databases. Worms are special viruses that self replicate to slow or stop a computer''s operation. Trojan Horses are programs that come into a computer system disguised as something else and deposit viruses onto unsuspecting computer systems.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'List the sources of security breaches.',
 'Employees (insiders who gain access without permission), Identity Theft, Computer Viruses, Hackers and Crackers (hackers for fun, crackers for malicious purposes), Organized Crime, Terrorists, and Cyberterrorism.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What are the security measures and security policies used to protect enterprise systems?',
 'Security measures: encrypting messages, restricting access through passwords and firewalls, anticipating disasters (hot sites and cold sites), backing up data. Security Policies: Change access passwords frequently, Restrict system use, Limit access to data, Set up physical access controls, Partition responsibilities, Encrypt data, Establish procedural controls, Institute educational programs, Audit system activities, Log all transactions.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'Explain Public Key Infrastructure (PKI) and Secure Electronic Transaction (SET).',
 'PKI: A public key is made available in a directory that all parties can search. A sender searches a digital certificate directory to find the recipient''s public key, using it to encrypt the message. SET: An adaptation of public key encryption and the digital certificate (electronic wallet) for securing financial transactions over the Internet.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What is a Legacy System?',
 'Legacy System refers to the many mainframe, midrange, client/server or PC applications that are used to manage business functions.'),

('ca315991-ea5c-40bc-b725-78114f252c36',
 'What is Digital Signature Encryption?',
 'Digital Signature Encryption relies on a mathematical coding scheme designed to foil a virus''s attempt to attack programs and data.');
